/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, type ChangeEvent } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword, // ✅ ADD THIS
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/firebase";
import axiosInstance from "@/lib/axios"; // ✅ ADD THIS

interface FormData {
  name: string;
  email: string;
  password: string;
  code: string;
}

interface AuthPopupProps {
  isOpen: boolean;
  onClose: (user?: { id: string; email: string; name: string }) => void;
}

const AuthPopup: React.FC<AuthPopupProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [step, setStep] = useState(1);

  const now = new Date();
  const month = format(now, "MMM");
  const year = format(now, "yyyy");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    code: "",
  });

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "password" ? value.trim() : value,
    }));
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // ✅ FIXED LOGIN
  const handleLogin = useCallback(async () => {
    if (!formData.email || !formData.password) {
      toast.error("Fill all fields");
      return;
    }
    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = cred.user;
      await user.getIdToken(true);
      
      // ✅ Sync with backend
      const res = await axiosInstance.get("/auth/user");
      
      if (res.data.success && res.data.user) {
        const profile = {
          id: res.data.user.id,
          email: res.data.user.email,
          name: res.data.user.name,
        };
        localStorage.setItem("user", JSON.stringify(profile));
        window.dispatchEvent(new Event("authChange"));
        onClose(profile);
        toast.success("Logged in successfully!");
      }
    } catch (err: any) {
      const msg =
        err.code === "auth/user-not-found"
          ? "No account with this email"
          : err.code === "auth/wrong-password"
          ? "Incorrect password"
          : err.code === "auth/invalid-credential"
          ? "Invalid email or password"
          : err.message;
      toast.error(msg || "Login failed");
    } finally {
      setIsLoading(false);
    }
  }, [formData, onClose]);

  // ✅ FIXED REGISTER (was using signIn before!)
  const handleRegister = useCallback(async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Fill all fields");
      return;
    }
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = cred.user;
      await updateProfile(user, { displayName: formData.name });
      await user.getIdToken(true);
      
      // ✅ Sync with backend
      const res = await axiosInstance.get("/auth/user");
      
      if (res.data.success && res.data.user) {
        const profile = {
          id: res.data.user.id,
          email: res.data.user.email,
          name: res.data.user.name,
        };
        localStorage.setItem("user", JSON.stringify(profile));
        window.dispatchEvent(new Event("authChange"));
        onClose(profile);
        toast.success("Registered successfully!");
      }
    } catch (err: any) {
      const msg =
        err.code === "auth/email-already-in-use"
          ? "Email already registered"
          : err.code === "auth/weak-password"
          ? "Password too weak (min 6 chars)"
          : err.message;
      toast.error(msg || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }, [formData, onClose]);

  // ✅ LOGOUT
  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    try {
      await auth.signOut();
      localStorage.removeItem("user");
      onClose(undefined);
      window.dispatchEvent(new Event("authChange"));
      toast.success("Logged out");
    } catch (err) {
      console.error("Logout error:", err);
      localStorage.removeItem("user");
      onClose(undefined);
      window.dispatchEvent(new Event("authChange"));
      toast.error("Logout failed locally");
    } finally {
      setIsLoading(false);
    }
  }, [onClose]);

  // ✅ PASSWORD RESET
  const handleForgotPassword = useCallback(async () => {
    if (!formData.email) {
      toast.error("Enter your email");
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, formData.email);
      toast.success("Password reset email sent!");
      setStep(2);
    } catch (err: any) {
      const msg =
        err.code === "auth/user-not-found"
          ? "No account with this email"
          : err.message;
      toast.error(msg || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  }, [formData.email]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md bg-opacity-50 flex justify-center items-center w-screen h-screen z-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 bg-transparent rounded-2xl sm:rounded-3xl max-w-[90vw] sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] w-screen shadow-2xl">
        <AnimatePresence>
          <motion.div
            key="form-section"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center p-4 sm:p-6 bg-white/10 backdrop-blur-xl border-3 border-white/20 rounded-2xl sm:rounded-3xl shadow-lg w-full md:col-span-2 min-w-0"
          >
            <button
              onClick={() => onClose(undefined)}
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
                <p className="text-xs text-center text-gray-600">
                  Check your email for the reset link.
                </p>
              )}
              <button
                onClick={
                  forgotMode
                    ? step === 1
                      ? handleForgotPassword
                      : undefined
                    : isLogin
                    ? handleLogin
                    : handleRegister
                }
                disabled={isLoading || (forgotMode && step === 2)}
                className="w-full text-black font-semibold py-2 sm:py-3 rounded-lg button-add text-sm sm:text-base navfonts disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? "Loading..."
                  : forgotMode
                  ? step === 1
                    ? "Send Reset Email"
                    : "Email Sent"
                  : isLogin
                  ? "Login"
                  : "Sign Up"}
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
                  {localStorage.getItem("user") && (
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

        <AnimatePresence>
          <motion.div
            key="calendar-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex flex-1 items-center justify-start sm:p-6 bg-white/10 backdrop-blur-xl border-3 border-white/20 rounded-2xl sm:rounded-3xl shadow-lg min-w-0 min-h-[180px] md:min-h-0 w-full md:w-auto md:col-span-1 relative showcaseback3"
          >
            <button
              onClick={() => onClose(undefined)}
              disabled={isLoading}
              className="absolute top-2 right-2 text-xl font-bold sm:text-xl md:text-2xl text-red-500 hover:text-red-600 cursor-pointer bg-transparent z-20 p-1 sm:p-2 disabled:opacity-50"
              style={{ lineHeight: 1 }}
            >
              <IoIosCloseCircle />
            </button>
            <div className="flex justify-start items-center w-fit h-full bg-white/5 backdrop-blur-xs border-2 border-white/20 rounded-2xl sm:rounded-3xl z-10 min-w-0">
              <div className="flex flex-col w-full h-full justify-between p-2">
                <div className="flex flex-col gap-1 sm:gap-2">
                  <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-black textheading">
                    {month}
                  </h1>
                  <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-medium text-black navfonts">
                    {year}
                  </h2>
                </div>
                <div className="text-xs sm:text-sm md:text-base lg:text-lg text-center font-bold text-[#FBCA1F] textheading">
                  <h1>DRIPLET</h1>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          <motion.div
            key="quote-section"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row flex-wrap items-center justify-center p-4 sm:p-6 bg-black text-white border-3 border-white/20 showcaseback2 rounded-2xl sm:rounded-3xl gap-3 sm:gap-4 md:col-span-3 text-center w-fit overflow-hidden wrap-break-word"
          >
            <div className="flex justify-center items-center text-center min-w-0 flex-1">
              <span className="text-xs sm:text-base md:text-sm lg:text-lg font-bold textheading text-[#FBCA1F] px-2">
                "Wear your attitude. The world will follow your silhouette."
              </span>
            </div>
            <button
              className="button-add rounded-2xl sm:rounded-3xl font-bold text-black navfonts text-sm sm:text-base px-3 sm:px-4 md:px-6 py-2 sm:py-3 mt-2 sm:mt-0 shrink-0"
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