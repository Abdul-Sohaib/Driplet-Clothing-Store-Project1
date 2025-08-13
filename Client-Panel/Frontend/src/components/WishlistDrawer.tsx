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

    const fetchWishlist = async (retryCount = 0) => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE}/wishlist`, { withCredentials: true });
        if (Array.isArray(res.data)) {
          setWishlist(res.data);
          console.log("Wishlist API response:", res.data);
        } else {
          throw new Error(res.data.message || "Invalid wishlist response");
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "Failed to load wishlist.";
        console.error("Wishlist API error:", errorMessage);
        if ((errorMessage.includes("Network Error") || errorMessage.includes("CORS")) && retryCount < 3) {
          setTimeout(() => fetchWishlist(retryCount + 1), Math.pow(2, retryCount) * 1000); // Exponential backoff
          return;
        }
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
      setError("Failed to move item to cart. Please try again.");
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
      setError("Failed to remove item from wishlist. Please try again.");
    } finally {
      setIsRemoving((prev) => ({ ...prev, [productId + size]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 backdrop-blur-md bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="w-full xs:w-[90vw] sm:w-[70vw] md:w-[50vw] lg:w-[40vw] xl:w-[30vw] bg-[#F5F5DC] h-full shadow-lg flex flex-col z-50 rounded-md border border-black transition-transform duration-300 ease-in-out">
        <div className="flex justify-between items-center p-2 xs:p-3 sm:p-4 border-b-2 border-black">
          <h2 className="text-sm xs:text-base sm:text-lg font-bold textheading text-black uppercase">Your Wishlist</h2>
          <button onClick={onClose} className="text-lg xs:text-xl sm:text-2xl text-red-300 hover:text-red-400 transition p-1 touch-manipulation cursor-pointer">
            <IoClose />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 xs:p-3 sm:p-4">
          {loading && <div className="text-center flex flex-col justify-center items-center"><Loading /></div>}
          {error && <div className="text-center text-red-500 text-xs xs:text-sm sm:text-base">{error}</div>}
          {!loading && !error && wishlist.length === 0 && (
            <div className="text-center text-black navfonts font-semibold text-sm xs:text-base sm:text-lg flex justify-center items-center uppercase flex-col gap-4 xs:gap-6 sm:gap-8">
              Your wishlist is empty.
              <img src={emplywish} alt="Empty Wishlist" className="w-24 xs:w-28 sm:w-32 h-auto" loading="lazy" />
            </div>
          )}
          {!loading &&
            !error &&
            wishlist.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex items-center gap-2 xs:gap-3 sm:gap-4 p-2 xs:p-3 sm:p-4 border-b-1 border-black"
              >
                <img
                  src={item.product.imageUrls[0] || "/placeholder.jpg"}
                  alt={item.product.name}
                  className="w-12 xs:w-14 sm:w-16 h-12 xs:h-14 sm:h-16 object-cover rounded-md border border-purple-300 flex-shrink-0"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = "/placeholder.jpg"; }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs xs:text-sm font-semibold navfonts text-black line-clamp-2">{item.product.name}</h3>
                  <p className="text-xs xs:text-sm text-gray-600">Size: {item.size}</p>
                  <p className="text-xs xs:text-sm font-bold text-black">₹{item.product.price}</p>
                </div>
                <div className="flex flex-col gap-1 xs:gap-2">
                  <button
                    className="relative group bg-transparent outline-none cursor-pointer uppercase navfonts text-xs xs:text-sm"
                    onClick={() => handleAddToCart(item.productId, item.size)}
                    disabled={isMoving[item.productId + item.size]}
                  >
                    <span className="absolute top-0 left-0 w-full h-full bg-[#101A13] bg-opacity-30 rounded-lg transform translate-y-0.5 transition duration-300 ease-out group-hover:translate-y-1 group-active:translate-y-px"></span>
                    <div className="relative flex items-center justify-center py-1 xs:py-2 px-2 xs:px-3 sm:px-4 text-xs xs:text-sm text-black rounded-lg transform -translate-y-1 bg-white transition duration-300 ease-out group-hover:-translate-y-1.5 group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110 shadow-md border-2 border-[#101A13] hover:border-purple-500 active:border-purple-700 touch-manipulation">
                      {isMoving[item.productId + item.size] ? "Moving..." : "Add to Cart"}
                    </div>
                  </button>
                  <button
                    className="text-xs xs:text-sm text-red-500 hover:text-red-700 navfonts cursor-pointer touch-manipulation"
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