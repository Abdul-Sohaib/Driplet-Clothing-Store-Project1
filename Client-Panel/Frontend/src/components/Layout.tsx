import { motion } from "framer-motion";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import CartDrawer from "./CartDrawer";
import WishlistDrawer from "./WishlistDrawer";
import CheckoutPage from "../Pages/Checkoutpage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

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

  useEffect(() => {
    // Register GSAP ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Fetch user
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_BASE}/auth/user`, {
          withCredentials: true,
        });
        if (res.status === 200) {
          setUser(res.data.user || null);
        }
      } catch (err) {
        console.error("User fetch error:", err);
      }
    };
    fetchUser();

    // GSAP scroll animation for navbar
    const navbar = document.querySelector(".navbar-container");
    if (navbar) {
      let lastScroll = 0;

      window.addEventListener("scroll", () => {
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
      });
    }

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("scroll", () => {});
    };
  }, []);

  const handleCheckout = async () => {
    if (!user) {
      alert("Please log in to proceed to checkout.");
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/cart`, {
        withCredentials: true,
      });
      if (Array.isArray(res.data)) {
        setCartItems(res.data);
        setIsCheckoutOpen(true);
        setIsCartOpen(false);
      } else {
        alert(res.data.message || "Failed to load cart items.");
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
      alert("Failed to load cart items.");
    }
  };

  const handleWishlistClick = () => {
    if (!user) {
      alert("Please log in to view your wishlist.");
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

      <div className="flex mt-16 lg:mt-20">
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