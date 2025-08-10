/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { AiFillStar } from "react-icons/ai";
import { IoCartOutline } from "react-icons/io5";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import { toast } from "react-toastify";
import cartgif from '@/assets/load.gif';
import wishlistlike from '@/assets/wishlist.png';
import { motion, type Variants } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Product {
  id: string | number;
  name: string;
  description: string;
  category: string;
  color?: string;
  fabric?: string;
  gender?: "Men" | "Women" | "Unisex";
  variants: {
    price: number;
    imageUrls: string[];
    sizes: { size: string; stock: number }[];
  }[];
}

const Bestseller_cards = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const imageIndex = useRef<Record<number, number>>({});
  const imageRefs = useRef<Record<number, HTMLDivElement>>({});
  const timers = useRef<Record<number, ReturnType<typeof setInterval>>>({});
  const direction = useRef<Record<number, "forward" | "backward">>({});
  const navigate = useNavigate();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string | null>>({});
  const [isAdding, setIsAdding] = useState<Record<string, boolean>>({});
  const [isWishlisting, setIsWishlisting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE}/products`, {
          withCredentials: true,
        });
        const mockProducts = res.data.slice(0, 4).map((p: Product) => ({
          ...p,
          color: p.color || ["Red", "Blue", "Green"][Math.floor(Math.random() * 3)],
          fabric: p.fabric || ["Cotton", "Polyester", "Silk"][Math.floor(Math.random() * 3)],
          gender: p.gender || ["Men", "Women", "Unisex"][Math.floor(Math.random() * 3)],
        }));
        setProducts(mockProducts);
        setError(null);
      } catch (err: any) {
        console.error("Fetch products error:", err.response?.data?.message || err.message);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const startCarousel = (index: number, totalImages: number) => {
    stopCarousel(index);

    if (totalImages <= 1) return;

    if (!direction.current[index]) {
      direction.current[index] = "forward";
    }

    timers.current[index] = setInterval(() => {
      const container = imageRefs.current[index];
      if (!container) return;

      let current = imageIndex.current[index] ?? 0;

      if (direction.current[index] === "forward") {
        current += 1;
        if (current >= totalImages - 1) {
          direction.current[index] = "backward";
        }
      } else {
        current -= 1;
        if (current <= 0) {
          direction.current[index] = "forward";
        }
      }

      imageIndex.current[index] = current;

      gsap.to(container, {
        x: `-${current * 100}%`,
        duration: 0.6,
        ease: "power2.inOut",
      });
    }, 2000);
  };

  const stopCarousel = (index: number) => {
    clearInterval(timers.current[index]);
    delete timers.current[index];
  };

  const slideUp: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.42, 0, 0.58, 1] as [number, number, number, number],
      },
    },
  };

  const handleAddToCart = async (productId: string | number, _productName: string) => {
    if (isAdding[productId]) return;
    setIsAdding((prev) => ({ ...prev, [productId]: true }));

    const size = selectedSizes[productId];
    if (!size) {
      toast.error("Please select a size before adding to cart.");
      setIsAdding((prev) => ({ ...prev, [productId]: false }));
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const res = await axios.post(
        `${API_BASE}/cart`,
        { productId, quantity: 1, size },
        { withCredentials: true }
      );
      console.log(`Added product ${productId} (size: ${size}) to cart`, res.data);
      toast.success("Added to cart!");
      // Fetch updated cart
      await axios.get(`${API_BASE}/cart`, { withCredentials: true });
      // Note: Cart state is managed elsewhere (e.g., App.tsx), so no setCartItems here
    } catch (err) {
      console.error("Add to cart error:", (err as any).response?.data?.message || (err as any).message);
      toast.error("Failed to add item to cart. Please try again.");
    } finally {
      setIsAdding((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddToWishlist = async (productId: string | number, _productName: string) => {
    if (isWishlisting[productId]) return;
    setIsWishlisting((prev) => ({ ...prev, [productId]: true }));

    const size = selectedSizes[productId];
    if (!size) {
      toast.error("Please select a size before adding to wishlist.");
      setIsWishlisting((prev) => ({ ...prev, [productId]: false }));
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const res = await axios.post(
        `${API_BASE}/wishlist`,
        { productId, size },
        { withCredentials: true }
      );
      console.log(`Added product ${productId} (size: ${size}) to wishlist`, res.data);
      toast.success("Added to wishlist!");
    } catch (err) {
      console.error("Add to wishlist error:", (err as any).response?.data?.message || (err as any).message);
      toast.error("Failed to add item to wishlist. Please try again.");
    } finally {
      setIsWishlisting((prev) => ({ ...prev, [productId]: false }));
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="text-center text-red-500 text-sm sm:text-base">{error}</div>;
  if (products.length === 0) return <div className="text-center text-gray-600 text-sm sm:text-base">No products available.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-3 sm:px-4">
      {products.map((product, index) => {
        let images = product.variants[0]?.imageUrls || [];
        if (!images || images.length === 0) {
          console.log(`Variant 0 has no images for product ${product.id}, falling back to Variant 1`);
          images = product.variants[1]?.imageUrls || [];
          if (!images || images.length === 0) {
            console.log(`Variant 1 also has no images for product ${product.id}, using empty array`);
          } else {
            console.log(`Using Variant 1 images for product ${product.id}:`, images);
          }
        } else {
          console.log(`Using Variant 0 images for product ${product.id}:`, images);
        }

        const price = product.variants[0]?.price || 0;
        const mrp = price + 650;
        const discount = Math.floor(((mrp - price) / mrp) * 100);
        const totalStock = product.variants.reduce(
          (total, variant) => total + variant.sizes.reduce((sum, s) => sum + s.stock, 0),
          0
        );

        return (
          <motion.div
            key={product.id}
            variants={slideUp}
            transition={{ delay: index * 0.2 }}
            initial="hidden"
            animate="visible"
            className="group border-2 border-[#101A13] rounded-xl bg-[#FAF3E0] shadow-md hover:shadow-xl transition duration-300 overflow-hidden cursor-pointer h-fit"
            onMouseEnter={() => startCarousel(index, images.length)}
            onMouseLeave={() => stopCarousel(index)}
            onClick={() => navigate(`/product/${product.id}`)}
          >
            
            {images.length > 0 ? (
  images.map((img, i) => (
    <div key={i} className="relative w-full h-full flex-shrink-0 rounded-lg border-1 border-black overflow-hidden">
      {/* BEST SELLER Tag */}
      <div className="text-xs font-bold button-55 text-black bg-transparent w-fit text-center p-1 navfonts border-purple-400 absolute top-1 left-1 z-10 navfonts">
        BEST SELLER
      </div>

      <img
        src={img}
        alt={`img-${i}`}
        className="w-full h-full object-contain object-center"
      />
    </div>
  ))
) : (
  <div className="w-full h-full flex items-center justify-center bg-gray-200">
    <span className="text-gray-600 font-semibold text-sm sm:text-base">No Image Available</span>
  </div>
)}


            <div className="flex justify-between px-2 sm:px-3 py-2 text-xs sm:text-sm items-center">
              <div className="flex items-center gap-1 text-orange-500">
                <AiFillStar className="text-[12px] sm:text-[14px]" />
                4.5 <span className="text-gray-600 ml-1">(241)</span>
              </div>
              <div className="text-xs button-55 text-black bg-transparent w-fit text-center p-1 font-bold navfonts">
                {totalStock} left
              </div>
            </div>

            <div className="px-2 sm:px-3 flex gap-2 items-center">
              <p className="text-base sm:text-lg font-semibold text-black">₹{price}</p>
              <p className="text-xs sm:text-sm line-through text-gray-500">₹{mrp}</p>
              <p className="text-xs sm:text-sm text-green-600 font-semibold">{discount}% OFF</p>
            </div>

            <div className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-800 line-clamp-2">
              {product.description}
            </div>

            <div
              className="mx-2 sm:mx-3 mb-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-1 sm:gap-2 flex-wrap mb-2">
                {product.variants[0]?.sizes.map((size, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSizes({ ...selectedSizes, [product.id]: size.size })}
                    className={`px-2 sm:px-3 py-1 border-2 rounded-md text-xs sm:text-sm font-semibold navfonts uppercase cursor-pointer ${
                      selectedSizes[product.id] === size.size
                        ? "border-purple-500 bg-purple-100 text-purple-600"
                        : size.stock > 0
                        ? "border-purple-300 text-black hover:bg-purple-50"
                        : "border-gray-300 text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={size.stock === 0}
                  >
                    {size.size}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-1 sm:gap-2 border-3 border-black rounded-lg overflow-hidden">
                <button
                  className="col-span-4 text-xs sm:text-sm font-semibold button-add rounded-md text-black navfonts cursor-pointer flex justify-center items-center gap-1 sm:gap-2 py-2"
                  onClick={() => handleAddToCart(product.id, product.name)}
                  disabled={isAdding[product.id]}
                >
                  {isAdding[product.id] ? (
                    <img src={cartgif} alt="Loading..." className="w-6 sm:w-8 md:w-10 bg-transparent " />
                  ) : (
                    <>
                      <IoCartOutline className="text-sm sm:text-base" />
                      <span className="hidden sm:inline">ADD TO CART</span>
                      <span className="sm:hidden">CART</span>
                    </>
                  )}
                </button>
                <button
                  className="flex items-center justify-center text-lg sm:text-xl md:text-2xl text-gray-600 hover:text-black cursor-pointer p-1"
                  onClick={() => handleAddToWishlist(product.id, product.name)}
                  disabled={isWishlisting[product.id]}
                >
                  {isWishlisting[product.id] ? (
                    <span className="text-xs sm:text-sm text-red-500 navfonts">
                      <img src={wishlistlike} alt="" className="w-4 sm:w-5" />
                    </span>
                  ) : (
                    <img src={wishlistlike} alt="" className="w-6 sm:w-8" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Bestseller_cards;