// AuthPopup.tsx - Fixed version
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { format } from 'date-fns';
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface User {
  id?: string;
  name: string;
  email: string;
  gender?: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  code: string;
}

interface AuthPopupProps {
  onClose: (user: User | null) => void;
  isAuthenticated?: boolean;
}

const AuthPopup = ({ onClose, isAuthenticated = false }: AuthPopupProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [forgotMode, setForgotMode] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const now = new Date();
  const month = format(now, 'MMM');
  const year = format(now, 'yyyy');
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    code: ""
  });

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
    console.error("API Error:", {
      message,
      status: err.response?.status,
      data: err.response?.data
    });
    toast.error(message || "Operation failed");
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/user`, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("User fetch success:", res.data);
      
      if (!res.data.user || !res.data.user.id) {
        throw new Error("Invalid user data received");
      }
      
      return res.data.user;
    } catch (err: any) {
      console.error("User fetch error:", {
        message: err.response?.data?.message || err.message,
        status: err.response?.status
      });
      throw err;
    }
  }, []);

  const handleLogin = useCallback(async () => {
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Login attempt for:", formData.email);
      
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: formData.email.toLowerCase().trim(),
        password: formData.password.trim()
      }, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Login response:", {
        status: response.status,
        data: response.data,
        cookies: document.cookie
      });

      if (!response.data.user || !response.data.user.id) {
        throw new Error("Invalid user data received from login");
      }

      // Store user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Close popup and notify parent
      onClose(response.data.user);
      
      // Dispatch auth change event
      window.dispatchEvent(new Event("authChange"));
      
      toast.success("Login successful!");
      
    } catch (err: any) {
      console.error("Login error:", {
        message: err.response?.data?.message || err.message,
        status: err.response?.status,
        cookies: document.cookie
      });
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [formData, onClose, handleApiError]);

  const handleRegister = useCallback(async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (formData.password.trim().length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Register attempt for:", formData.email);
      
      await axios.post(`${API_BASE}/auth/register`, {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password.trim()
      }, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Fetch user after registration
      const user = await fetchUser();
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(user));
      
      // Close popup and notify parent
      onClose(user);
      
      // Dispatch auth change event
      window.dispatchEvent(new Event("authChange"));
      
      toast.success("Registration successful!");
      
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [formData, onClose, handleApiError, fetchUser]);

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/logout`, {}, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Clear local storage
      localStorage.removeItem('user');
      
      // Close popup and clear user
      onClose(null);
      
      // Dispatch auth change event
      window.dispatchEvent(new Event("authChange"));
      
      toast.success("Logout successful!");
      
    } catch (err: any) {
      console.error("Logout error:", err);
      // Even if logout fails on server, clear local state
      localStorage.removeItem('user');
      onClose(null);
      window.dispatchEvent(new Event("authChange"));
      toast.error("Logout failed, but you have been logged out locally");
    } finally {
      setIsLoading(false);
    }
  }, [onClose]);

  const handleForgotPassword = useCallback(async () => {
    if (!formData.email) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/forgot-password`, { 
        email: formData.email.toLowerCase().trim() 
      }, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      toast.success(res.data.message || "Reset code sent to your email");
      setStep(2);
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [formData.email, handleApiError]);

  const handleVerifyCode = useCallback(async () => {
    if (!formData.code || !formData.password) {
      toast.error("Please enter reset code and new password");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/verify-code`, {
        email: formData.email.toLowerCase().trim(),
        code: formData.code,
        newPassword: formData.password.trim()
      }, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      toast.success(res.data.message || "Password reset successful");
      setIsLogin(true);
      setForgotMode(false);
      setStep(1);
      setFormData({ name: "", email: "", password: "", code: "" });
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [formData, handleApiError]);

  // Rest of your JSX remains the same, just make sure to add disabled={isLoading} to buttons
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md bg-opacity-50 flex justify-center items-center w-screen h-screen z-50">
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
              onClick={() => onClose(null)}
              className="md:hidden absolute top-2 right-2 text-xl font-bold text-red-500 hover:text-red-600 cursor-pointer bg-transparent z-20 p-1 sm:p-2"
              style={{ lineHeight: 1 }}
              disabled={isLoading}
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
                  disabled={isLoading}
                  className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FBCA1F] text-black text-sm sm:text-base navfonts disabled:opacity-50"
                />
              )}
              {step === 1 && (
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FBCA1F] text-black text-sm sm:text-base navfonts disabled:opacity-50"
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
                    disabled={isLoading}
                    className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FBCA1F] text-black text-sm sm:text-base navfonts disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              )}
              {forgotMode && step === 2 && (
                <>
                  <input
                    type="text"
                    name="code"
                    placeholder="Reset Code"
                    value={formData.code}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FBCA1F] text-black text-sm sm:text-base navfonts disabled:opacity-50"
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="New Password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full p-2 sm:p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FBCA1F] text-black text-sm sm:text-base navfonts disabled:opacity-50"
                  />
                </>
              )}
              <button
                onClick={forgotMode ? (step === 1 ? handleForgotPassword : handleVerifyCode) : (isLogin ? handleLogin : handleRegister)}
                disabled={isLoading}
                className="w-full text-black font-semibold py-2 sm:py-3 rounded-lg button-add text-sm sm:text-base navfonts disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Loading..." : 
                  (forgotMode ? (step === 1 ? "Send Reset Code" : "Verify Code") : 
                    (isLogin ? "Login" : "Sign Up")
                  )
                }
              </button>
            </div>

            <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-black navfonts">
              {forgotMode ? (
                <span
                  className="text-[#FBCA1F] cursor-pointer hover:underline"
                  onClick={() => {
                    setForgotMode(false);
                    setStep(1);
                    setFormData({ name: "", email: "", password: "", code: "" });
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
                      setFormData({ name: "", email: "", password: "", code: "" });
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
                    setFormData({ name: "", email: "", password: "", code: "" });
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
              onClick={() => onClose(null)}
              disabled={isLoading}
              className="absolute top-2 right-2 text-xl font-bold sm:text-xl md:text-2xl text-red-500 hover:text-red-600 cursor-pointer bg-transparent z-20 p-1 sm:p-2 disabled:opacity-50"
              style={{ lineHeight: 1 }}
            >
              <IoIosCloseCircle />
            </button>
            <div className="flex justify-start items-center w-fit h-full bg-white/5 backdrop-blur-xs border-2 border-white/20 rounded-2xl sm:rounded-3xl z-10 min-w-0">
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
            <button 
              className="button-add rounded-2xl sm:rounded-3xl font-bold text-black navfonts text-sm sm:text-base px-3 sm:px-4 md:px-6 py-2 sm:py-3 mt-2 sm:mt-0 flex-shrink-0"
              disabled={isLoading}
            >
              Discover
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthPopup;