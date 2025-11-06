// src/lib/axios.ts
import axios from "axios";
import { auth } from "@/firebase"; // Firebase auth instance

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Axios instance for all API calls
 * - Auto-attaches Firebase ID token
 * - No cookies
 * - Full error handling
 */
const axiosInstance = axios.create({
  baseURL: API_BASE, // e.g., http://localhost:5000/api
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Request Interceptor
 * Attaches Firebase ID token if user is logged in
 */
axiosInstance.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;

    if (user) {
      try {
        const token = await user.getIdToken(true);
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`Firebase token attached to ${config.method?.toUpperCase()} ${config.url}`);
      } catch (err) {
        console.error("Failed to get Firebase ID token:", err);
      }
    } else {
      console.log(`No Firebase user → no token for ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles 401 → triggers global auth error
 */
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    console.error("API Error:", {
      status,
      url,
      data: error.response?.data,
      message: error.message,
    });

    // Trigger global auth error event
    if (status === 401) {
      console.warn("Unauthorized → dispatching auth-error");
      window.dispatchEvent(
        new CustomEvent("auth-error", {
          detail: {
            message: error.response?.data?.message || "Session expired",
            status,
          },
        })
      );
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;