/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import Loading from "./Loading";
import emplywish from '@/assets/wishlist.gif'

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface WishlistItem {
  productId: string;
  size: string;
  product: {
    name: string;
    price: number;
    imageUrls: string[];
  };
}

interface WishlistDrawerProps {
  isOpen: boolean;
  user: { name: string; email: string } | null;
  onClose: () => void;
}

const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ isOpen, user, onClose }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState<Record<string, boolean>>({});
  const [isRemoving, setIsRemoving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/wishlist`, { withCredentials: true });
        if (Array.isArray(res.data)) {
          setWishlist(res.data);
          console.log("Wishlist API response:", res.data);
        } else {
          console.error("Invalid wishlist response, expected array:", res.data);
          setError("Invalid wishlist data");
        }
      } catch (err: any) {
        console.error("Wishlist API error:", err.response?.data?.message || err.message);
        setError("Failed to load wishlist. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [isOpen, user]);

  const handleAddToCart = async (productId: string, size: string) => {
    if (isMoving[productId + size]) return;
    setIsMoving((prev) => ({ ...prev, [productId + size]: true }));

    try {
      await axios.post(
        `${API_BASE}/wishlist/add-to-cart`,
        { productId, size },
        { withCredentials: true }
      );
      console.log(`Moved product ${productId} (size: ${size}) to cart`);
      setWishlist((prev) => prev.filter((item) => !(item.productId === productId && item.size === size)));
    } catch (err: any) {
      console.error("Move to cart error:", err.response?.data?.message || err.message);
      alert("Failed to move item to cart. Please try again.");
    } finally {
      setIsMoving((prev) => ({ ...prev, [productId + size]: false }));
    }
  };

  const handleRemove = async (productId: string, size: string) => {
    if (isRemoving[productId + size]) return;
    setIsRemoving((prev) => ({ ...prev, [productId + size]: true }));

    try {
      await axios.delete(`${API_BASE}/wishlist/${productId}`, {
        data: { size },
        withCredentials: true,
      });
      console.log(`Removed product ${productId} (size: ${size}) from wishlist`);
      setWishlist((prev) => prev.filter((item) => !(item.productId === productId && item.size === size)));
    } catch (err: any) {
      console.error("Remove from wishlist error:", err.response?.data?.message || err.message);
      alert("Failed to remove item from wishlist. Please try again.");
    } finally {
      setIsRemoving((prev) => ({ ...prev, [productId + size]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end ">
      <div
        className="absolute inset-0 bg-transparent bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg inset-0 bg-[#F5F5DC] h-full shadow-lg flex flex-col z-50 rounded-md border border-black">
        <div className="flex justify-between items-center p-3 sm:p-4 border-b-2 border-black">
          <h2 className="text-lg sm:text-xl font-bold textheading text-black uppercase">Your Wishlist</h2>
          <button onClick={onClose} className="text-xl sm:text-2xl text-red-300 hover:text-red-400 cursor-pointer">
            <IoClose />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 ">
          {loading && <div className="text-center flex flex-col justify-center items-center"><Loading/></div>}
          {error && <div className="text-center text-red-500 text-sm sm:text-base">{error}</div>}
          {!loading && !error && wishlist.length === 0 && (
            <div className="text-center text-black navfonts font-semibold text-base sm:text-lg flex justify-center items-center uppercase flex-col gap-6 sm:gap-10">
              Your wishlist is empty.
              <img src={emplywish} alt="" className="w-40 sm:w-60"/>
            </div>
          )}
          {!loading &&
            !error &&
            wishlist.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-b-1 border-black"
              >
                <img
                  src={item.product.imageUrls[0] || "https://via.placeholder.com/100"}
                  alt={item.product.name}
                  className="w-16 sm:w-20 h-16 sm:h-20 object-cover rounded-md border border-purple-300 text-sm flex flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-semibold navfonts text-black line-clamp-2">{item.product.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Size: {item.size}</p>
                  <p className="text-xs sm:text-sm font-bold text-black">₹{item.product.price}</p>
                </div>
                <div className="flex flex-col gap-1 sm:gap-2">
                  <button
                    className="relative group bg-transparent outline-none cursor-pointer uppercase navfonts"
                    onClick={() => handleAddToCart(item.productId, item.size)}
                    disabled={isMoving[item.productId + item.size]}
                  >
                    <span className="absolute top-0 left-0 w-full h-full bg-[#101A13] bg-opacity-30 rounded-lg transform translate-y-0.5 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:translate-y-1 group-hover:duration-250 group-active:translate-y-px"></span>
                    <div className="relative flex items-center justify-center py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm text-black rounded-lg transform -translate-y-1 bg-white transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:-translate-y-1.5 group-hover:duration-250 group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110 shadow-md border-2 border-[#101A13] hover:border-purple-500 active:border-purple-700">
                      {isMoving[item.productId + item.size] ? "Moving..." : "Add to Cart"}
                    </div>
                  </button>
                  <button
                    className="text-xs sm:text-sm text-red-500 hover:text-red-700 navfonts cursor-pointer"
                    onClick={() => handleRemove(item.productId, item.size)}
                    disabled={isRemoving[item.productId + item.size]}
                  >
                    {isRemoving[item.productId + item.size] ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistDrawer;