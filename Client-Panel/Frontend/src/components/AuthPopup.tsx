/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { format } from 'date-fns';
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface User {
  name: string;
  email: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  code: string;
}

interface AuthPopupProps {
  onClose: (user: User | null) => void; // Updated to allow null for logout
  isAuthenticated?: boolean; // Optional prop to indicate if user is logged in
}

const AuthPopup = ({ onClose, isAuthenticated = false }: AuthPopupProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [forgotMode, setForgotMode] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const now = new Date();
  const month = format(now, 'MMM'); // 'Jan'
  const year = format(now, 'yyyy'); // '2025'
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    code: ""
  });

  useEffect(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchUser = async (_retryCount = 0) => {
    setIsLogin(true);
    setError(null);
    try {
      console.log("Attempting to fetch user with credentials:", {
        withCredentials: true,
        origin: window.location.origin
      });
      
      const res = await axios.get(`${API_BASE}/auth/user`, {
        withCredentials: true,
      });
      
      console.log("Cookies in response:", res.headers['set-cookie']);
      // ... rest of your code
    } catch (err: any) {
      console.error("Cookie debug:", {
        cookies: document.cookie,
        origin: window.location.origin,
        error: err.response?.data
      });
      // ... rest of your error handling
    }
  };
  fetchUser();
}, []);
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "password" ? value.trim() : value
    }));
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

 const handleApiError = useCallback((err: any) => {
  const message = err.response?.data?.message || err.message;
  if (message.includes('CORS') || message.includes('Origin not allowed')) {
    toast.error("Authentication failed due to security restrictions. Please try again or contact support.");
    console.error("CORS Error:", {
      url: err.config?.url,
      origin: window.location.origin,
      error: message
    });
  } else {
    toast.error(message || "Operation failed");
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [forgotMode, isLogin]);

  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/user`, { withCredentials: true });
      console.log("User fetch response:", res.data);
      return res.data.user;
    } catch (err: any) {
      console.error("User fetch error:", err.response?.data?.message || err.message);
      throw err;
    }
  }, []);

  

  const handleRegister = useCallback(async () => {
    if (formData.password.trim().length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      console.log("Register attempt:", { name: formData.name, email: formData.email.toLowerCase(), password: "[REDACTED]" });
      await axios.post(`${API_BASE}/auth/register`, {
        name: formData.name,
        email: formData.email.toLowerCase(),
        password: formData.password.trim()
      }, { withCredentials: true });
      const user = await fetchUser();
      onClose(user);
      toast.success("Registration successful!");
    } catch (err: any) {
      handleApiError(err);
    }
  }, [formData, onClose, handleApiError, fetchUser]);

  const handleLogin = useCallback(async () => {
    try {
      console.log("Login attempt:", { email: formData.email.toLowerCase(), password: "[REDACTED]" });
      await axios.post(`${API_BASE}/auth/login`, {
        email: formData.email.toLowerCase(),
        password: formData.password.trim()
      }, { withCredentials: true });
      const user = await fetchUser();
      onClose(user);
      toast.success("Login successful!");
    } catch (err: any) {
      handleApiError(err);
    }
  }, [formData, onClose, handleApiError, fetchUser]);

  const handleLogout = useCallback(async () => {
    try {
      console.log("Logout attempt");
      await axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true });
      onClose(null); // Clear user state
      toast.success("Logout successful!");
    } catch (err: any) {
      console.error("Logout error:", err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || "Logout failed");
    }
  }, [onClose]);

  const handleForgotPassword = useCallback(async () => {
    try {
      const res = await axios.post(`${API_BASE}/auth/forgot-password`, { 
        email: formData.email.toLowerCase() 
      }, { withCredentials: true });
      toast.success(res.data.message);
      setStep(2);
    } catch (err: any) {
      handleApiError(err);
    }
  }, [formData, handleApiError]);

  const handleVerifyCode = useCallback(async () => {
    try {
      const res = await axios.post(`${API_BASE}/auth/verify-code`, {
        email: formData.email.toLowerCase(),
        code: formData.code,
        newPassword: formData.password.trim()
      }, { withCredentials: true });
      toast.success(res.data.message);
      setIsLogin(true);
      setForgotMode(false);
      setStep(1);
    } catch (err: any) {
      handleApiError(err);
    }
  }, [formData, handleApiError]);

  return (
    <div className="fixed  inset-0 bg-black/20 backdrop-blur-md bg-opacity-50 flex justify-center items-center w-screen h-screen z-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 bg-transparent rounded-2xl sm:rounded-3xl max-w-[90vw] sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] w-scren shadow-2xl">
        {/* First section: Form and login/signup toggle */}
        <AnimatePresence>
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center p-4 sm:p-6 bg-white/10 backdrop-blur-xl border-3 border-white/20 rounded-2xl sm:rounded-3xl shadow-lg w-full md:col-span-2 min-w-0"
          >
            {/* Close button for small screens */}
            <button
              onClick={() => onClose(isAuthenticated ? null : { name: "", email: "" })}
              className="md:hidden absolute top-2 right-2 text-xl font-bold text-red-500 hover:text-red-600 cursor-pointer bg-transparent z-20 p-1 sm:p-2"
              style={{ lineHeight: 1 }}
            >
              <IoIosCloseCircle />
            </button>

            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black mb-4 sm:mb-6 textheading">
              {forgotMode ? "Reset Password" : isLogin ? "Login" : "Sign Up"}
            </h1>

            <div className="w-full max-w-[300px] sm:max-w-[350px] md:max-w-[400px] flex flex-col gap-3 sm:gap-4">
              {!isLogin && !forgotMode && (
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FBCA1F] text-black text-sm sm:text-base navfonts"
                />
              )}
              {step === 1 && (
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FBCA1F] text-black text-sm sm:text-base navfonts"
                />
              )}
              {step === 1 && !forgotMode && (
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FBCA1F] text-black text-sm sm:text-base navfonts"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              )}
              {forgotMode && step === 2 && (
                <input
                  type="text"
                  name="code"
                  placeholder="Reset Code"
                  value={formData.code}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FBCA1F] text-black text-sm sm:text-base navfonts"
                />
              )}
              <button
                onClick={forgotMode ? (step === 1 ? handleForgotPassword : handleVerifyCode) : (isLogin ? handleLogin : handleRegister)}
                className="w-full  text-black font-semibold py-2 sm:py-3 rounded-lg button-add text-sm sm:text-base navfonts"
              >
                {forgotMode ? (step === 1 ? "Send Reset Code" : "Verify Code") : (isLogin ? "Login" : "Sign Up")}
              </button>
            </div>

            <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-black navfonts">
              {forgotMode ? (
                <span
                  className="text-[#FBCA1F] cursor-pointer hover:underline"
                  onClick={() => {
                    setForgotMode(false);
                    setStep(1);
                  }}
                >
                  Back to Login
                </span>
              ) : isLogin ? (
                <>
                  <span
                    className="text-[#FBCA1F] cursor-pointer hover:underline"
                    onClick={() => setForgotMode(true)}
                  >
                    Forgot Password?
                  </span>
                  {" | "}
                  <span
                    className="text-[#FBCA1F] cursor-pointer hover:underline"
                    onClick={() => {
                      setIsLogin(false);
                      setForgotMode(false);
                      setStep(1);
                    }}
                  >
                    Sign up
                  </span>
                  {isAuthenticated && (
                    <>
                      {" | "}
                      <span
                        className="text-[#FBCA1F] cursor-pointer hover:underline"
                        onClick={handleLogout}
                      >
                        Logout
                      </span>
                    </>
                  )}
                </>
              ) : (
                <span
                  className="text-[#FBCA1F] cursor-pointer hover:underline"
                  onClick={() => {
                    setIsLogin(true);
                    setForgotMode(false);
                    setStep(1);
                  }}
                >
                  Log in
                </span>
              )}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Second section: Minimal text and pink circle - hidden on small screens, cross button on md+ */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex flex-1 items-center justify-start sm:p-6 bg-white/10 backdrop-blur-xl border-3 border-white/20 rounded-2xl sm:rounded-3xl shadow-lg min-w-0 min-h-[180px] md:min-h-0 w-full md:w-auto md:col-span-1 relative showcaseback3"
          >
            {/* Close button on the outer container */}
            <button
              onClick={() => onClose(isAuthenticated ? null : { name: "", email: "" })}
              className="absolute top-2 right-2 text-xl font-bold sm:text-xl md:text-2xl text-red-500 hover:text-red-600 cursor-pointer bg-transparent z-20 p-1 sm:p-2"
              style={{ lineHeight: 1 }}
            >
              <IoIosCloseCircle />
            </button>
            <div className="flex justify-start items-center w-fit h-full bg-white/5 backdrop-blur-xs border-2 border-white/20 rounded-2xl sm:rounded-3xl z-10  min-w-0">
              <div className="flex flex-col w-full h-full justify-between p-2">
                <div className="flex flex-col gap-1 sm:gap-2">
                  <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-black textheading">{month}</h1>
                  <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-medium text-black navfonts">{year}</h2>
                </div>
                <div className="text-xs sm:text-sm md:text-base lg:text-lg text-center font-bold text-[#FBCA1F] textheading">
                  <h1>DRIPLET</h1>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        {/* Third section: References/Quote */}
        <AnimatePresence>
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row flex-wrap items-center justify-center p-4 sm:p-6 bg-black text-white border-3 border-white/20 showcaseback2 rounded-2xl sm:rounded-3xl gap-3 sm:gap-4 md:col-span-3 text-center w-fit overflow-hidden break-words"
          >
            <div className="flex justify-center items-center text-center min-w-0 flex-1">
              <span className="text-xs sm:text-base md:text-sm lg:text-lg font-bold textheading text-[#FBCA1F] px-2">
                "Wear your attitude. The world will follow your silhouette."
              </span>
            </div>
            <button className="button-add rounded-2xl sm:rounded-3xl font-bold text-black navfonts text-sm sm:text-base px-3 sm:px-4 md:px-6 py-2 sm:py-3 mt-2 sm:mt-0 flex-shrink-0">
              Discover
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthPopup;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setError(_arg0: null) {
  throw new Error("Function not implemented.");
}
