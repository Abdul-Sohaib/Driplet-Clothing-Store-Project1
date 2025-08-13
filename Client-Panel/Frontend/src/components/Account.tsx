/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import img from "@/assets/accountimg1.png";
import img2 from "@/assets/accountimg2.jpg";
import img3 from "@/assets/accountimg3.jpg";
import { motion } from "framer-motion";
import { easeOut } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface User {
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


// Variants
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

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE}/auth/user`, {
          withCredentials: true,
        });
        console.log("User fetch response:", {
          data: res.data,
          status: res.status,
          headers: res.headers,
        });
        setUser(res.data.user || null);
        setGender(res.data.user?.gender || "");
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message || err.message || "Failed to fetch user data";
        console.error("Error fetching user:", {
          message: errorMsg,
          status: err.response?.status,
          headers: err.response?.headers,
        });
        setError(errorMsg);
        toast.error(`Failed to fetch user data: ${errorMsg}. Please try again.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    // Listen for auth changes
    const handleAuthChange = () => fetchUser();
    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, []);

  const handleGenderChange = async (value: string) => {
    const newGender = gender === value ? "" : value;
    setGender(newGender);
    setIsLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE}/auth/user`,
        { gender: newGender },
        { withCredentials: true }
      );
      console.log("Gender update response:", {
        data: response.data,
        status: response.status,
        headers: response.headers,
      });
      setUser(response.data.user || null);
      setGender(response.data.user?.gender || "");
      toast.success("Gender updated successfully!");
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to update gender";
      console.error("Error updating gender:", {
        message: errorMsg,
        status: err.response?.status,
        headers: err.response?.headers,
      });
      toast.error(`Failed to update gender: ${errorMsg}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-[#F5F5DC]">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <p className="text-red-600 text-xl font-bold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-[#F5F5DC]">
        <p className="text-black text-xl">No user data available.</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-[90vh] flex flex-col overflow-hidden justify-center items-center bg-[#F5F5DC] p-10">
      <div className="w-full h-full grid grid-cols-2 gap-6 place-items-center items-center">
        <div className="col-span-1 flex flex-col justify-between gap-10">
          <div className="flex flex-col gap-8">
            <h2 className="text-4xl font-bold text-black mb-4 textheading">{user.name}</h2>

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
            <div className="flex w-full justify-between items-center h-full">
              <p className="text-lg text-black mb-4 navfonts font-bold button-add rounded-3xl">
                {user.email}
              </p>
              <div className="flex justify-center items-center gap-5 navfonts button-add rounded-3xl">
                <label className="text-xl font-semibold text-black">
                  Gender--
                </label>
                <div className="mt-2 flex gap-4 text-black">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={gender === "Male"}
                      onChange={() => handleGenderChange("Male")}
                      disabled={isLoading}
                      className="accent-purple-600 cursor-pointer"
                    />
                    Male
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={gender === "Female"}
                      onChange={() => handleGenderChange("Female")}
                      disabled={isLoading}
                      className="accent-purple-600 cursor-pointer"
                    />
                    Female
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

      
        <div className="col-span-1 flex justify-center items-center">
          <motion.div
            className="relative w-full h-[60vh]"
            variants={cardsContainerVariants}
            initial="hidden"
            animate="show"
          >
        
            <motion.div
              variants={cardVariants}
              className="absolute top-0 right-[2vw] w-[20vw] h-fit bg-pink-200 rounded-lg shadow-lg rotate-[-4deg] z-10 overflow-hidden"
            >
              <img src={img} alt="Image 1" className="object-cover w-full h-full" />
            </motion.div>

          
            <motion.div
              variants={cardVariants}
              className="absolute left-[0vw] w-[22vw] h-fit bg-orange-300 rounded-lg shadow-lg rotate-[4deg] z-20 overflow-hidden"
            >
              <img src={img2} alt="Image 2" className="object-cover w-full h-full" />
            </motion.div>

            
            <motion.div
              variants={cardVariants}
              className="absolute top-[17vh] -left-[9vw] w-[14vw] h-fit bg-white rounded-lg shadow-lg rotate-[-1deg] z-30 overflow-hidden"
            >
              <img src={img3} alt="Image 3" className="object-cover w-full h-full" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Account;