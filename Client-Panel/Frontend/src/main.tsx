import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // ✅ Import Router
import axios from 'axios';
import './index.css';
import App from './App.tsx';

// Configure axios interceptor to automatically add the Authorization header if a token exists
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> {/* ✅ Wrap App with Router */}
      <App />
    </BrowserRouter>
  </StrictMode>
);
