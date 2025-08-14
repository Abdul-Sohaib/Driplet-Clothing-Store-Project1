/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import classNames from "classnames";
import SearchBar from "./Searchbar";
import AuthPopup from "./AuthPopup";
import UserCard from "./UserCard";
import { BsBox2HeartFill } from "react-icons/bs";
import { MdOutlineShoppingCartCheckout } from "react-icons/md";
import { HiMenu, HiX } from "react-icons/hi";
import { IoPersonCircleOutline } from "react-icons/io5";
import { RiLogoutCircleRFill } from "react-icons/ri";
import userprofileimg from '@/assets/back.png';

// API_BASE is now handled by axiosInstance

interface Category {
  id: number;
  name: string;
  ID: string;
  parent?: string;
  gender?: string;
  clothingType?: string;
  description?: string;
  imageUrl?: string;
}

interface User {
  name: string;
  email: string;
}

interface NavbarProps {
  setIsCartOpen: (open: boolean) => void;
  onWishlistClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ setIsCartOpen, onWishlistClick }) => {
  const [logoUrl, setLogoUrl] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [showUserCard, setShowUserCard] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeParent, setActiveParent] = useState<string | null>(null);
  const [isHoveringNav, setIsHoveringNav] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logoRes, catRes] = await Promise.all([
          axiosInstance.get(`/site-settings`),
          axiosInstance.get(`/categories`),
        ]);
        setLogoUrl(logoRes.data.logoUrl || "");
        setCategories(catRes.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();

    const checkAuth = async (retryCount = 0) => {
      try {
        const res = await axiosInstance.get(`/auth/user`, { withCredentials: true });
        console.log("Auth check response:", {
          data: res.data,
          status: res.status,
          headers: res.headers,
        });
        setUser(res.data.user || null);
        window.dispatchEvent(new Event("authChange"));
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || err.message || "Auth check failed";
        console.error("Initial auth check error:", {
          message: errorMsg,
          status: err.response?.status,
          headers: err.response?.headers,
        });
        if ((errorMsg.includes("Unauthorized") || errorMsg.includes("Invalid token")) && retryCount < 3) {
          setTimeout(() => checkAuth(retryCount + 1), Math.pow(2, retryCount) * 1000);
          return;
        }
        setUser(null);
        const timeout = setTimeout(() => setShowAuth(true), 2000);
        return () => clearTimeout(timeout);
      }
    };
    checkAuth();
  }, [showAuth]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post(`/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      setShowUserCard(false);
      setTimeout(() => setShowAuth(true), 10000);
      window.dispatchEvent(new Event("authChange"));
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleAuthSuccess = (user: User | null) => {
    setUser(user);
    setShowAuth(false);
    window.dispatchEvent(new Event("authChange"));
  };

  const handleCartClick = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setIsCartOpen(true);
  };

  const navLinks = useMemo(() => {
    const topLevelCategories = categories.filter(cat => !cat.parent);
    const parentNames = [
      ...new Set([...topLevelCategories.map(cat => cat.name), ...categories.filter(cat => cat.parent).map(cat => cat.parent)]),
    ].filter(Boolean) as string[];

    return parentNames.map((parentName) => {
      const parent = topLevelCategories.find((cat) => cat.name === parentName) || {
        name: parentName,
        ID: `p-${parentName.replace(/\s+/g, "-")}`,
      };
      const children = categories.filter((cat) => cat.parent === parentName).map((cat) => ({
        name: cat.name,
        to: `/category/${cat.ID}`,
      }));
      return {
        name: parent.name,
        to: `/${parent.name.toLowerCase().replace(/\s+/g, "-")}`,
        children,
      };
    });
  }, [categories]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {showAuth && <AuthPopup onClose={handleAuthSuccess} />}
      <div className="w-screen inset-0 bg-[#F5F5DC] shadow-md z-50 transition-all duration-300">
        <div
          className={`flex flex-col transition-all duration-300 ease-in-out ${isHoveringNav ? "min-h-fit" : "min-h-fit"}`}
          onMouseLeave={() => {
            setIsHoveringNav(false);
            setActiveParent(null);
          }}
        >
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-between px-4 xl:px-6 2xl:px-8 py-3">
            <div className="flex items-center gap-6 xl:gap-10">
              <Link to="/" className="flex items-center">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-16 xl:w-20 2xl:w-24 object-contain" />
                ) : (
                  <span className="text-xl xl:text-2xl 2xl:text-3xl font-bold">Driplet</span>
                )}
              </Link>
              <nav
                className="flex items-center gap-4 xl:gap-6 2xl:gap-8 relative w-full"
                onMouseEnter={() => setIsHoveringNav(true)}
              >
                {navLinks.map((link) => (
                  <div
                    key={link.name}
                    className="relative"
                    onMouseEnter={() => setActiveParent(link.name)}
                  >
                    <Link
                      to={link.to}
                      className={classNames("text-black font-bold hover:text-purple-600 navfonts text-sm xl:text-md 2xl:text-sm uppercase transition-colors duration-200")}
                    >
                      {link.name}
                    </Link>
                    {link.children.length > 0 && <span className="tracking-wide navheading"></span>}
                  </div>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4 xl:gap-6 2xl:gap-8 justify-center">
              <SearchBar />
              <div
                className="relative hover:border-b-3 border-purple-500 active:border-b-3"
                onMouseEnter={() => setShowUserCard(true)}
              >
                <button
                  className="text-xl xl:text-2xl 2xl:text-3xl text-black hover:text-purple-600 transition-colors duration-200"
                >
                  <img src={userprofileimg} alt="Profile" className="rounded-full w-12 xl:w-16 2xl:w-20 bg-transparent" />
                </button>
                {showUserCard && user && (
                  <UserCard
                    user={user}
                    onLogout={handleLogout}
                    onClose={() => setShowUserCard(false)}
                  />
                )}
              </div>
              <button
                onClick={onWishlistClick}
                className="text-lg xl:text-xl 2xl:text-2xl text-red-400 hover:text-red-500 transition-colors duration-200 cursor-pointer"
              >
                <BsBox2HeartFill />
              </button>
              <button
                onClick={handleCartClick}
                className="text-xl xl:text-2xl 2xl:text-3xl text-black hover:text-purple-600 transition-colors duration-200 cursor-pointer"
              >
                <MdOutlineShoppingCartCheckout />
              </button>
            </div>
          </div>

          {/* Mobile Navigation Header */}
          <div className="lg:hidden flex items-center justify-between h-fit p-1 sm:px-4 ">
            <Link to="/" className="flex items-center">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-12 sm:w-16 object-contain" />
              ) : (
                <span className="text-lg sm:text-xl font-bold">Driplet</span>
              )}
            </Link>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="">
                <SearchBar />
              </div>
              <button
                onClick={onWishlistClick}
                className="text-lg sm:text-xl text-red-400 hover:text-red-500 transition-colors duration-200 cursor-pointer p-1"
              >
                <BsBox2HeartFill />
              </button>
              <button
                onClick={handleCartClick}
                className="text-lg sm:text-xl text-black hover:text-purple-600 transition-colors duration-200 cursor-pointer p-1"
              >
                <MdOutlineShoppingCartCheckout />
              </button>
              <button
                onClick={toggleMobileMenu}
                className="text-xl sm:text-2xl text-black hover:text-purple-600 transition-colors duration-200 cursor-pointer p-1"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? <HiX /> : <HiMenu />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="px-3 sm:px-4 pb-4 border-t border-gray-200">
              {/* User Profile Section */}
              <div className="py-4 border-b border-gray-200">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={userprofileimg} alt="Profile" className="rounded-full w-10 sm:w-12 bg-transparent" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-black text-sm sm:text-base truncate">{user.name}</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="relative group bg-transparent outline-none cursor-pointer uppercase"
                    >
                      <span className="absolute top-0 left-0 w-full h-full bg-[#101A13] bg-opacity-30 rounded-lg transform translate-y-0.5 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:translate-y-1 group-hover:duration-250 group-active:translate-y-px"></span>
                      <div className="relative flex items-center justify-between py-2 sm:py-3 px-4 sm:px-6 text-base sm:text-lg text-white rounded-lg transform -translate-y-1 bg-red-500 gap-2 sm:gap-3 transition duration-600 ease-[cubic-bezier(0.3,0.7,0.4,1)] group-hover:-translate-y-1.5 group-hover:duration-250 group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110 shadow-md border-2 border-[#101A13] hover:border-purple-500 active:border-purple-700">
                        <span className="select-none text-xs navfonts font-semibold">Logout</span>
                        <RiLogoutCircleRFill className="w-4 sm:w-5 transition duration-250 group-hover:-translate-x-1" />
                      </div>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAuth(true)}
                    className="w-full text-left py-3 px-4 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <IoPersonCircleOutline className="text-lg" />
                    <span className="font-semibold">Sign In / Register</span>
                  </button>
                )}
              </div>

              {/* Navigation Links */}
              <nav className="py-4">
                {navLinks.map((link) => (
                  <div key={link.name} className="mb-2">
                    <Link
                      to={link.to}
                      onClick={closeMobileMenu}
                      className="block py-3 px-4 text-black font-semibold hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200 navfonts uppercase text-sm sm:text-base"
                    >
                      {link.name}
                    </Link>
                    {link.children.length > 0 && (
                      <div className="ml-4 mt-2 space-y-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.name}
                            to={child.to}
                            onClick={closeMobileMenu}
                            className="block py-2 px-4 text-sm text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors duration-200 navfonts"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>

        
          {activeParent && (
           
            <div className="hidden lg:block px-6 xl:px-28 2xl:px-32 pb-4 mt-8 mb-4">
              <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 w-full gap-6 xl:gap-10 navfonts">
                {navLinks
                  .find((p) => p.name === activeParent)
                  ?.children?.map((child) => (
                    <Link
                      key={child.name}
                      to={child.to}
                      className="text-sm xl:text-md 2xl:text-sm text-black hover:text-purple-600 uppercase navfonts font-semibold transition-colors duration-200"
                    >
                      {child.name}
                    </Link>
                    
                  )) || null}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;