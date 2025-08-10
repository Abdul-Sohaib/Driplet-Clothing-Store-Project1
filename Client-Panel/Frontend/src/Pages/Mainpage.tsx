import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import tshirt1 from '@/assets/bento2.png';
import tshirt2 from '@/assets/bento1.png';
import tshirt3 from '@/assets/driplet.png';
import tshirt4 from '@/assets/image2.png';
import axios from "axios";
import { toast } from "react-toastify";
import AdContainer1 from "@/components/AdContainer1";
import Bestsellerintro from "@/components/Bestsellerintro";
import Loading from "@/components/Loading";
import Textarea from "@/components/Textarea";
import ProductSlider from "@/components/productslider";
import type { Product } from "@/components/productslider";
import Footer from "@/components/Footer";
import { gsap } from "gsap";
import { Canvas } from "@react-three/fiber";
import { Stage } from "@react-three/drei";
import { Suspense } from "react";
import TshirtModel from "@/components/TshirtModel";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const slideLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0, transition: { duration: 1 } },
};

const slideRight = (delay = 0) => ({
  hidden: { opacity: 0, x: 100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 1, delay },
  },
});

const slideup = (delay = 0) => ({
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, delay },
  },
});

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Mainpage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE}/products`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        });
        const mockProducts = res.data.slice(0, 8).map((p: Product) => ({
          ...p,
          id: String(p.id),
          color: p.color || ["Red", "Blue", "Green"][Math.floor(Math.random() * 3)],
          fabric: p.fabric || ["Cotton", "Polyester", "Silk"][Math.floor(Math.random() * 3)],
          gender: p.gender || ["Men", "Women", "Unisex"][Math.floor(Math.random() * 3)],
        }));
        setProducts(mockProducts);
      } catch (err) {
        console.error("Failed to fetch products", err);
        toast.error("Failed to fetch products for slider. Using fallback data.");
        setProducts([
          {
            id: "1",
            name: "Classic T-Shirt",
            description: "Comfortable cotton t-shirt",
            category: "Clothing",
            color: "Blue",
            fabric: "Cotton",
            gender: "Unisex",
            variants: [
              {
                price: 499,
                imageUrls: [tshirt1, tshirt2, tshirt3, tshirt4],
                sizes: [{ size: "M", stock: 10 }, { size: "L", stock: 5 }],
              },
            ],
          },
          {
            id: "2",
            name: "Graphic Tee",
            description: "Stylish graphic t-shirt",
            category: "Clothing",
            color: "Red",
            fabric: "Polyester",
            gender: "Men",
            variants: [
              {
                price: 599,
                imageUrls: [tshirt2, tshirt3, tshirt1, tshirt4],
                sizes: [{ size: "S", stock: 8 }, { size: "M", stock: 3 }],
              },
            ],
          },
          {
            id: "3",
            name: "Casual Shirt",
            description: "Casual unisex shirt",
            category: "Clothing",
            color: "Green",
            fabric: "Silk",
            gender: "Unisex",
            variants: [
              {
                price: 799,
                imageUrls: [tshirt3, tshirt1, tshirt2, tshirt4],
                sizes: [{ size: "L", stock: 6 }, { size: "XL", stock: 4 }],
              },
            ],
          },
          {
            id: "4",
            name: "Sporty Tee",
            description: "Breathable sport t-shirt",
            category: "Clothing",
            color: "Black",
            fabric: "Cotton",
            gender: "Women",
            variants: [
              {
                price: 649,
                imageUrls: [tshirt4, tshirt2, tshirt3, tshirt1],
                sizes: [{ size: "S", stock: 7 }, { size: "M", stock: 2 }],
              },
            ],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProducts();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-screen w-screen">
          <Loading />
        </div>
      ) : (
        <div className="flex flex-col items-center w-screen gap-6 sm:gap-8 md:gap-12 lg:gap-16">
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 justify-center items-center align-middle w-screen p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12">
            <motion.div
              variants={slideLeft}
              initial="hidden"
              animate="visible"
              className="w-full flex justify-center items-center"
            >
              <AdContainer1 />
            </motion.div>
            <div
              className="flex flex-col h-[50vh] sm:h-[55vh] md:h-[60vh] lg:h-[65vh] xl:h-[70vh] 2xl:h-[75vh] min-h-[250px] sm:min-h-[300px] md:min-h-[350px] lg:min-h-[400px] rounded-2xl sm:rounded-3xl gap-4 items-center justify-center threed"
            >
              <motion.div
                variants={slideRight(0.5)}
                initial="hidden"
                animate="visible"
                className="flex w-full h-full rounded-2xl sm:rounded-3xl items-center justify-center"
              >
                <Canvas
                  dpr={[1, 1.5]} // keeps clarity but lighter GPU load
                  camera={{ position: [0, 1, 6], fov: 45 }}
                  style={{ width: "100%", height: "100%" }}
                  shadows
                >
                  <Suspense
                    fallback={
                      <mesh>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshBasicMaterial color="red" /> {/* Basic for speed */}
                      </mesh>
                    }
                  >
                    <Stage
                      environment="sunset"
                      adjustCamera={false}
                      intensity={1}
                      shadows="contact"
                    >
                      {/* Tshirt Model centered closer to camera */}
                      <TshirtModel position={[0, 7, 0]} scale={1.5} color="#ff6600" />
                    </Stage>
                  </Suspense>
                </Canvas>
              </motion.div>
            </div>
          </div>

          {/* Bestseller Intro */}
          <div className="w-screen flex justify-center items-center mt-4 sm:mt-6 md:mt-8 lg:mt-10 xl:mt-12">
            <Bestsellerintro />
          </div>

          {/* More Bestsellers Button */}
          <motion.div
            variants={slideup(1)}
            initial="hidden"
            animate="visible"
            className="px-3 sm:px-4"
          >
            <button
              onClick={() => navigate("/bestsellers")}
              className="relative group bg-transparent outline-none cursor-pointer uppercase ml-1 sm:ml-2"
            >
              <span className="absolute top-0 left-0 w-full h-full bg-[#101A13] bg-opacity-30 rounded-lg transform translate-y-0.5 transition duration-[600ms] ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:translate-y-1 group-hover:duration-[250ms] group-active:translate-y-px"></span>
              <div className="relative flex items-center justify-between py-2 sm:py-3 px-3 sm:px-4 md:px-6 text-sm sm:text-base md:text-lg text-black rounded-lg transform -translate-y-1 bg-white gap-2 sm:gap-3 transition duration-[600ms] ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:-translate-y-1.5 group-hover:duration-[250ms] group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110 shadow-md border-2 border-[#101A13] hover:border-purple-500 active:border-purple-700">
                <span className="select-none text-sm sm:text-base md:text-lg navfonts font-semibold">
                  MORE BESTSELLERS
                </span>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3 sm:w-4 md:w-5 -ml-1 transition duration-250 group-hover:-translate-x-1"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  />
                </svg>
              </div>
            </button>
          </motion.div>

          {/* Textarea Section */}
          <div className="flex h-full rounded-2xl sm:rounded-3xl justify-center items-center p-2 sm:p-3 w-full">
            <div className="flex justify-center items-center w-full">
              <Textarea />
            </div>
          </div>

          {/* Product Slider Section */}
          <div className="h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[75vh] xl:h-[80vh] 2xl:h-[85vh] w-full grid grid-cols-1 grid-rows-[auto_1fr_auto] items-center justify-center mt-4 sm:mt-6 md:mt-8 lg:mt-10 xl:mt-12 mb-4 sm:mb-6 md:mb-8 lg:mb-10 xl:mb-12 gap-2 sm:gap-3 p-2 sm:p-3">
            <div className="col-span-1 text-center px-2 sm:px-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold textheading uppercase">closets of driplet</h1>
            </div>
            <div className="row-start-2 col-start-1 flex items-center justify-center w-full">
              <ProductSlider products={products} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex w-screen justify-center">
            <Footer />
          </div>
        </div>
      )}
    </>
  );
};

export default Mainpage;