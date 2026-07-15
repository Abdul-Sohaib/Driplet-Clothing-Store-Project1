/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillStar } from "react-icons/ai";
import gsap from "gsap";
import axios from "axios";
import { toast } from "react-toastify";
import cartgif from '@/assets/load.gif';
import wishlistlike from '@/assets/wishlist.png';
import { motion, type Variants } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface Product {
  id: string | number;
  name: string;
  description: string;
  category: string;
  color: string;
  fabric: string;
  gender: "Men" | "Women" | "Unisex";
  variants: {
    price: number;
    imageUrls: string[];
    sizes: { size: string; stock: number }[];
  }[];
}

export interface BestsellerCardsProps {
  products: Product[];
  isFilterVisible: boolean;
}

const Bestseller_cards: React.FC<BestsellerCardsProps> = ({ products, isFilterVisible }) => {
  const imageIndex = useRef<Record<number, number>>({});
  const imageRefs = useRef<Record<number, HTMLDivElement>>({});
  const timers = useRef<Record<number, ReturnType<typeof setInterval>>>({});
  const direction = useRef<Record<number, "forward" | "backward">>({});
  const navigate = useNavigate();
  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string | null>>({});
  const [isAdding, setIsAdding] = useState<Record<string, boolean>>({});
  const [isWishlisting, setIsWishlisting] = useState<Record<string, boolean>>({});
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

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

  useEffect(() => {
    const initialVariants: Record<string, number> = {};
    const initialSizes: Record<string, string | null> = {};
    products.forEach((product) => {
      initialVariants[product.id] = selectedVariants[product.id] ?? 0;
      initialSizes[product.id] = selectedSizes[product.id] ?? null;
    });
    setSelectedVariants(initialVariants);
    setSelectedSizes(initialSizes);
  }, [products]);

  useEffect(() => {
    const updatedSizes = { ...selectedSizes };
    Object.keys(selectedVariants).forEach((productId) => {
      updatedSizes[productId] = null;
    });
    setSelectedSizes(updatedSizes);
  }, [selectedVariants]);

  const handleAddToCart = async (productId: string | number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (isAdding[productId]) return;
    setIsAdding((prev) => ({ ...prev, [productId]: true }));

    const size = selectedSizes[productId];
    if (!size) {
      toast.error("Please select a size before adding to cart.");
      setIsAdding((prev) => ({ ...prev, [productId]: false }));
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (!product) {
      toast.error("Product not found.");
      setIsAdding((prev) => ({ ...prev, [productId]: false }));
      return;
    }

    const variantIndex = selectedVariants[productId] ?? 0;
    const variant = product.variants[variantIndex];
    if (!variant) {
      toast.error("Selected variant not available.");
      setIsAdding((prev) => ({ ...prev, [productId]: false }));
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/cart`,
        {
          productId,
          quantity: 1,
          size,
          product: {
            name: product.name,
            price: variant.price,
            imageUrls: variant.imageUrls,
          },
          variantIndex,
        },
        { withCredentials: true }
      );
      console.log(`Added product ${productId} (size: ${size}, variant: ${variantIndex}) to cart`, res.data);
      toast.success("Added to cart!");
    } catch (err: any) {
      console.error("Add to cart error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      toast.error("Failed to add item to cart. Please try again.");
    } finally {
      setIsAdding((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddToWishlist = async (productId: string | number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (isWishlisting[productId]) return;
    setIsWishlisting((prev) => ({ ...prev, [productId]: true }));

    const size = selectedSizes[productId];
    if (!size) {
      toast.error("Please select a size before adding to wishlist.");
      setIsWishlisting((prev) => ({ ...prev, [productId]: false }));
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (!product) {
      toast.error("Product not found.");
      setIsWishlisting((prev) => ({ ...prev, [productId]: false }));
      return;
    }

    const variantIndex = selectedVariants[productId] ?? 0;
    const variant = product.variants[variantIndex];
    if (!variant) {
      toast.error("Selected variant not available.");
      setIsWishlisting((prev) => ({ ...prev, [productId]: false }));
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/wishlist`,
        {
          productId,
          size,
          product: {
            name: product.name,
            price: variant.price,
            imageUrls: variant.imageUrls,
          },
          variantIndex,
        },
        { withCredentials: true }
      );
      console.log(`Added product ${productId} (size: ${size}, variant: ${variantIndex}) to wishlist`, res.data);
      toast.success("Added to wishlist!");
    } catch (err: any) {
      console.error("Add to wishlist error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      toast.error("Failed to add item to wishlist. Please try again.");
    } finally {
      setIsWishlisting((prev) => ({ ...prev, [productId]: false }));
    }
  };

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
        if (current >= totalImages - 1) direction.current[index] = "backward";
      } else {
        current -= 1;
        if (current <= 0) direction.current[index] = "forward";
      }
      imageIndex.current[index] = current;
      gsap.to(container, { x: `-${current * 100}%`, duration: 0.6, ease: "power2.inOut" });
    }, 2000);
  };

  const stopCarousel = (index: number) => {
    clearInterval(timers.current[index]);
    delete timers.current[index];
  };

  const handleImageLoad = (productId: string | number) => {
    setImageLoaded((prev) => ({ ...prev, [productId]: true }));
  };

  const handleImageError = (productId: string | number, img: string) => {
    console.error(`Failed to load image: ${img} for product ${productId}`);
    setImageLoaded((prev) => ({ ...prev, [productId]: true }));
  };

  if (products.length === 0) {
    return <div className="text-center text-gray-600">No products available.</div>;
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 ${
        isFilterVisible ? "lg:grid-cols-3" : "lg:grid-cols-4"
      } gap-6 px-4 justify-center`}
    >
      {products.map((product, index) => {
        const variantIndex = selectedVariants[product.id] ?? 0;
        const images = product.variants[variantIndex]?.imageUrls || [];
        const price = product.variants[variantIndex]?.price || 0;
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
            
       <div className="w-full h-[60vh] overflow-hidden relative">
  {/* BEST SELLER Tag in top-right */}
  <div className="text-xs font-bold button-55 text-black bg-transparent w-fit text-center p-1 navfonts border-purple-400 absolute top-1 left-1 z-10 navfonts">
    BEST SELLER
  </div>

  {/* Loader (if image not loaded) */}
  {!imageLoaded[product.id] && (
    <div className="absolute inset-0 flex items-center justify-center ">
      <img
        src={cartgif}
        alt="Loading..."
        className="w-28"
        onError={() => handleImageError(product.id, cartgif)}
      />
    </div>
  )}

  {/* Image Carousel */}
  <div
    className="flex h-fit "
    ref={(el) => {
      if (el) imageRefs.current[index] = el;
    }}
    style={{ visibility: imageLoaded[product.id] ? "visible" : "hidden" }}
  >
    {images.map((img, i) => (
      <img
        key={i}
        src={img}
        alt={`img-${i}`}
        className=" w-full h-full object-cover flex-shrink-0  rounded-lg border-b-1 border-black overflow-hidden"
        loading="lazy"
        onLoad={() => handleImageLoad(product.id)}
        onError={() => handleImageError(product.id, img)}
      />
    ))}
  </div>
</div>

            <div className="flex justify-between px-3 py-2 text-sm items-center">
              <div className="flex items-center gap-1 text-orange-500">
                <AiFillStar className="text-[14px]" />
                4.5 <span className="text-gray-600 ml-1">(241)</span>
              </div>
              <div className="text-xs button-55 text-black bg-transparent w-fit text-center p-1 font-bold">
                {totalStock} left
              </div>
            </div>
            <div className="px-3 flex gap-2 items-center">
              <p className="text-lg font-semibold text-black">₹{price}</p>
              <p className="text-sm line-through text-gray-500">₹{mrp}</p>
              <p className="text-sm text-green-600 font-semibold">{discount}% OFF</p>
            </div>
            <div className="px-3 py-1 text-sm text-black font-semibold line-clamp-2">
              {product.name}
            </div>
            <div className="mx-3 mb-3">
              <div className="flex gap-2 flex-wrap mb-2">
                {product.variants.map((variant, vIndex) => (
                  <button
                    key={vIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVariants({ ...selectedVariants, [product.id]: vIndex });
                    }}
                    className={`px-3 py-1 border-2 rounded-md text-sm font-semibold navfonts cursor-pointer ${
                      selectedVariants[product.id] === vIndex
                        ? "border-purple-500 bg-purple-100 text-purple-600"
                        : "border-purple-300 text-black hover:bg-purple-50"
                    }`}
                  >
                    Variant {vIndex + 1} (₹{variant.price})
                  </button>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap mb-2">
                {product.variants[variantIndex]?.sizes.map((size, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (size.stock > 0) setSelectedSizes({ ...selectedSizes, [product.id]: size.size });
                    }}
                    className={`px-3 py-1 border-2 rounded-md text-sm font-semibold navfonts uppercase cursor-pointer ${
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
              <div className="grid grid-cols-5 gap-2 border-3 border-black rounded-lg overflow-hidden">
                <button
                  className="col-span-4 text-sm font-semibold button-add text-black rounded-md navfonts cursor-pointer flex items-center justify-center gap-2"
                  onClick={(e) => handleAddToCart(product.id, e)}
                  disabled={isAdding[product.id]}
                >
                  {isAdding[product.id] ? (
                    <img src={cartgif} alt="Loading..." className="w-10" onError={() => handleImageError(product.id, cartgif)} />
                  ) : (
                    "ADD TO CART"
                  )}
                </button>
                <button
                  className="flex items-center justify-center text-2xl text-gray-600 hover:text-black cursor-pointer"
                  onClick={(e) => handleAddToWishlist(product.id, e)}
                  disabled={isWishlisting[product.id]}
                >
                  {isWishlisting[product.id] ? (
                    <span className="text-sm"><img src={wishlistlike} alt="" className="w-5" onError={() => handleImageError(product.id, wishlistlike)} /></span>
                  ) : (
                    <img src={wishlistlike} alt="" className="w-8" onError={() => handleImageError(product.id, wishlistlike)} />
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

export default memo(Bestseller_cards);