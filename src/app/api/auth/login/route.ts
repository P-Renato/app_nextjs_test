import { NextRequest, NextResponse } from "next/server";
import { RegisteredUser } from "@/types/types";
import { promises as fs } from 'fs';
import path from 'path';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';



const dataFilePath = path.join(process.cwd(), 'src/data/users.json');

async function getUsers(): Promise<RegisteredUser[]> {
    try {
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        if(fileContents.trim() === "") {
            return [];
        }
        return JSON.parse(fileContents);
    } catch (err) {
        return []
    }
}

export async function POST(request: NextRequest) {
    try{
        const body = await request.json();
        const { username, password } = body;

        if(!username || !password){
            return NextResponse.json({error: "Failed request"}, {status: 400});
        }
        const users = await getUsers();
        const user = users.find(u=>u.username === username);
        if(!user){
            return NextResponse.json({error: "Invalid creential --- !user"}, {status: 401})
        }
        const isPasswordValid = await compare(password, user.password);
        if(!isPasswordValid) {
            return NextResponse.json({error: "Invalid credentials --!password"}, {status: 401})
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '2m' }
        );                                                          

        const response = NextResponse.json(
            {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
                message: "User logged in successfully!"
            },
            {status: 201},
        );

        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60, 
            path: '/',
        });

        return response;
    }
    catch (err) {
        console.error("Login Error: ", err);
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}