// middleware/cors.js
const cors = require("cors");

// HARDCODED production URLs to ensure they're always allowed
const allowedOrigins = [
  // Development
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  
  // Production (HARDCODED - always allowed)
  "https://driplet.netlify.app",
  "https://driplet-admin-panel.netlify.app",
  
  // Environment variables (optional fallback)
  process.env.CLIENT_APP_URL,
  process.env.ADMIN_APP_URL,
  process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
  process.env.RENDER_EXTERNAL_URL,
].filter(Boolean);

console.log('[CORS] Allowed origins:', allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      console.log('[CORS] ✓ No origin (direct request)');
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log('[CORS] ✓ Allowed origin:', origin);
      return callback(null, true);
    }

    // Development: Allow any localhost/127.0.0.1 with any port
    if (process.env.NODE_ENV === 'development') {
      if (/^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
        console.log('[CORS] ✓ Development origin:', origin);
        return callback(null, true);
      }
    }

    // Allow Netlify preview URLs
    if (origin.includes('.netlify.app')) {
      console.log('[CORS] ✓ Netlify preview URL:', origin);
      return callback(null, true);
    }

    // Block all other origins
    console.error('[CORS] ✗ BLOCKED origin:', origin);
    callback(new Error(`CORS policy: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "x-razorpay-signature",
    "Cache-Control",
  ],
  exposedHeaders: ["X-Cache", "Set-Cookie"],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 204,
  preflightContinue: false,
};

module.exports = { corsOptions };