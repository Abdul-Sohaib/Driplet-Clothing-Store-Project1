const cors = require('cors');

/**
 * Centralized CORS Configuration
 * 
 * This middleware handles CORS for both development and production environments.
 * 
 * DEVELOPMENT MODE:
 * - Allows localhost:5173 (Client Panel)
 * - Allows localhost:3000 (Admin Panel - if applicable)
 * - Allows dev tunnel origins (ngrok, devtunnels.ms, etc.)
 * 
 * PRODUCTION MODE:
 * - Only allows specified Netlify domains
 * - Strict origin validation for security
 * 
 * TO UPDATE FOR PRODUCTION:
 * 1. Set NODE_ENV=production in your environment
 * 2. Replace the placeholder URLs in allowedProductionDomains with your actual Netlify URLs
 * 3. Ensure your frontend is deployed to the specified domains
 */

// Import production configuration
const productionConfig = require('../config/production');

// ============================================================================
// PRODUCTION CONFIGURATION - UPDATE THESE WITH YOUR ACTUAL NETLIFY DOMAINS
// ============================================================================
const allowedProductionDomains = [
  productionConfig.CLIENT_APP_URL,              // Your Netlify client app URL
  productionConfig.ADMIN_APP_URL,               // Your Netlify admin app URL
  productionConfig.CUSTOM_DOMAIN                // Your custom domain if any
].filter(Boolean); // Remove empty/undefined values

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

const corsOptions = {
  origin: function (origin, callback) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    console.log(`🌐 CORS Check - Origin: ${origin}`);
    console.log(`🌐 CORS Check - Environment: ${process.env.NODE_ENV}`);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log(`✅ Allowing request with no origin`);
      return callback(null, true);
    }
    
    // DEVELOPMENT MODE - Allow localhost and dev tunnels
    if (isDevelopment) {
      // Allow localhost origins
      if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
        console.log(`🔓 Development mode: Allowing localhost origin: ${origin}`);
        return callback(null, origin);
      }
      
      // Allow dev tunnel origins
      if (origin.includes('devtunnels.ms') || 
          origin.includes('ngrok.io') || 
          origin.includes('tunnel.local') ||
          origin.includes('loca.lt') ||
          origin.includes('serveo.net') ||
          origin.includes('ngrok-free.app')) {
        console.log(`🔓 Development mode: Allowing dev tunnel origin: ${origin}`);
        return callback(null, origin);
      }
      
      // In development, allow all origins for flexibility
      console.log(`🔓 Development mode: Allowing origin: ${origin}`);
      return callback(null, origin);
    }
    
    // PRODUCTION MODE - Only allow specified domains
    if (allowedProductionDomains.includes(origin)) {
      console.log(`✅ Production mode: Allowing origin: ${origin}`);
      return callback(null, origin);
    }
    
    // Block unauthorized origins in production
    console.log(`🚫 Production mode: Blocking unauthorized origin: ${origin}`);
    console.log(`🚫 Allowed origins: ${allowedProductionDomains.join(', ')}`);
    callback(new Error('Not allowed by CORS - Origin not in allowed list'));
  },
  credentials: true, // Required for cookies and authentication
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin', 
    'Cookie'
  ],
  exposedHeaders: ['X-Cache', 'Set-Cookie'],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  preflightContinue: false
};

// Preflight CORS configuration (for OPTIONS requests)
const preflightCorsOptions = {
  ...corsOptions,
  origin: function (origin, callback) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    console.log(`🔄 CORS Preflight - Origin: ${origin}`);
    console.log(`🔄 CORS Preflight - Environment: ${process.env.NODE_ENV}`);
    
    // Allow requests with no origin
    if (!origin) {
      return callback(null, true);
    }
    
    // DEVELOPMENT MODE
    if (isDevelopment) {
      // Allow localhost origins
      if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
        return callback(null, origin);
      }
      
      // Allow dev tunnel origins
      if (origin.includes('devtunnels.ms') || 
          origin.includes('ngrok.io') || 
          origin.includes('ngrok-free.app')) {
        return callback(null, origin);
      }
      
      // In development, allow all origins
      return callback(null, origin);
    }
    
    // PRODUCTION MODE - Only allow specified domains
    if (allowedProductionDomains.includes(origin)) {
      return callback(null, origin);
    }
    
    // Block unauthorized origins in production
    callback(new Error('Not allowed by CORS preflight - Origin not in allowed list'));
  }
};

module.exports = {
  corsOptions,
  preflightCorsOptions,
  allowedProductionDomains
};
