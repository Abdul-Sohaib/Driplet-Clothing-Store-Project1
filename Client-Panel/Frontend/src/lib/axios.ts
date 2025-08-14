// frontend/src/lib/axios.ts
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE, // Should be http://localhost:5000/api
  withCredentials: true, // Crucial for sending cookies
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url, { cookies: document.cookie });
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

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
    if (error.response?.status === 401) {
      console.log('Authentication error detected');
      window.dispatchEvent(new CustomEvent('auth-error', { detail: error.response.data }));
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;