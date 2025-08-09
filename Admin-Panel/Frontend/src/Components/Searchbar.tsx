/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

let debounceTimeout: NodeJS.Timeout;

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ products: any[]; categories: any[] }>({ products: [], categories: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchResults = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults({ products: [], categories: [] });
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/search`, {
        params: { q: searchTerm },
      });
      setResults(response.data);
      setShowDropdown(true);
    } catch (error: any) {
      console.error("Error searching:", error);
      setError(error.response?.data?.message || "Failed to perform search.");
    } finally {
      setLoading(false);
    }
  };

  // Debounce search as user types
  useEffect(() => {
    clearTimeout(debounceTimeout);
    if (query.trim()) {
      debounceTimeout = setTimeout(() => {
        fetchResults(query);
      }, 400); // 400ms debounce
    } else {
      setShowDropdown(false);
    }

    return () => clearTimeout(debounceTimeout);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (type: "product" | "category") => {
    setShowDropdown(false);
    setQuery("");
    setResults({ products: [], categories: [] });
    if (type === "product") navigate("/products");
    else navigate("/categories");
  };

  return (
    <div className="w-96 relative" ref={dropdownRef}>
      <div className="flex items-center border-2 border-black rounded-lg overflow-hidden">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products or categories..."
          className="w-full px-4 py-2 focus:outline-none"
        />
      </div>

      

      {error && (
        <div className="absolute bg-white text-red-600 p-4 rounded-lg mt-2 w-full z-10 shadow-md">{error}</div>
      )}

{(showDropdown || loading) && (
  <div className="absolute bg-white shadow-lg p-4 rounded-lg mt-2 w-full z-10 max-h-60 overflow-y-auto">
    {loading ? (
      <div className="flex justify-center items-center h-20 w-full">
        loading.....
      </div>
    ) : (results.products.length > 0 || results.categories.length > 0) ? (
      <>
        <h3 className="font-bold mb-7 text-xl text-center">Results</h3>

        {results.products.length > 0 && (
          <>
            <h4 className="font-bold text-lg text-black">Products</h4>
            {results.products.map((p: any) => (
              <p
                key={p._id}
                onClick={() => handleNavigate("product")}
                className="cursor-pointer hover:text-blue-600 py-1"
              >
                {p.name} <span className="text-xs text-gray-500">(Product)</span>
              </p>
            ))}
          </>
        )}

        {results.categories.length > 0 && (
          <>
            <h4 className="font-bold text-lg text-black mt-2">Categories</h4>
            {results.categories.map((c: any) => (
              <p
                key={c._id}
                onClick={() => handleNavigate("category")}
                className="cursor-pointer hover:text-blue-600 py-1"
              >
                {c.name} <span className="text-xs text-gray-500">(Category)</span>
              </p>
            ))}
          </>
        )}
      </>
    ) : (
      <p className="text-gray-600">No results found.</p>
    )}
  </div>
)}



      {showDropdown && results.products.length === 0 && results.categories.length === 0 && (
        <div className="absolute bg-white shadow-lg p-4 rounded-lg mt-2 w-full z-10">
          <p className="text-gray-600">No results found.</p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
