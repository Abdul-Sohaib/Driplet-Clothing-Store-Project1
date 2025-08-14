/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import img from "@/assets/accountimg1.png";
import img2 from "@/assets/accountimg2.jpg";
import img3 from "@/assets/accountimg3.jpg";
import { motion } from "framer-motion";
import { easeOut } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface User {
  id?: string;
  name: string;
  email: string;
  gender?: string;
}

const textParts = [
  // Line 1
  { text: "I'm a proud ", type: "normal" },
  { text: "DRIPLET", type: "highlight" },
  { text: " wearer — not just for the ", type: "normal" },
  { text: "fashion", type: "highlight" },
  { text: ", but for what it represents. Every piece reflects ", type: "normal" },
  { text: "boldness", type: "highlight" },
  { text: ", ", type: "normal" },
  { text: "creativity", type: "highlight" },
  { text: ", and ", type: "normal" },
  { text: "individuality", type: "highlight" },
  { text: ".", type: "normal" },

  // Line Break
  { text: "\n", type: "newline" },

  // Line 2
  { text: "DRIPLET", type: "normal" },
  { text: " is more than clothing; it's an experience of ", type: "normal" },
  { text: "immersive style", type: "highlight" },
  { text: ", ", type: "normal" },
  { text: "effortless comfort", type: "highlight" },
  { text: ", and ", type: "normal" },
  { text: "confidence", type: "highlight" },
  { text: " in every thread — identity owned unapologetically.", type: "normal" },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { ease: easeOut, duration: 0.4 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

const cardsContainerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const Account: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [gender, setGender] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenderUpdating, setIsGenderUpdating] = useState(false);
  const navigate = useNavigate();

  // Memoized fetch function to prevent recreation on every render
  const fetchUser = useCallback(async (retryCount = 0) => {
    // Prevent multiple simultaneous requests
    if (isLoading && retryCount === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching user data...", { retryCount });
      
      const res = await axios.get(`${API_BASE}/auth/user`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("User fetch successful:", {
        status: res.status,
        hasUser: !!res.data.user,
        userId: res.data.user?.id
      });
      
      if (!res.data.user || !res.data.user.id) {
        throw new Error("Invalid user data received");
      }
      
      setUser(res.data.user);
      setGender(res.data.user?.gender || "");
      
      // Store user data for consistency
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch user data";
      console.error("Error fetching user:", {
        message: errorMsg,
        status: err.response?.status,
        retryCount
      });
      
      // Check if should retry
      const shouldRetry = (
        (errorMsg.includes("Unauthorized") || 
         errorMsg.includes("Invalid token") || 
         errorMsg.includes("User not found") ||
         err.response?.status === 401) && 
        retryCount < 2
      );
      
      if (shouldRetry) {
        console.log(`Retrying user fetch, attempt ${retryCount + 1}`);
        setTimeout(() => fetchUser(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }
      
      // Handle persistent auth failure
      setUser(null);
      setError("Authentication failed. Please log in again.");
      localStorage.removeItem('user');
      
      // Dispatch auth error event
      window.dispatchEvent(new CustomEvent("auth-error", { detail: errorMsg }));
      
      // Redirect to home page after a delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } finally {
      setIsLoading(false);
    }
  }, [navigate, isLoading]);

  // Handle auth changes from other components
  const handleAuthChange = useCallback(() => {
    console.log("Auth change event received in Account");
    // Only fetch if not already loading and no current user
    if (!isLoading && !user) {
      fetchUser();
    }
  }, [fetchUser, isLoading, user]);

  useEffect(() => {
    let isMounted = true;
    
    // Check if user exists in localStorage first
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.id && isMounted) {
          console.log("Using stored user data");
          setUser(parsedUser);
          setGender(parsedUser.gender || "");
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error parsing stored user:", err);
        localStorage.removeItem('user');
      }
    }
    
    // Only fetch if we don't have stored user data
    if (isMounted && !user) {
      fetchUser();
    }

    // Add event listeners
    window.addEventListener("authChange", handleAuthChange);

    return () => {
      isMounted = false;
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, [fetchUser, handleAuthChange, user]); // Empty dependency array to run only once

  const handleGenderChange = async (value: string) => {
    if (isGenderUpdating) return; // Prevent multiple simultaneous updates
    
    const newGender = gender === value ? "" : value;
    const previousGender = gender;
    
    // Optimistic update
    setGender(newGender);
    setIsGenderUpdating(true);
    
    try {
      console.log("Updating gender to:", newGender);
      
      const response = await axios.put(
        `${API_BASE}/auth/user`,
        { gender: newGender },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Gender update successful:", {
        status: response.status,
        newGender: response.data.user?.gender
      });
      
      if (response.data.user) {
        setUser(response.data.user);
        setGender(response.data.user.gender || "");
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Dispatch auth change event
        window.dispatchEvent(new Event("authChange"));
      }
      
      toast.success("Gender updated successfully!");
      
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to update gender";
      console.error("Error updating gender:", {
        message: errorMsg,
        status: err.response?.status
      });
      
      // Revert optimistic update
      setGender(previousGender);
      toast.error(`Failed to update gender: ${errorMsg}`);
      
    } finally {
      setIsGenderUpdating(false);
    }
  };

  // Loading state
  if (isLoading && !user) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-[#F5F5DC]">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-black text-xl font-semibold">Loading your account...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-[#F5F5DC]">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-xl font-bold mb-4">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null);
                fetchUser();
              }}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-[#F5F5DC]">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <p className="text-black text-xl mb-4">No user data available.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="w-screen h-[90vh] flex flex-col overflow-hidden justify-center items-center bg-[#F5F5DC] p-10">
      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-6 place-items-center items-center">
        <div className="col-span-1 flex flex-col justify-between gap-10 w-full">
          <div className="flex flex-col gap-8">
            <h2 className="text-4xl font-bold text-black mb-4 textheading">
              {user.name}
            </h2>

            {/* Animated Paragraph */}
            <motion.div
              className="bg-transparent p-6 rounded-lg"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <motion.p className="text-left leading-16 flex flex-wrap gap-x-1 gap-y-3">
                {textParts.map((part, index) => {
                  const isHighlight = part.type === "highlight";
                  return (
                    <motion.span
                      key={index}
                      variants={itemVariants}
                      className={`${
                        isHighlight
                          ? "textheading text-2xl bg-[#F8E5A2] px-1"
                          : "navfonts text-xl font-bold"
                      } text-black`}
                    >
                      {part.text}
                    </motion.span>
                  );
                })}
              </motion.p>
            </motion.div>

            {/* Gender + Email */}
            <div className="flex w-full justify-between items-center h-full flex-wrap gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-lg text-black navfonts font-bold button-add rounded-3xl px-4 py-2 truncate">
                  {user.email}
                </p>
              </div>
              <div className="flex justify-center items-center gap-5 navfonts button-add rounded-3xl px-4 py-2">
                <label className="text-xl font-semibold text-black">
                  Gender:
                </label>
                <div className="flex gap-4 text-black">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={gender === "Male"}
                      onChange={() => handleGenderChange("Male")}
                      disabled={isGenderUpdating}
                      className="accent-purple-600 cursor-pointer disabled:opacity-50"
                    />
                    <span className={isGenderUpdating ? "opacity-50" : ""}>Male</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={gender === "Female"}
                      onChange={() => handleGenderChange("Female")}
                      disabled={isGenderUpdating}
                      className="accent-purple-600 cursor-pointer disabled:opacity-50"
                    />
                    <span className={isGenderUpdating ? "opacity-50" : ""}>Female</span>
                  </label>
                </div>
                {isGenderUpdating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="col-span-1 flex justify-center items-center w-full">
          <motion.div
            className="relative w-full h-[60vh]"
            variants={cardsContainerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div
              variants={cardVariants}
              className="absolute top-0 right-[2vw] w-[20vw] min-w-[200px] h-fit bg-pink-200 rounded-lg shadow-lg rotate-[-4deg] z-10 overflow-hidden"
            >
              <img 
                src={img} 
                alt="Fashion Image 1" 
                className="object-cover w-full h-full" 
                loading="lazy"
              />
            </motion.div>

            <motion.div
              variants={cardVariants}
              className="absolute left-[0vw] w-[22vw] min-w-[220px] h-fit bg-orange-300 rounded-lg shadow-lg rotate-[4deg] z-20 overflow-hidden"
            >
              <img 
                src={img2} 
                alt="Fashion Image 2" 
                className="object-cover w-full h-full" 
                loading="lazy"
              />
            </motion.div>

            <motion.div
              variants={cardVariants}
              className="absolute top-[19vh] left-[17vw] w-[14vw] min-w-[140px] h-fit bg-white rounded-lg shadow-lg rotate-[-1deg] z-30 overflow-hidden"
            >
              <img 
                src={img3} 
                alt="Fashion Image 3" 
                className="object-cover w-full h-full" 
                loading="lazy"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Account;