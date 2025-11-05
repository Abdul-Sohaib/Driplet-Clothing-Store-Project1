// middleware/cors.js
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  process.env.CLIENT_APP_URL,
  process.env.ADMIN_APP_URL,
  // Fallback for Vercel/Netlify preview URLs
  process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
  process.env.RENDER_EXTERNAL_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV === 'development' && /^https?:\/\/(localhost|127\.0\.1):\d+$/.test(origin)) {
      return callback(null, true);
    }

    console.warn('[CORS] Blocked origin:', origin);
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
  exposedHeaders: ["X-Cache"],
  maxAge: 86400,
  optionsSuccessStatus: 204
};

module.exports = { corsOptions };