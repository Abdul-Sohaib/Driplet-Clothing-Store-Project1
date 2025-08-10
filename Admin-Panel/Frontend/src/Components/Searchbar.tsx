/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

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
    <div className="w-full sm:w-80 lg:w-96 xl:w-[28rem] relative" ref={dropdownRef}>
      <div className="flex items-center border-2 border-gray-300 hover:border-gray-400 focus-within:border-purple-500 rounded-lg overflow-hidden transition-colors">
        <div className="pl-3 pr-2">
          <FiSearch className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products or categories..."
          className="w-full px-3 py-2 focus:outline-none text-sm sm:text-base"
        />
      </div>

      {error && (
        <div className="absolute bg-white text-red-600 p-3 rounded-lg mt-2 w-full z-10 shadow-md border border-red-200 text-sm">
          {error}
        </div>
      )}

      {(showDropdown || loading) && (
        <div className="absolute bg-white shadow-lg p-3 rounded-lg mt-2 w-full z-10 max-h-60 overflow-y-auto border border-gray-200">
          {loading ? (
            <div className="flex justify-center items-center h-16 w-full text-gray-500 text-sm">
              Searching...
            </div>
          ) : (results.products.length > 0 || results.categories.length > 0) ? (
            <>
              <h3 className="font-bold mb-4 text-lg text-center text-gray-800">Search Results</h3>

              {results.products.length > 0 && (
                <>
                  <h4 className="font-bold text-base text-gray-700 mb-2">Products</h4>
                  <div className="space-y-1">
                    {results.products.map((p: any) => (
                      <div
                        key={p._id}
                        onClick={() => handleNavigate("product")}
                        className="cursor-pointer hover:bg-gray-50 py-2 px-2 rounded text-sm transition-colors"
                      >
                        <span className="text-gray-800">{p.name}</span>
                        <span className="text-xs text-gray-500 ml-2">(Product)</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {results.categories.length > 0 && (
                <>
                  <h4 className="font-bold text-base text-gray-700 mb-2 mt-3">Categories</h4>
                  <div className="space-y-1">
                    {results.categories.map((c: any) => (
                      <div
                        key={c._id}
                        onClick={() => handleNavigate("category")}
                        className="cursor-pointer hover:bg-gray-50 py-2 px-2 rounded text-sm transition-colors"
                      >
                        <span className="text-gray-800">{c.name}</span>
                        <span className="text-xs text-gray-500 ml-2">(Category)</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-gray-600 text-sm text-center py-2">No results found.</p>
          )}
        </div>
      )}

      {showDropdown && results.products.length === 0 && results.categories.length === 0 && !loading && (
        <div className="absolute bg-white shadow-lg p-3 rounded-lg mt-2 w-full z-10 border border-gray-200">
          <p className="text-gray-600 text-sm text-center">No results found.</p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
