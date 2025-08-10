import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import fashion from "@/assets/fashion.gif"; // Assuming you have a fashion imag

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Category {
  id: number;
  name: string;
  ID: string;
  parent?: string;
}

interface User {
  name: string;
  email: string;
}

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await axios.get(`${API_BASE}/categories`, { withCredentials: true });
        setCategories(catRes.data || []);
      } catch (err) {
        console.error("Fetch categories error:", err);
      }
    };

    const checkAuth = async () => {
      try {
        const res = await axios.get(`${API_BASE}/auth/user`, { withCredentials: true });
        setUser(res.data.user || null);
      } catch (err) {
        console.error("Auth check error:", err);
        setUser(null);
      }
    };

    fetchData();
    checkAuth();
  }, []);

  const topLevelCategories = categories.filter(cat => !cat.parent);

  const handleAuthLinkClick = () => {
    if (user) {
      toast.info(`You are already logged in as ${user.name}!`, {
        position: "top-center",
        autoClose: 3000,
      });
    }
    return !user; // Return true to allow navigation if not logged in
  };

  return (
    <div className="flex flex-col bg-[#111211] text-white w-full rounded-t-xl">
      {/* Marquee Section */}
<div className="w-full overflow-hidden bg-[#FBCA1F] py-2 border-t border-black ">
  <div className="marquee flex text-sm sm:text-base md:text-lg text-black gap-20 sm:gap-40 md:gap-60 navfonts font-semibold uppercase">
    <div className="marquee-content flex gap-20 sm:gap-40 md:gap-60 items-center">
      <span className="mx-2 sm:mx-4 flex items-center gap-1 sm:gap-2">
        <img src={fashion} alt="" className="w-6 sm:w-8 " />
         <span>Streetwear Essentials</span>
      </span>
      <span className="mx-2 sm:mx-4 flex items-center gap-1 sm:gap-2">
        <img src={fashion} alt="" className="w-6 sm:w-8 " />
        <span>Luxury Fits</span>
      </span>
      <span className="mx-2 sm:mx-4 flex items-center gap-1 sm:gap-2">
        <img src={fashion} alt="" className="w-6 sm:w-8 " />
        <span>Seasonal Drops</span>
      </span>
      <span className="mx-2 sm:mx-4 flex items-center gap-1 sm:gap-2">
        <img src={fashion} alt="" className="w-6 sm:w-8 " />
        <span>Personal Styling</span>
      </span>
    </div>

    {/* Duplicate for seamless looping */}
    <div className="marquee-content text-sm sm:text-base md:text-lg text-black navfonts font-semibold uppercase flex gap-20 sm:gap-40 md:gap-60 items-center">
      <span className="mx-2 sm:mx-4 flex items-center gap-1 sm:gap-2">
        <img src={fashion} alt="" className="w-6 sm:w-8 " />
        <span>Curated Collections</span>
      </span>
      <span className="mx-2 sm:mx-4 flex items-center gap-1 sm:gap-2">
        <img src={fashion} alt="" className="w-6 sm:w-8 " />
        <span>Limited Edition Drops</span>
      </span>
      <span className="mx-2 sm:mx-4 flex items-center gap-1 sm:gap-2">
        <img src={fashion} alt="" className="w-6 sm:w-8 " />
        <span>On-Point Streetwear</span>
      </span>
      <span className="mx-2 sm:mx-4 flex items-center gap-1 sm:gap-2">
        <img src={fashion} alt="" className="w-6 sm:w-8 " />
        <span>Style Consultations</span>
      </span>
    </div>
  </div>

  <style>
    {`
      .marquee {
        width: max-content;
        animation: scroll-marquee 20s linear infinite;
      }

      @keyframes scroll-marquee {
        0% {
          transform: translateX(0%);
        }
        100% {
          transform: translateX(-50%);
        }
      }
    `}
  </style>
</div>



      {/* Main Footer */}
      <footer className="relative overflow-hidden px-3 sm:px-4 md:px-6 lg:px-10 py-6 sm:py-8 md:py-10 flex flex-col">
        {/* Brand Watermark Background */}
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none select-none z-0">
          <span className="font-extrabold text-center w-full text-6xl sm:text-8xl md:text-10xl lg:text-12xl text-yellow-400 opacity-10 tracking-widest uppercase custom-footer-watermark">
            DRIPLET
          </span>
        </div>

        {/* Footer Content Grid */}
        <div className="relative z-10 max-w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-8">
          {/* Discovery Call / About Section */}
          <div className="flex flex-col sm:col-span-2 lg:col-span-1">
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 uppercase">Let's Connect</h3>
            <p className="mb-3 sm:mb-4 text-gray-300 text-sm sm:text-base">Know the drip. Feel the fit. Book your style session or explore our curated collection built for every moment that matters.</p>
            <div className="flex flex-col gap-3 ">
              <a
                href="/collections"
                className="text-black font-bold py-2 px-3 sm:px-4 rounded-full w-max bg-yellow-400 hover:bg-yellow-300 transition text-sm sm:text-base"
              >
                See Our Collections
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col justify-center ">
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 uppercase">Navigation</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link
                  to="/login"
                  onClick={handleAuthLinkClick}
                  className="hover:underline text-sm sm:text-base"
                >
                  Log In
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  onClick={handleAuthLinkClick}
                  className="hover:underline text-sm sm:text-base"
                >
                  Sign Up
                </Link>
              </li>
              {topLevelCategories.map((category) => (
                <li key={category.ID}>
                  <Link
                    to={`/${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="hover:underline text-sm sm:text-base"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <a href="/faqs" className="hover:underline text-sm sm:text-base">FAQs</a>
              </li>
            </ul>
          </div>

          {/* Legal Info */}
          <div className="flex flex-col justify-center ">
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 uppercase">Legal</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <a href="/terms" className="hover:underline text-sm sm:text-base">Terms & Conditions</a>
              </li>
              <li>
                <a href="/privacy" className="hover:underline text-sm sm:text-base">Privacy Policy</a>
              </li>
              <li>
                <a href="/shipping" className="hover:underline text-sm sm:text-base">Shipping & Returns</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col justify-center ">
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 uppercase">Contact Us</h3>
            <ul className="space-y-1 sm:space-y-2 flex flex-col justify-center ">
              <li className="text-sm sm:text-base">
                Email: <a href="mailto:support@driplet.com" className="underline">support@driplet.com</a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-black font-bold py-2 px-3 sm:px-4 rounded-full w-max bg-yellow-400 hover:bg-yellow-300 transition flex text-sm sm:text-base"
                >
                  Chat with Us
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="flex flex-col justify-center sm:col-span-2 lg:col-span-1">
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 uppercase">Connect</h3>
            <div className="flex flex-col gap-2 sm:gap-3">
              <a
                href="https://instagram.com/driplet"
                className="border border-gray-500 py-2 px-3 sm:px-4 rounded-full hover:bg-gray-800 transition text-center text-sm sm:text-base"
                rel="noopener noreferrer"
                target="_blank"
              >
                Follow Us on Instagram
              </a>
              <a
                href="https://twitter.com/driplet"
                className="border border-gray-500 py-2 px-3 sm:px-4 rounded-full hover:bg-gray-800 transition text-center text-sm sm:text-base"
                rel="noopener noreferrer"
                target="_blank"
              >
                Follow Us on X
              </a>
            </div>
          </div>
        </div>

        {/* Go to Top Button and Copyright */}
        <div className="relative z-10 w-full mx-auto mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left text-gray-500 text-xs sm:text-sm">
            &copy; {new Date().getFullYear()} DRIPLET. All rights reserved.
          </div>
          <div className="flex justify-center sm:justify-end">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              className="bg-gray-900 hover:bg-gray-700 p-2 rounded-full border border-gray-600 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-6 sm:w-6 text-gray-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}