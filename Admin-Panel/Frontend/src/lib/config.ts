// Configuration file for API endpoints and other settings
export const config = {
  // API Base URL - defaults to localhost:5000 if not set in environment
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  
  // Development mode
  IS_DEV: import.meta.env.DEV || true,
  
  // API endpoints
  ENDPOINTS: {
    CATEGORIES: '/api/categories',
    PRODUCTS: '/api/products',
    ORDERS: '/api/orders',
    ANALYTICS: '/api/analytics',
    SALES: '/api/sales',
    SUPPORT_TICKETS: '/api/support-tickets',
    SEARCH: '/api/search',
    TRANSACTIONS: '/api/transactions',
    MAILS: '/api/mails',
    SITE_SETTINGS: '/api/site-settings',
    AUTH: '/api/auth',
    HEALTH: '/api/health',
    CORS_TEST: '/api/cors-test'
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${config.API_BASE_URL}${endpoint}`;
};

// Helper function to check if running on dev tunnel
export const isDevTunnel = (): boolean => {
  return window.location.hostname.includes('devtunnels.ms') || 
         window.location.hostname.includes('ngrok.io') ||
         window.location.hostname.includes('tunnel.local');
};
