/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import Userdashboard from "./Userdashboard";
import Products from "./Products";
import Setting from "./SiteSettings";
import Support from "./Support";
import Sales from "./Sales";
import Categories from "./Categories";
import PackingAndShipping from "./Packing_and_shipping";
import Loading from "@/Components/Loading";
import { FiMenu, FiX } from "react-icons/fi";

export interface Product {
  id: string | number;
  name: string;
  price: number;
  description: string;
  category: string;
  variants: { imageUrl: string; sizes: { size: string; stock: number }[] }[];
}

export interface Category {
  id: number;
  name: string;
  ID: string;
  parent: string;
  gender: string;
  clothingType: string;
  description: string;
  imageUrl: string;
}

interface ApiError {
  message: string;
}

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Uncaught error:", error);
      setHasError(true);
    };
    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="p-6 text-red-600">
        Something went wrong. Please refresh the page.
      </div>
    );
  }

  return <>{children}</>;
};

const Dashboard = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getToken } = useAuth();

  const fetchCategories = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication token is missing");

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          message: `Failed to fetch categories: ${response.status}`,
        }));
        throw new Error(errorData.message);
      }

      const data = await response.json();
      const mappedData: Category[] = data.map((c: any) => ({
        id: typeof c._id === "string" ? parseInt(c._id, 36) : c._id || c.id || 0,
        name: c.name,
        ID: c.ID,
        parent: c.parent || "",
        gender: c.gender || "",
        clothingType: c.clothingType || "",
        description: c.description || "",
        imageUrl: c.imageUrl || "",
      })).filter((c: { id: any; ID: any; }) => c.id && c.ID);

      setCategories(mappedData);
      console.log("Fetched categories:", mappedData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch categories";
      setError(message);
      console.error("Error fetching categories:", err);
    }
  }, [getToken]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchCategories();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fetchCategories]);

  if (loading) {
  return (
    <div className="flex items-center justify-center w-screen h-screen bg-white">
      <Loading />
    </div>
  );
}


  if (error) {
    return (
      <div className="p-6 text-red-600">
        {error}
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            fetchCategories().finally(() => setLoading(false));
          }}
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className={`fixed lg:relative z-50 transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar onClose={closeMobileMenu} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-gray-100 min-w-0">
        {/* Top Bar with Mobile Menu Toggle */}
        <div className="h-20 flex items-center px-4 lg:px-6 bg-gray-100 border-b border-gray-200">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden mr-4 p-2 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <FiX className="w-6 h-6 text-gray-700" />
            ) : (
              <FiMenu className="w-6 h-6 text-gray-700" />
            )}
          </button>
          
          {/* Navbar */}
          <div className="flex-1">
            <Navbar />
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Userdashboard categories={categories} />} />
              <Route path="/products" element={<Products />} />
              <Route path="/packing-and-shipping" element={<PackingAndShipping />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/support" element={<Support />} />
              <Route path="/site-settings" element={<Setting />} />
              
              {/* 🔽 Newly added routes below */}
              <Route path="/product/:id" element={<Products />} />
              <Route path="/category/:id" element={<Categories />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
