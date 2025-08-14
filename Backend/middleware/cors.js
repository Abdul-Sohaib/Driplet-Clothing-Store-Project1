const cors = require('cors');

/**
 * Centralized CORS Configuration
 * 
 * This middleware handles CORS for both development and production environments.
 * 
 * DEVELOPMENT MODE:
 * - Allows localhost and common dev ports
 * - Allows dev tunnel origins (ngrok, devtunnels.ms, etc.)
 * 
 * PRODUCTION MODE:
 * - Allows specified production domains
 * - More flexible origin validation for better cross-device compatibility
 * 
 * TO UPDATE FOR PRODUCTION:
 * 1. Set NODE_ENV=production in your environment
 * 2. Ensure frontend domains match productionConfig.CLIENT_APP_URL or CUSTOM_DOMAIN
 * 3. Use HTTPS for all requests
 */

const productionConfig = require('../config/production');

const allowedProductionDomains = [
  productionConfig.CLIENT_APP_URL,              // Your Netlify client app URL
  productionConfig.ADMIN_APP_URL,               // Your Netlify admin app URL
  productionConfig.CUSTOM_DOMAIN                // Your custom domain if any
].filter(Boolean); // Remove empty/undefined values

const corsOptions = {
  origin: function (origin, callback) {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    console.log(`🌐 CORS Check - Origin: ${origin || 'None'}, Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Allow requests with no origin (e.g., mobile apps, curl, same-origin requests)
    if (!origin) {
      console.log(`✅ Allowing request with no origin`);
      return callback(null, true);
    }
    
    if (isDevelopment) {
      // Allow localhost and common dev ports
      if (origin.match(/^https?:\/\/localhost:[0-9]{4,5}$/) || 
          origin.match(/^https?:\/\/127\.0\.0\.1:[0-9]{4,5}$/) ||
          origin.match(/^https?:\/\/192\.168\.[0-9]{1,3}\.[0-9]{1,3}:[0-9]{4,5}$/) || // Local network IPs
          origin.includes('devtunnels.ms') || 
          origin.includes('ngrok.io') || 
          origin.includes('ngrok-free.app') ||
          origin.includes('tunnel.local') ||
          origin.includes('loca.lt') ||
          origin.includes('serveo.net')) {
        console.log(`🔓 Development mode: Allowing origin: ${origin}`);
        return callback(null, true);
      }
    }
    
    // Production mode: Check against allowed domains
    if (allowedProductionDomains.includes(origin)) {
      console.log(`✅ Production mode: Allowing origin: ${origin}`);
      return callback(null, true);
    }
    
    // Additional check for Netlify deploy previews and branch deploys
    if (origin.includes('netlify.app') || origin.includes('netlify.com')) {
      console.log(`✅ Netlify domain detected: Allowing origin: ${origin}`);
      return callback(null, true);
    }
    
    // Check if origin matches the base domain (for different subdomains)
    const isSubdomain = allowedProductionDomains.some(domain => {
      try {
        const allowedHost = new URL(domain).hostname;
        const originHost = new URL(origin).hostname;
        // Allow if origin is subdomain or exact match
        return originHost === allowedHost || originHost.endsWith('.' + allowedHost);
      } catch {
        return false;
      }
    });
    
    if (isSubdomain) {
      console.log(`✅ Subdomain match: Allowing origin: ${origin}`);
      return callback(null, true);
    }
    
    console.log(`🚫 Blocking origin: ${origin}`);
    console.log(`   Allowed domains: ${allowedProductionDomains.join(', ')}`);
    callback(new Error(`CORS Error: Origin ${origin} not allowed`));
  },
  credentials: true, // This is crucial for cookie-based authentication
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin', 
    'Cookie',
    'x-razorpay-signature',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['X-Cache', 'Set-Cookie', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};

const preflightCorsOptions = {
  ...corsOptions,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  optionsSuccessStatus: 200
};

module.exports = {
  corsOptions,
  preflightCorsOptions,
  allowedProductionDomains
};