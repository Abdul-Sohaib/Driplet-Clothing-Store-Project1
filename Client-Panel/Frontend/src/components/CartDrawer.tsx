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
      const fetchCart = async (retryCount = 0) => {
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
            throw new Error(res.data.message || "Invalid cart response");
          }
        } catch (err) {
          const errorMessage = (err as any).response?.data?.message || (err as any).message || "Failed to load cart items.";
          console.error("Cart fetch error:", errorMessage);
          if ((errorMessage.includes("Network Error") || errorMessage.includes("CORS")) && retryCount < 3) {
            setTimeout(() => fetchCart(retryCount + 1), Math.pow(2, retryCount) * 1000); // Exponential backoff
            return;
          }
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
      className={`fixed top-0 right-0 h-full w-[100vw] xs:w-[90vw] sm:w-[70vw] md:w-[50vw] lg:w-[40vw] xl:w-[30vw] bg-[#F5F5DC] shadow-lg z-50 border-l border-black rounded-md flex flex-col transition-transform duration-300 ease-in-out transform backdrop-blur-md ${
        isOpen ? "translate-x-0 " : "translate-x-full  "
      }`}
    >
      <div className="flex justify-between items-center p-2 xs:p-3 sm:p-4 border-b-2 border-black ">
        <h2 className="text-sm xs:text-base sm:text-lg font-bold text-black textheading uppercase">Your Cart</h2>
        <button
          onClick={onClose}
          className="text-lg xs:text-xl sm:text-2xl text-red-300 hover:text-red-400  transition p-1 touch-manipulation cursor-pointer"
        >
          <IoClose />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 xs:p-3 sm:p-4">
        {cartLoading ? (
          <div className="text-center bg-transparent"><Loading /></div>
        ) : cartError ? (
          <div className="text-center text-red-600 text-sm xs:text-base">{cartError}</div>
        ) : cartItems.length === 0 ? (
          <div className="text-center text-black font-semibold navfonts text-sm xs:text-base sm:text-lg flex justify-center items-center uppercase flex-col gap-4 xs:gap-6 sm:gap-8">
            <img src={cartempty} alt="Empty Cart" className="w-20 xs:w-24 sm:w-28 h-auto" loading="lazy" />
            <p>Your cart is empty</p>
            <p className="text-xs xs:text-sm sm:text-base font-normal normal-case">Add some products to get started!</p>
          </div>
        ) : (
          <div className="space-y-3 xs:space-y-4">
            {cartItems.map((item, index) => (
              <div key={`${item.productId}-${item.size}-${index}`} className="border border-gray-300 rounded-lg p-2 xs:p-3 sm:p-4 bg-white shadow-sm">
                <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 justify-center">
                  <img
                    src={item.product.imageUrls[0] || "/placeholder.jpg"}
                    alt={item.product.name}
                    className="w-16 xs:w-14 sm:w-16 h-16 xs:h-14 sm:h-16 object-cover rounded-lg flex-shrink-0"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = "/placeholder.jpg"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-black text-xs xs:text-sm sm:text-base truncate">{item.product.name}</h3>
                    <p className="text-gray-600 text-xs xs:text-sm">Size: {item.size}</p>
                    <p className="text-gray-600 text-xs xs:text-sm">Quantity: {item.quantity}</p>
                    <p className="font-bold text-black text-xs xs:text-sm sm:text-base">₹{item.product.price}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item.productId, item.size)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1 xs:p-2 touch-manipulation cursor-pointer"
                    aria-label="Remove item"
                  >
                    <svg className="w-5 xs:w-6 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="border-t-2 border-black p-2 xs:p-3 sm:p-4">
          <div className="flex justify-between items-center mb-3 xs:mb-4">
            <span className="font-bold text-black text-sm xs:text-base sm:text-lg">Total:</span>
            <span className="font-bold text-black text-sm xs:text-base sm:text-lg">
              ₹{cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)}
            </span>
          </div>
          <button
            onClick={onCheckout}
            className="w-full bg-black text-white py-2 xs:py-3 px-4 rounded-lg font-semibold hover:scale-105 transition-transform text-sm xs:text-base sm:text-lg touch-manipulation"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default CartDrawer;