/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import classNames from "classnames";
import SearchBar from "./Searchbar";
import AuthPopup from "./AuthPopup";
import UserCard from "./UserCard";
import { BsBox2HeartFill } from "react-icons/bs";
import { MdOutlineShoppingCartCheckout } from "react-icons/md";
import { HiMenu, HiX } from "react-icons/hi";
import { IoPersonCircleOutline } from "react-icons/io5";
import userprofileimg from '@/assets/back.png';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

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
          axios.get(`${API_BASE}/site-settings`, { withCredentials: true }),
          axios.get(`${API_BASE}/categories`, { withCredentials: true }),
        ]);
        setLogoUrl(logoRes.data.logoUrl || "");
        setCategories(catRes.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();

    const checkAuth = async () => {
      try {
        const res = await axios.get(`${API_BASE}/auth/user`, { withCredentials: true });
        setUser(res.data.user || null);
      } catch (err) {
        console.error("Initial auth check error:", (err as any)?.response?.data?.message || (err as any)?.message);
        setUser(null);
        const timeout = setTimeout(() => setShowAuth(true), 2000);
        return () => clearTimeout(timeout);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      setShowUserCard(false);
      setTimeout(() => setShowAuth(true), 10000);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleAuthSuccess = (user: User) => {
    setUser(user);
    setShowAuth(false);
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
          className={`flex flex-col transition-all duration-300 ease-in-out ${isHoveringNav ? "min-h-[15vh]" : "min-h-[10vh]"}`}
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
          <div className="lg:hidden flex items-center justify-between px-3 sm:px-4 py-3">
            <Link to="/" className="flex items-center">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-12 sm:w-16 object-contain" />
              ) : (
                <span className="text-lg sm:text-xl font-bold">Driplet</span>
              )}
            </Link>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:block">
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

          {/* Mobile Search Bar (shown when menu is closed) */}
          <div className={`lg:hidden md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            !isMobileMenuOpen ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="px-3 sm:px-4 pb-3">
              <SearchBar />
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
                  <div className="flex items-center gap-3">
                    <img src={userprofileimg} alt="Profile" className="rounded-full w-10 sm:w-12 bg-transparent" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-black text-sm sm:text-base truncate">{user.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                    </div>
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

              {/* User Actions */}
              {user && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="w-full text-left py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 font-semibold"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Dropdown Menu */}
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