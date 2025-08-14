// lib/axios.js or wherever you configure axios
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with proper configuration
const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // This is crucial for cookie-based auth
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add this to handle CORS preflight requests
axiosInstance.defaults.headers.common['Access-Control-Allow-Credentials'] = 'true';

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('Response interceptor error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    // Handle auth errors globally
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log('Authentication error detected');
      // You might want to redirect to login or show auth popup
      window.dispatchEvent(new CustomEvent('auth-error', { 
        detail: error.response.data 
      }));
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;