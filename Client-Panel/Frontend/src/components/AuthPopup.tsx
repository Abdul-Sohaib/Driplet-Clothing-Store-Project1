/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { format } from 'date-fns';

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
  onClose: (user: User) => void;
}

const AuthPopup = ({ onClose }: AuthPopupProps) => {
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
    console.error(`${forgotMode ? 'Reset' : isLogin ? 'Login' : 'Register'} error:`, message);
    alert(message || "Operation failed");
  }, [forgotMode, isLogin]);

  const handleRegister = useCallback(async () => {
    if (formData.password.trim().length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    try {
      console.log("Register attempt:", { name: formData.name, email: formData.email.toLowerCase(), password: "[REDACTED]" });
      const res = await axios.post(`${API_BASE}/auth/register`, {
        name: formData.name,
        email: formData.email.toLowerCase(),
        password: formData.password.trim()
      }, { withCredentials: true });
      onClose(res.data.user);
    } catch (err: any) {
      handleApiError(err);
    }
  }, [formData, onClose, handleApiError]);

  const handleLogin = useCallback(async () => {
    try {
      console.log("Login attempt:", { email: formData.email.toLowerCase(), password: "[REDACTED]" });
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: formData.email.toLowerCase(),
        password: formData.password.trim()
      }, { withCredentials: true });
      onClose(res.data.user);
    } catch (err: any) {
      handleApiError(err);
    }
  }, [formData, onClose, handleApiError]);

  const handleForgotPassword = useCallback(async () => {
    try {
      const res = await axios.post(`${API_BASE}/auth/forgot-password`, { 
        email: formData.email.toLowerCase() 
      }, { withCredentials: true });
      alert(res.data.message);
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
        newPassword: formData.password.trim(),
      }, { withCredentials: true });
      alert(res.data.message);
      setForgotMode(false);
      setIsLogin(true);
      setStep(1);
    } catch (err: any) {
      handleApiError(err);
    }
  }, [formData, handleApiError]);

  const inputClass = "w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-2xl sm:rounded-3xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 text-black placeholder-black navfonts text-sm sm:text-base";
  const buttonClass = "button-add rounded-2xl sm:rounded-3xl font-bold uppercase w-full text-sm sm:text-base py-2 sm:py-3";

  return (
    <div className="fixed  inset-0 bg-black/80 backdrop-blur-sm flex justify-center h-screen w-screen items-center z-50 p-3 sm:p-4">
      <div className="grid grid-cols-1 md:grid-col-2 max-w-4xl relative rounded-xl overflow-hidden gap-3 sm:gap-4 ">
        {/* First grid: Login/Register details */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
            className="p-4 sm:p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl shadow-lg col-span-1  flex flex-col gap-4 sm:gap-6"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold textheading text-center text-[#FBCA1F] uppercase mb-2 sm:mb-4">
              {forgotMode ? "Reset Password" : isLogin ? "Log in" : "Sign up"}
            </h2>

            {!forgotMode && !isLogin && (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className={inputClass}
              />
            )}

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="@E-mail address"
              required
              className={inputClass}
            />

            {forgotMode && step === 2 ? (
              <>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="Enter verification code"
                  required
                  className={inputClass}
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="New Password"
                    required
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-gray-800 cursor-pointer"
                  >
                    {showPassword ? <FaEyeSlash size={16} className="sm:w-5 sm:h-5" /> : <FaEye size={16} className="sm:w-5 sm:h-5" />}
                  </button>
                </div>
                <button
                  onClick={handleVerifyCode}
                  className={buttonClass}
                >
                  Verify & Reset
                </button>
              </>
            ) : (
              <>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="password"
                    required
                    autoComplete="new-password"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-gray-800 cursor-pointer"
                  >
                    {showPassword ? <FaEyeSlash size={16} className="sm:w-5 sm:h-5" /> : <FaEye size={16} className="sm:w-5 sm:h-5" />}
                  </button>
                </div>
                {!forgotMode && (
                  <button
                    onClick={isLogin ? handleLogin : handleRegister}
                    className={buttonClass}
                  >
                    {isLogin ? "Log in" : "Sign up"}
                  </button>
                )}
              </>
            )}

            {isLogin && !forgotMode && (
              <p
                onClick={() => setForgotMode(true)}
                className="text-xs sm:text-sm text-center font-semibold text-white mt-2 cursor-pointer hover:underline"
              >
                Forgot Password
              </p>
            )}

            {isLogin && forgotMode && step === 1 && (
              <button
                onClick={handleForgotPassword}
                className={buttonClass}
              >
                Send Code
              </button>
            )}

            <p className="text-xs sm:text-sm text-center text-white mt-2 sm:mt-4 font-semibold">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <span
                className="text-[#FBCA1F] cursor-pointer hover:underline"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setForgotMode(false);
                  setStep(1);
                }}
              >
                {isLogin ? "Sign up" : "Log in"}
              </span>
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Second grid: Minimal text and pink circle */}
        <AnimatePresence>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-4 sm:p-6 bg-white/10 backdrop-blur-xl border-3 border-white/20 rounded-2xl w-xs sm:rounded-3xl shadow-lg col-span-1  flex items-center justify-center relative showcaseback3"
          >
            <div className="absolute left-1 flex justify-center h-full  w-1/2 bg-white/5 backdrop-blur-xs border-2 border-white/20 rounded-2xl sm:rounded-3xl z-10" >
             <div className="flex flex-col w-full h-full justify-between p-4 sm:p-7">
              <div className="flex flex-col gap-1 sm:gap-2 ">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-black textheading">{month}</h1>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-medium text-black navfonts">{year}</h2>
            </div>

            <div className="text-lg sm:text-xl text-center font-bold text-[#FBCA1F] textheading">
            <h1>DRIPLET</h1>
          </div>
          </div>
            </div>

          </motion.div>
        </AnimatePresence>

        {/* Third grid: References */}
        <AnimatePresence>
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="p-4 sm:p-6 bg-black text-white col-span-1 lg:col-span-2 row-span-1 border-3 border-white/20 flex flex-col sm:flex-row items-center justify-between showcaseback2 rounded-2xl sm:rounded-3xl gap-3 sm:gap-0"
          >
            <div className="flex justify-center items-center text-center sm:text-left">
              <span className="text-base sm:text-lg lg:text-xl font-bold textheading text-[#FBCA1F]">"Wear your attitude. The world will follow your silhouette."</span>
            </div>
            <button className="button-add rounded-2xl sm:rounded-3xl font-bold text-black navfonts text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">Discover</button>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => onClose({ name: "", email: "" })}
          className="absolute top-1 right-2 text-2xl sm:text-3xl text-red-500 hover:text-red-600 cursor-pointer bg-transparent z-10"
        >
          <IoClose />
        </button>
      </div>
    </div>
  );
};

export default AuthPopup;