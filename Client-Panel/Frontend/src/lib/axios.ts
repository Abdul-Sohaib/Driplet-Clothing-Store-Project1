import axios from 'axios';

// Create axios instance with default configuration
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Always include credentials for authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add any additional headers if needed
instance.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors like 401, 403, etc.
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access, redirecting to login');
    }
    return Promise.reject(error);
  }
);

export default instance;
