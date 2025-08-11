
"use client";

import React, { useEffect, useRef, useState, } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

// Extend Product interface to include optional rating
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  fabric: string;
  gender: string;
  variants: Array<{
    price: number;
    imageUrls: string[];
    sizes: Array<{ size: string; stock: number }>;
  }>;
  rating?: number; // Added for star ratings (0–5)
}

export interface ProductCarouselProps {
  products: Product[];
  autoRotate?: boolean;
  rotateInterval?: number;
  cardHeight?: number; // Optional override; if omitted, responsive heights are used
  containerClassName?: string;
  carouselClassName?: string;
  cardClassName?: string;
  backgroundColor?: string;
  isMobileSwipe?: boolean;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products: initialProducts,
  autoRotate = true,
  rotateInterval = 3000,
  cardHeight,
  carouselClassName,
  cardClassName,
  backgroundColor = "transparent",
  isMobileSwipe = true,
}) => {
  const [active, setActive] = useState(0);
  const [products, setProducts] = useState<Product[]>(initialProducts.slice(0, 8));
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;
  const [computedCardHeight, setComputedCardHeight] = useState<number>(
    // initial SSR-safe fallback
    typeof window === "undefined" ? 420 : window.innerWidth < 640 ? 360 : window.innerWidth < 768 ? 420 : window.innerWidth < 1024 ? 480 : 520
  );

  // Simple mobile detection based on window width


  // Function to add a new product and remove the oldest if exceeding 8

  // Update products when initialProducts change
  useEffect(() => {
    setProducts(initialProducts.slice(0, 8));
  }, [initialProducts]);

  // Auto-rotation effect
  useEffect(() => {
    if (autoRotate && isInView && !isHovering) {
      const interval = setInterval(() => {
        setActive((prev) => (prev + 1) % products.length);
      }, rotateInterval);
      return () => clearInterval(interval);
    }
  }, [isInView, isHovering, autoRotate, rotateInterval, products.length]);

  // Intersection observer to detect when carousel is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Compute responsive card height (px) based on viewport; optionally scale from prop
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // Base breakpoints
      const base = width < 640 ? 360 : width < 768 ? 400 : width < 1024 ? 460 : width < 1280 ? 500 : 540;
      if (cardHeight) {
        // Scale proportionally around the provided base height
        const factor = base / 500; // 500 is our reference for lg
        setComputedCardHeight(Math.round(cardHeight * factor));
      } else {
        setComputedCardHeight(base);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [cardHeight]);

  // Touch swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    if (!isMobileSwipe) return;
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isMobileSwipe) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!isMobileSwipe || !touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      setActive((prev) => (prev + 1) % products.length);
    } else if (distance < -minSwipeDistance) {
      setActive((prev) => (prev - 1 + products.length) % products.length);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const getCardAnimationClass = (index: number) => {
    if (index === active) return "scale-100 opacity-100 z-20";
    if (index === (active + 1) % products.length)
      return "translate-x-[28%] xs:translate-x-[30%] sm:translate-x-[34%] md:translate-x-[38%] lg:translate-x-[40%] scale-95 opacity-70 z-10";
    if (index === (active - 1 + products.length) % products.length)
      return "-translate-x-[28%] xs:-translate-x-[30%] sm:-translate-x-[34%] md:-translate-x-[38%] lg:-translate-x-[40%] scale-95 opacity-70 z-10";
    return "scale-90 opacity-0 pointer-events-none";
  };

  // Star rating component
  const StarRating = ({ rating }: { rating?: number }) => {
    const stars = rating ? Math.round(rating) : 0;
    return (
      <div className="flex justify-center items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ${i < stars ? "text-yellow-400" : "text-white"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <section id="product-carousel" className="product-carousel-section h-full w-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#fff9e6] via-[#fff5cc] to-[#ffefb3] border-2 border-black shadow-xl flex justify-center items-center">
      <div className="w-fit h-full px-2 sm:px-3 md:px-6 lg:px-8 min-w-[90vw] xs:min-w-[85vw] sm:min-w-[80vw] md:min-w-[70vw] lg:min-w-[60vw] xl:min-w-[50vw] 2xl:min-w-[40vw] rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-9">
        <div
          className="relative"
          style={{ height: `${computedCardHeight}px` }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          ref={carouselRef}
        >
          <div
            className={cn(
              "absolute top-0 left-0 w-full h-full flex items-center justify-center",
              carouselClassName
            )}
            style={{ backgroundColor }}
          >
            <AnimatePresence>
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  className={cn(
                    // Responsive width with sensible max sizes per breakpoint
                    "absolute top-0 w-[80vw] xs:w-[75vw] sm:w-[60vw] md:w-[55vw] lg:w-[45vw] xl:w-[40vw] 2xl:w-[36vw] max-w-[320px] xs:max-w-[340px] sm:max-w-[380px] md:max-w-[440px] lg:max-w-[500px] xl:max-w-[560px] cursor-pointer transform transition-all duration-500 shadow-md rounded-2xl sm:rounded-3xl",
                    getCardAnimationClass(index),
                    cardClassName
                  )}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <div
                    className="border-2 border-black rounded-2xl sm:rounded-3xl bg-[#DADAD0] shadow-md hover:shadow-xl transition duration-300 overflow-hidden"
                    style={{ height: `${computedCardHeight}px` }}
                  >
                    <div
                      className="relative w-full h-full flex flex-col"
                      style={{
                        backgroundImage: `url(${product.variants[0]?.imageUrls[0] || ''})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="h-full flex items-end justify-center">
                      <StarRating rating={product.rating} />
                    </div>
                    </div>
                    
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

       
        
        
         
        </div>
        
      </div>
    </section>
  );
};

export default ProductCarousel;