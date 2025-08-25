import { getProducts } from "@/lib/utils";
import { Product, StateContextType } from "@/types/types";
import {  ReactNode, useReducer } from "react";
import { createContext } from "vm";
import { reducer, initialState } from "@/reducer/reducer";

export const context = createContext(undefined);

function ProductContext({children}: {children: ReactNode}) {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <context.Provider value={{state,dispatch}}>
            {children}
        </context.Provider>
    )
}