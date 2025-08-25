


export type RegisteredUser =  {
    id: number,
    username: string,
    email: string,
    password: string,
    
}

export type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  price: number;
  rating:{
    rate: number;
    count: number;
  }
}

export type State = {
    product: Product[];
    cart: Product[];
}

export type Action = {
    type: string,
    payload?: any, 
}

export type StateContextType = {
    state: State;
    dispatch: React.Dispatch<Action>;
}