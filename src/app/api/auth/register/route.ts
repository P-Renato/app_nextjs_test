import { NextRequest, NextResponse } from "next/server";
import { RegisteredUser } from "@/types/types";
import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
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

export async function POST(request: NextRequest){
    try{
        const body = await request.json();
        const { username, email, password, confirmPassword } = body;
        
        if(!username || !email || !password || !confirmPassword ) {
            return NextResponse.json({error: "Failed request"})
        }
        if (password !== confirmPassword) {
            return NextResponse.json(
                { error: "Password and confirmation password do not match" },
                { status: 400 } 
            );
        }
        const users = await getUsers();

        const usersExist = users.some(u=> u.username === username);
        if(usersExist){
            return NextResponse.json({error: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 11);

        const newId = users.length > 0 ? Math.max(...users.map(user=>user.id)) + 1 : 1;

        const newUser : RegisteredUser = {
            id: newId,
            username: username,
            email: email,
            password: hashedPassword,
            
        }

        
        users.push(newUser);
        
        await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2));
        
        const token = jwt.sign(
            {userId: newUser.id, email: newUser.email},
            process.env.JWT_SECRET!,
            {expiresIn: '2m'}
        )
        const response = NextResponse.json(
            {
                user: {
                    id: newUser.id,
                    username: username,
                    email: email
                },
                message: "User registered successfully!"
            }, {status: 201}
        );

        response.cookies.set({
            name: "token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60,
            path: '/',
        });
        return response;
    } catch( err ){
        console.error("Registration error: ", err);
        return NextResponse.json({error: "Internal server error"})
    }
}