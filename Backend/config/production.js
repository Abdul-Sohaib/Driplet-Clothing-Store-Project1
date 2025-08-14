// config/production.js
module.exports = {
  // Your frontend URLs
  CLIENT_APP_URL: process.env.CLIENT_APP_URL || 'https://driplet.netlify.app',
  ADMIN_APP_URL: process.env.ADMIN_APP_URL || 'https://driplet-admin-panel.netlify.app',
  CUSTOM_DOMAIN: process.env.CUSTOM_DOMAIN || '', // Optional custom domain
  COOKIE_DOMAIN: '.netlify.app',
  
  // CLIENT_APP_URL: process.env.CLIENT_APP_URL || 'http://localhost:5173/',
  // ADMIN_APP_URL: process.env.ADMIN_APP_URL || 'http://localhost:5174/',
  // CUSTOM_DOMAIN: process.env.CUSTOM_DOMAIN || '', // Optional custom domain
  
  // Cookie domain - leave empty for automatic detection or set specific domain
  // For cross-subdomain cookies, use '.yourdomain.com' (with leading dot)
  // For single domain, leave empty or set to specific domain
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || '', 
  
  // Database and other production settings
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  
  // Email configuration
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  
  // Other production settings
  PORT: process.env.PORT || 5000,
  NODE_ENV: 'production'
};




// /**
//  * Production Configuration
//  * 
//  * This file contains all production-specific configuration settings.
//  * Update these values when deploying to production.
//  * 
//  * IMPORTANT: After updating this file, restart your server for changes to take effect.
//  */

// module.exports = {
//   // ============================================================================
//   // NETLIFY FRONTEND DOMAINS - UPDATE THESE WITH YOUR ACTUAL DOMAINS
//   // ============================================================================
  
//   // Your Netlify client app URL (replace with actual URL)
//   CLIENT_APP_URL: 'https://driplet.netlify.app',
  
//   // Your Netlify admin app URL (replace with actual URL)
//   ADMIN_APP_URL: 'https://driplet-admin-pannel.netlify.app',
  
//   // Custom domain if you have one (optional)
//   CUSTOM_DOMAIN: 'https://your-custom-domain.com',
  
//   // ============================================================================
//   // COOKIE SETTINGS
//   // ============================================================================
  
//   // Cookie domain (leave empty for automatic detection)
//   COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || '',
  
//   // Cookie path
//   COOKIE_PATH: '/',
  
//   // ============================================================================
//   // SECURITY SETTINGS
//   // ============================================================================
  
//   // Rate limiting (increased to 1000 requests per 15 minutes per IP to reduce rate limit errors)
//   RATE_LIMIT_MAX: 1000,
  
//   // JWT token expiration (in days)
//   JWT_EXPIRY_DAYS: 7,
  
//   // ============================================================================
//   // CORS SETTINGS
//   // ============================================================================
  
//   // Whether to allow credentials in CORS
//   CORS_ALLOW_CREDENTIALS: true,
  
//   // Allowed HTTP methods
//   CORS_ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  
//   // Allowed headers (added 'x-razorpay-signature' for Razorpay webhook compatibility)
//   CORS_ALLOWED_HEADERS: [
//     'Content-Type',
//     'Authorization', 
//     'X-Requested-With',
//     'Accept',
//     'Origin',
//     'Cookie',
//     'x-razorpay-signature'
//   ],
  
//   // Exposed headers (added 'X-RateLimit-Limit' and 'X-RateLimit-Remaining' for debugging rate limits)
//   CORS_EXPOSED_HEADERS: ['X-Cache', 'Set-Cookie', 'X-RateLimit-Limit', 'X-RateLimit-Remaining']
// };