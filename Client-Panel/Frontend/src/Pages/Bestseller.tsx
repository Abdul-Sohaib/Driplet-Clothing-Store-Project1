/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import axios from "axios";
import FilterSection from "@/components/Filtersection";
import Bestseller_cards from "@/components/Product_cards";
import { VscListFlat } from "react-icons/vsc";
import Loading from "@/components/Loading";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Product {
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

const Bestseller = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"low-to-high" | "high-to-low">("low-to-high");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/products`, {
          withCredentials: true,
        });
        const mockProducts = res.data.map((p: Product) => ({
          ...p,
          color: p.color || ["Red", "Blue", "Green"][Math.floor(Math.random() * 3)],
          fabric: p.fabric || ["Cotton", "Polyester", "Silk"][Math.floor(Math.random() * 3)],
          gender: p.gender || ["Men", "Women", "Unisex"][Math.floor(Math.random() * 3)],
        }));
        setProducts(mockProducts);
        setError(null);
      } catch (err) {
        console.error("Fetch products error:", (err as any).response?.data?.message || (err as any).message);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "low-to-high" ? "high-to-low" : "low-to-high"));
  };

  const sortProducts = (filteredProducts: Product[]) => {
    return [...filteredProducts].sort((a, b) => {
      const priceA = a.variants[0]?.price || 0;
      const priceB = b.variants[0]?.price || 0;
      return sortOrder === "low-to-high" ? priceA - priceB : priceB - priceA;
    });
  };

  if (loading) return <div className="flex justify-center items-center w-screen "><Loading/></div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col gap-10 px-4 inset-0 bg-[#F5F5DC]">
      <div className="flex flex-col lg:flex-row justify-between items-center mt-12 w-full mx-auto">
        <button
          onClick={() => window.history.back()}
          className="relative group bg-transparent outline-none cursor-pointer uppercase"
        >
          <span className="absolute top-0 left-0 w-full h-full bg-[#101A13] bg-opacity-30 rounded-lg transform translate-y-0.5 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:translate-y-1 group-hover:duration-250 group-active:translate-y-px"></span>
          <div className="relative flex items-center justify-between py-3 px-6 text-lg text-black rounded-lg transform -translate-y-1 bg-white gap-3 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:-translate-y-1.5 group-hover:duration-250 group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110 shadow-md border-2 border-[#101A13] hover:border-purple-500 active:border-purple-700">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 -ml-1 transition duration-250 group-hover:-translate-x-1">
              <path
                clipRule="evenodd"
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              />
            </svg>
            <span className="select-none text-xs navfonts font-semibold">Back to Home</span>
          </div>
        </button>

        <h1 className="text-4xl font-extrabold text-center textheading uppercase flex justify-center">
          Bestsellers Of Driplet
        </h1>

        <button
          onClick={handleSortToggle}
          className="relative group bg-transparent outline-none cursor-pointer uppercase w-fit"
        >
          <span className="absolute top-0 left-0 w-full h-full bg-[#101A13] bg-opacity-30 rounded-lg transform translate-y-0.5 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:translate-y-1 group-hover:duration-250 group-active:translate-y-px"></span>
          <div className="relative flex items-center justify-between py-3 px-6 text-lg text-black rounded-lg transform -translate-y-1 bg-white gap-3 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:-translate-y-1.5 group-hover:duration-250 group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110 shadow-md border-2 border-[#101A13] hover:border-purple-500 active:border-purple-700">
            <VscListFlat className="w-5 transition duration-250 group-hover:-translate-x-1" />
            <span className="select-none text-xs navfonts font-semibold">Sort Price: {sortOrder === "low-to-high" ? "Low → High" : "High → Low"}</span>
          </div>
        </button>
      </div>

      <FilterSection
        products={products}
        renderProducts={(filtered, isFilterVisible) => (
          <Bestseller_cards products={sortProducts(filtered)} isFilterVisible={isFilterVisible} />
        )}
      />
    </div>
  );
};

export default Bestseller;