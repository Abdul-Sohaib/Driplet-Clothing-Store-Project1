/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import Loading from "./Loading";
import cartempty from '@/assets/shopping-cart.gif'

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface CartItem {
  productId: string;
  quantity: number;
  size: string;
  product: {
    name: string;
    price: number;
    imageUrls: string[];
  };
}

interface CartDrawerProps {
  isOpen: boolean;
  user: { name: string; email: string } | null;
  onClose: () => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, user, onClose, onCheckout }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      const fetchCart = async () => {
        setCartLoading(true);
        setCartError(null);
        try {
          const res = await axios.get(`${API_BASE}/cart`, {
            withCredentials: true,
          });
          console.log("Cart API response:", res.data);
          if (Array.isArray(res.data)) {
            setCartItems(res.data);
            console.log("Cart items fetched:", res.data);
          } else {
            setCartError(res.data.message || "Failed to load cart items.");
            setCartItems([]);
            console.log("Invalid cart response, expected array:", res.data);
          }
        } catch (err) {
          const errorMessage = (err as any).response?.data?.message || (err as any).message || "Failed to load cart items.";
          console.error("Cart fetch error:", errorMessage);
          setCartError(errorMessage);
          setCartItems([]);
        } finally {
          setCartLoading(false);
        }
      };
      fetchCart();
    }
  }, [isOpen, user]);

  const handleRemoveFromCart = async (productId: string, size: string) => {
    try {
      await axios.delete(`${API_BASE}/cart/${productId}`, {
        data: { size },
        withCredentials: true,
      });
      setCartItems(cartItems.filter((item) => !(item.productId === productId && item.size === size)));
      console.log(`Removed product ${productId} (size: ${size}) from cart`);
    } catch (err) {
      const errorMessage = (err as any).response?.data?.message || (err as any).message || "Failed to remove item from cart.";
      console.error("Remove from cart error:", errorMessage);
      setCartError(errorMessage);
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[40vw] md:w-[30vw]  bg-[#F5F5DC] shadow-lg z-50 border-l border-black rounded-md flex flex-col transition-transform duration-300 transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b-2 border-black">
        <h2 className="text-lg font-bold text-black  textheading uppercase">Your Cart</h2>
        <button
          onClick={onClose}
          className="text-2xl text-red-300 hover:text-red-400 cursor-pointer transition"
        >
          <IoClose />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {cartLoading ? (
          <div className="text-center bg-transparent "><Loading/></div>
        ) : cartError ? (
          <div className="text-center text-red-600">{cartError}</div>
        ) : cartItems.length === 0 ? (
          <div className="text-center text-black font-semibold navfonts text-lg  flex justify-center items-center uppercase  flex-col gap-10">
            your cart is empty
            <img src={cartempty} alt="" className="w-60"/>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {cartItems.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex items-center gap-4 border-b-1 border-black pb-4 navfonts"
              >
                <img
                  src={item.product.imageUrls[0] || "/placeholder.jpg"}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-md"
                  onError={() => console.error(`Failed to load cart item image: ${item.product.imageUrls[0]}`)}
                />
                <div className="flex-1 navfonts">
                  <p className="text-sm font-semibold text-black navfonts">{item.product.name}</p>
                  <p className="text-sm text-gray-600">Size: {item.size}</p>
                  <p className="text-sm text-gray-600">₹{item.product.price} x {item.quantity}</p>
                  <p className="text-sm text-green-600 navfonts font-semibold">
                    Total: ₹{item.product.price * item.quantity}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveFromCart(item.productId, item.size)}
                  className="relative group bg-transparent outline-none cursor-pointer uppercase"
                >
                  <span className="absolute top-0 left-0 w-full h-full bg-[#101A13] bg-opacity-30 rounded-lg transform translate-y-0.5 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:translate-y-1 group-hover:duration-250 group-active:translate-y-px"></span>
                  <div className="relative flex items-center justify-center py-2 px-4 text-sm text-black rounded-lg transform -translate-y-1 bg-white transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:-translate-y-1.5 group-hover:duration-250 group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110 shadow-md border-2 border-[#101A13] hover:border-purple-500 active:border-purple-700">
                    <span className="select-none text-xs navfonts font-semibold text-red-400">Remove</span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {cartItems.length > 0 && (
        <div className="p-4 border-t border-purple-300">
          <p className="text-lg font-bold text-green-600 navfonts">
            Total: ₹{cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)}
          </p>
          <button
            className="relative group bg-transparent outline-none cursor-pointer uppercase w-full mt-2"
            onClick={onCheckout}
          >
            <span className="absolute top-0 left-0 w-full h-full bg-[#101A13] bg-opacity-30 rounded-lg transform translate-y-0.5 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:translate-y-1 group-hover:duration-250 group-active:translate-y-px"></span>
            <div className="relative flex items-center justify-center py-3 px-6 text-lg text-black rounded-lg transform -translate-y-1 bg-white gap-3 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:-translate-y-1.5 group-hover:duration-250 group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110 shadow-md border-2 border-[#101A13] hover:border-purple-500 active:border-purple-700">
              <span className="select-none text-sm navfonts font-semibold">Checkout</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default CartDrawer;