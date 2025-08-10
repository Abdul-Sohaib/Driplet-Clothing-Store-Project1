/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TbSearch } from "react-icons/tb";
import { AnimatePresence, motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const placeholderTexts = ["T-shirts", "Oversized Hoodie", "Cotton Pants", "Graphic Tees"];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Cycle placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % placeholderTexts.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [placeholderTexts.length]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape to close dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowDropdown(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Dynamic search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_BASE}/search`, {
          params: { q: query },
        });
        const filtered = (res.data.products || []).filter((p: any) =>
          p.name.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered.slice(0, 6));
        setShowDropdown(true);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      }
    }, 300);
  }, [query]);

  const handleResultClick = (id: string) => {
    setShowDropdown(false);
    setQuery("");
    navigate(`/product/${id}`);
  };

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg" ref={ref}>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex rounded-lg overflow-hidden border-2 border-[#101A13] shadow-lg px-2 sm:px-3 md:px-4 py-1 bg-[#f9f6ff] relative"
      >
        <div className="relative w-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent outline-none text-xs sm:text-sm text-black placeholder-transparent"
          />
          {/* Animated Placeholder */}
          {!query && (
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 pointer-events-none text-xs text-black/50 h-[16px] sm:h-[20px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="block"
                >
                  <span className="hidden sm:inline">Try searching "</span>
                  {placeholderTexts[currentIndex]}
                  <span className="hidden sm:inline">"</span>
                </motion.span>
              </AnimatePresence>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="cursor-pointer px-1 sm:px-2 py-1 sm:py-2 text-[#101A13] hover:text-purple-800 transition-colors"
        >
          <TbSearch className="size-4 sm:size-5 md:size-6" />
        </button>
      </form>

      {showDropdown && results.length > 0 && (
        <div className="absolute bg-white border-2 border-[#101A13] shadow-lg rounded-lg mt-1 sm:mt-2 w-full z-50 max-h-48 sm:max-h-60 overflow-y-auto divide-y divide-black">
          {results.map((item: any) => (
            <div
              key={item._id}
              onClick={() => handleResultClick(item._id)}
              className="px-3 sm:px-4 py-2 hover:bg-purple-50 cursor-pointer transition-colors text-sm sm:text-base"
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
