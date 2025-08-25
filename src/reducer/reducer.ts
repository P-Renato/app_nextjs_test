import { Action, State, Product } from "@/types/types";

export const initialState = {
    cart: [],
    product: [],
}

export const reducer = (state: State, action: Action): State => {
    const newState = structuredClone(state);

    switch(action.type) {
        case 'ADD_TO_CART':
            newState.cart.push(action.payload);

            fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify(action.payload),
            });
            return newState;

        default: 
            return state;
    }
}