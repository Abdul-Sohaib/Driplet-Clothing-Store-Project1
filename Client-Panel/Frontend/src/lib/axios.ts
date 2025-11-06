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
        // FORCE REFRESH EVERY TIME
        const token = await user.getIdToken(true);
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Token attached (FORCED REFRESH)");
      } catch (err) {
        console.error("Token refresh failed:", err);
        window.dispatchEvent(new CustomEvent("auth-error"));
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ADD THIS: RETRY ON 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (auth.currentUser) {
        try {
          await auth.currentUser.getIdToken(true);  // Force refresh
          console.log("Token refreshed on 401 → retrying");
          return axiosInstance(originalRequest);  // Retry
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          console.error("Final token refresh failed");
        }
      }

      window.dispatchEvent(new CustomEvent("auth-error"));
    }

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