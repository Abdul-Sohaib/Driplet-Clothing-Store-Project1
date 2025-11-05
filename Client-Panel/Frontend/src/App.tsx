/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense, lazy, useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import axiosInstance from "./lib/axios";
import { auth } from "@/firebase"; // ✅ Import Firebase auth
import { onAuthStateChanged } from "firebase/auth"; // ✅ Import auth state listener
import { ToastContainer, toast } from "react-toastify";
import { AnimatePresence } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";

const SplashScreen = lazy(() => import("./Pages/SplashScreen"));
const Landingpage = lazy(() => import("./Pages/Landingpage"));
const Bestseller = lazy(() => import("./Pages/Bestseller"));
const ProductCard = lazy(() => import("./Pages/Productcard"));
const Account = lazy(() => import("./components/Account"));
const Orders = lazy(() => import("./components/Orders"));
const ReturnExchange = lazy(() => import("./components/ReturnExchange"));
const Layout = lazy(() => import("./components/Layout"));

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [products, setProducts] = useState([]);
  const [authInitialized, setAuthInitialized] = useState(false); // ✅ Track auth initialization
  const navigate = useNavigate();

  // ✅ CRITICAL FIX: Listen to Firebase auth state changes
  useEffect(() => {
    console.log("[APP] Setting up Firebase auth listener...");
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log("[APP] Firebase user detected:", firebaseUser.email);
        
        try {
          // ✅ Get fresh token and sync with backend
          const token = await firebaseUser.getIdToken(true);
          console.log("[APP] Firebase token obtained:", token.substring(0, 20) + "...");
          
          // ✅ Sync with backend to create/update MongoDB user
          const res = await axiosInstance.get("/auth/user");
          
          if (res.data.success && res.data.user) {
            const user = {
              id: res.data.user.id,
              email: res.data.user.email,
              name: res.data.user.name,
              gender: res.data.user.gender || "",
            };
            
            localStorage.setItem("user", JSON.stringify(user));
            window.dispatchEvent(new Event("authChange"));
            console.log("[APP] ✅ User synced with backend:", user.email);
          }
        } catch (err: any) {
          console.error("[APP] ❌ Failed to sync user with backend:", {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
          });
          
          // ⚠️ If backend sync fails, still store Firebase user locally
          const fallbackUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: firebaseUser.displayName || firebaseUser.email!.split("@")[0],
            gender: "",
          };
          localStorage.setItem("user", JSON.stringify(fallbackUser));
          window.dispatchEvent(new Event("authChange"));
          
          if (err.response?.status === 401) {
            toast.error("Session expired. Please log in again.");
          }
        }
      } else {
        console.log("[APP] No Firebase user detected");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("authChange"));
      }
      
      setAuthInitialized(true);
    });

    return () => {
      console.log("[APP] Cleaning up Firebase auth listener");
      unsubscribe();
    };
  }, []);

  // ✅ CRITICAL FIX: Listen for global auth errors (401 responses)
  useEffect(() => {
    const handleAuthError = async (event: CustomEvent) => {
      console.error("[APP] Auth error received:", event.detail);
      
      // Clear user data
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("authChange"));
      
      // Show error message
      toast.error(event.detail.message || "Session expired. Please log in again.");
      
      // Optionally redirect to home
      navigate("/");
    };

    window.addEventListener("auth-error", handleAuthError as unknown as EventListener);

    return () => {
      window.removeEventListener("auth-error", handleAuthError as unknown as EventListener);
    };
  }, [navigate]);

  // ✅ Existing splash screen and products fetch logic
  useEffect(() => {
  const timer = setTimeout(() => setShowSplash(false), 3000);

  // ✅ FIX: Add isFetched flag to prevent duplicate calls
  let isFetched = false;

  const fetchProducts = async () => {
    if (isFetched) return; // ✅ Prevent duplicate fetches
    isFetched = true;

    try {
      const res = await axiosInstance.get(`/products`);
      setProducts(res.data);
      console.log("[APP] ✅ Fetched", res.data.length, "products");
    } catch (err: any) {
      console.error("[APP] ❌ Failed to fetch products:", err.message);
      toast.error("Failed to fetch products. Please try again later.");
    }
  };

  fetchProducts();

  return () => clearTimeout(timer);
}, []);

  // ✅ Don't render routes until auth is initialized
  if (!authInitialized) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#F5F5DC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-black text-lg font-semibold">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <Suspense fallback={<div />}>
            <SplashScreen />
          </Suspense>
        ) : (
          <Suspense fallback={<div />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Landingpage />} />
                <Route path="/bestsellers" element={<Bestseller />} />
                <Route path="/product/:id" element={<ProductCard products={products} />} />
                <Route path="/category/:categoryId" element={<ProductCard />} />
                <Route path="/account" element={<Account />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/return-exchange" element={<ReturnExchange />} />
              </Route>
            </Routes>
          </Suspense>
        )}
      </AnimatePresence>
      <ToastContainer position="top-center" autoClose={5000} />
    </>
  );
};

export default App;