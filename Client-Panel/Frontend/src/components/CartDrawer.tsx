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
      className={`fixed top-0 right-0 h-full w-[90vw] sm:w-[70vw] md:w-[50vw] lg:w-[40vw] xl:w-[30vw] bg-[#F5F5DC] shadow-lg z-50 border-l border-black rounded-md flex flex-col transition-transform duration-300 transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex justify-between items-center p-3 sm:p-4 border-b-2 border-black">
        <h2 className="text-base sm:text-lg font-bold text-black textheading uppercase">Your Cart</h2>
        <button
          onClick={onClose}
          className="text-xl sm:text-2xl text-red-300 hover:text-red-400 cursor-pointer transition"
        >
          <IoClose />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {cartLoading ? (
          <div className="text-center bg-transparent "><Loading/></div>
        ) : cartError ? (
          <div className="text-center text-red-600">{cartError}</div>
        ) : cartItems.length === 0 ? (
          <div className="text-center text-black font-semibold navfonts text-base sm:text-lg flex justify-center items-center uppercase flex-col gap-6 sm:gap-10">
            <img src={cartempty} alt="Empty Cart" className="w-32 sm:w-40 h-auto" />
            <p>Your cart is empty</p>
            <p className="text-sm sm:text-base font-normal normal-case">Add some products to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item, index) => (
              <div key={`${item.productId}-${item.size}-${index}`} className="border border-gray-300 rounded-lg p-3 sm:p-4 bg-white shadow-sm">
                <div className="flex items-center gap-5 justify-center">
                  <img
                    src={item.product.imageUrls[0]}
                    alt={item.product.name}
                    className="w-28 sm:w-20 h-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-black text-sm sm:text-base truncate">{item.product.name}</h3>
                    <p className="text-gray-600 text-sm">Size: {item.size}</p>
                    <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                    <p className="font-bold text-black text-sm sm:text-base">₹{item.product.price}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item.productId, item.size)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1 cursor-pointer"
                    aria-label="Remove item"
                  >
                    <svg className="w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {cartItems.length > 0 && (
        <div className="border-t-2 border-black p-3 sm:p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-black text-lg">Total:</span>
            <span className="font-bold text-black text-lg">
              ₹{cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)}
            </span>
          </div>
          <button
            onClick={onCheckout}
            className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:scale-105 transition-transform text-base sm:text-lg cursor-pointer"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default CartDrawer;