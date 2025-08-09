import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import SplashScreen from "./Pages/SplashScreen";
import Landingpage from "./Pages/Landingpage";
import Bestseller from "./Pages/Bestseller";
import ProductCard from "./Pages/Productcard";
import Account from "./components/Account";
import Orders from "./components/Orders";
import ReturnExchange from "./components/ReturnExchange";
import Layout from "./components/Layout";


const API_BASE = import.meta.env.VITE_API_BASE_URL;

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);

    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE}/products`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        });
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
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <SplashScreen />
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
      <ToastContainer position="top-center" autoClose={5000} />
    </>
  );
};

export default App;