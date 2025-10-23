import { Suspense, lazy, useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import axiosInstance from "./lib/axios";
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

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);

    const fetchProducts = async () => {
      try {
        const res = await axiosInstance.get(`/products`);
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products", err);
        toast.error("Failed to fetch products. Please try again later.");
      } finally {
        // eslint-disable-next-line no-unsafe-finally
        return () => clearTimeout(timer);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <Suspense fallback={<div />}> {/* fallback can be improved */}
            <SplashScreen />
          </Suspense>
        ) : (
          <Suspense fallback={<div />}> {/* fallback can be improved */}
            <Routes>
              <Route path="/" element={<Layout />} >
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