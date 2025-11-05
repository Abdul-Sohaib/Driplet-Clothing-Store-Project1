import { motion } from "framer-motion";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "@/firebase"; // ✅ ADD THIS
import axiosInstance from "@/lib/axios";
import CartDrawer from "./CartDrawer";
import WishlistDrawer from "./WishlistDrawer";
import CheckoutPage from "../Pages/Checkoutpage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Address = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

type CartItem = {
  productId: string;
  quantity: number;
  size: string;
  product: {
    name: string;
    price: number;
    imageUrls: string[];
  };
};

const Layout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; _id: string } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // ✅ CRITICAL FIX: Fetch user from localStorage, NOT backend
  useEffect(() => {
    // Register GSAP ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // ✅ Get user from localStorage (synced by App.tsx)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("[LAYOUT] ✅ User loaded from localStorage:", parsedUser.email);
      } catch (err) {
        console.error("[LAYOUT] ❌ Failed to parse stored user:", err);
        localStorage.removeItem("user");
      }
    } else {
      console.log("[LAYOUT] No user in localStorage");
    }

    // ✅ Listen for auth changes from App.tsx
    const handleAuthChange = () => {
      console.log("[LAYOUT] Auth change detected, reloading user...");
      const updatedUser = localStorage.getItem("user");
      if (updatedUser) {
        try {
          setUser(JSON.parse(updatedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener("authChange", handleAuthChange);

    // GSAP scroll animation for navbar
    const navbar = document.querySelector(".navbar-container");
    if (navbar) {
      let lastScroll = 0;

      const handleScroll = () => {
        const currentScroll = window.scrollY;

        if (currentScroll > lastScroll && currentScroll > 100) {
          // Scroll down
          gsap.to(navbar, {
            y: -100,
            duration: 0.8,
            ease: "power3.out",
          });
        } else if (currentScroll < lastScroll) {
          // Scroll up
          gsap.to(navbar, {
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          });
        }
        lastScroll = currentScroll;
      };

      window.addEventListener("scroll", handleScroll);

      // Cleanup
      return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("authChange", handleAuthChange);
      };
    }

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  const handleCheckout = async () => {
    if (!user) {
      alert("Please log in to proceed to checkout.");
      return;
    }

    // ✅ Verify Firebase auth before making API call
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      console.error("[LAYOUT] ❌ No Firebase user, cannot checkout");
      alert("Session expired. Please log in again.");
      return;
    }

    try {
      const res = await axiosInstance.get(`/cart`);
      if (Array.isArray(res.data)) {
        setCartItems(res.data);
        setIsCheckoutOpen(true);
        setIsCartOpen(false);
        console.log("[LAYOUT] ✅ Cart loaded for checkout:", res.data.length, "items");
      } else {
        alert(res.data.message || "Failed to load cart items.");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("[LAYOUT] ❌ Cart fetch error:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
      } else {
        alert("Failed to load cart items.");
      }
    }
  };

  const handleWishlistClick = () => {
    if (!user) {
      alert("Please log in to view your wishlist.");
      return;
    }

    // ✅ Verify Firebase auth
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      console.error("[LAYOUT] ❌ No Firebase user, cannot open wishlist");
      alert("Session expired. Please log in again.");
      return;
    }

    setIsWishlistOpen(true);
  };

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 w-screen navbar-container"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.6,
          ease: [0.43, 0.13, 0.23, 0.96],
        }}
      >
        <Navbar
          setIsCartOpen={setIsCartOpen}
          onWishlistClick={handleWishlistClick}
        />
      </motion.div>

      <div className="flex mt-12 sm:mt-14 md:mt-16 lg:mt-18 xl:mt-20">
        <Outlet />
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        user={user}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        user={user}
        onClose={() => setIsWishlistOpen(false)}
      />

      {/* Checkout Page as Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/5 backdrop-blur-sm flex justify-center items-center z-50">
          <CheckoutPage
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cartItems={cartItems}
            user={user}
            selectedAddress={selectedAddress}
            setSelectedAddress={setSelectedAddress}
            setCartItems={setCartItems}
          />
        </div>
      )}
    </>
  );
};

export default Layout;