import { createContext } from "react";

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string | number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  toggleCart: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined); 