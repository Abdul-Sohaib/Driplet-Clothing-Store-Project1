const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const cache = require("memory-cache");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Import centralized middleware
const { corsOptions, preflightCorsOptions } = require('./middleware/cors');

dotenv.config();

const connectDB = require("./config/db");

// Admin Routes
const productRoutes = require("./routes/Admin/products");
const categoryRoutes = require("./routes/Admin/categories");
const orderRoutes = require("./routes/Admin/order");
const supportTicketRoutes = require("./routes/Admin/support-tickets");
const searchRoutes = require("./routes/Admin/search");
const analyticsRoutes = require("./routes/Admin/analytics");
const transactionRoutes = require("./routes/Admin/transactions");
const mailRoutes = require("./routes/Admin/mails");
const siteSettingsRoutes = require("./routes/Admin/siteSettings");
const salesRoutes = require("./routes/Admin/sales");

// Client Routes
const authRoutes = require("./routes/clientauth");
const cartRoutes = require("./routes/cart");
const wishlistRoutes = require("./routes/wishlist");
const reviewRoutes = require("./routes/reviews");
const clientorderRoutes = require("./routes/clientorders");

const app = express();

// 🔗 Connect MongoDB
connectDB()
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// 🔍 Check images folder at startup
const imagesPath = path.join(__dirname, "images");
if (!fs.existsSync(imagesPath)) {
  console.warn("⚠️ Images folder not found at:", imagesPath);
} else {
  const logoPath = path.join(imagesPath, "DRIPLET.svg");
  if (!fs.existsSync(logoPath)) {
    console.warn("⚠️ DRIPLET.svg not found in images folder:", logoPath);
  } else {
    console.log("✅ Images folder and DRIPLET.svg verified");
  }
}

// 🔐 Middleware
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
  console.log(`🔧 Setting NODE_ENV to 'development'`);
}
console.log(`🔧 Environment: NODE_ENV = ${process.env.NODE_ENV}`);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://*.razorpay.com"], // Allow Razorpay scripts
      frameSrc: ["'self'", "https://*.razorpay.com"] // Allow Razorpay iframes
    }
  }
}));

app.use(cors(corsOptions));
app.options('*', cors(preflightCorsOptions));
app.use(cookieParser());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // Increased to 1000 to reduce rate limit errors
  })
);

// 🧾 Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}, Origin: ${req.headers.origin}, Cookies:`, req.cookies || "None");
  
  if (req.method === 'OPTIONS') {
    console.log(`🔄 CORS Preflight Request - Origin: ${req.headers.origin}`);
    console.log(`🔄 CORS Headers:`, {
      'access-control-request-method': req.headers['access-control-request-method'],
      'access-control-request-headers': req.headers['access-control-request-headers'],
      'origin': req.headers.origin
    });
  }
  
  // Log Razorpay webhook requests for debugging
  if (req.url.includes('/api/transactions') && req.headers['x-razorpay-signature']) {
    console.log(`💳 Razorpay Webhook - Signature: ${req.headers['x-razorpay-signature']}, Payload:`, req.body);
  }
  
  next();
});

// 🗄️ Cache Middleware for GET routes only (excluding cart/wishlist)
const cacheMiddleware = (duration) => (req, res, next) => {
  if (req.method !== "GET" || req.url.includes('/api/cart') || req.url.includes('/api/wishlist')) {
    console.log(`🗄️ Bypassing cache for ${req.method} ${req.url}`);
    return next();
  }
  const key = `__express__${req.originalUrl || req.url}`;
  const cachedBody = cache.get(key);
  if (cachedBody) {
    console.log(`🗄️ Cache hit for ${key}`);
    res.setHeader("X-Cache", "HIT");
    return res.json(cachedBody);
  }
  console.log(`🗄️ Cache miss for ${key}`);
  res.setHeader("X-Cache", "MISS");
  const originalJson = res.json;
  res.json = function (body) {
    cache.put(key, body, duration * 1000);
    return originalJson.call(this, body);
  };
  next();
};

// 📦 Routes
app.use("/api/client/orders", clientorderRoutes);
app.use("/api/products", cacheMiddleware(300), productRoutes);
app.use("/api/categories", cacheMiddleware(300), categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", cacheMiddleware(300), reviewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/support-tickets", supportTicketRoutes);
app.use("/api/search", cacheMiddleware(300), searchRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/mails", mailRoutes);
app.use("/api/site-settings", siteSettingsRoutes);
app.use("/api/sales", cacheMiddleware(300), salesRoutes);
app.use("/api/auth", authRoutes);

// 🧪 CORS Test Endpoint
app.get('/api/cors-test', (req, res) => {
  console.log(`🧪 CORS Test Request - Origin: ${req.headers.origin}`);
  console.log(`🧪 CORS Test - All Headers:`, req.headers);
  
  res.json({
    message: 'CORS is working!',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    method: req.method,
    headers: req.headers,
    corsInfo: {
      allowCredentials: true,
      allowOrigin: req.headers.origin,
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
    }
  });
});

// 🏥 Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    cors: {
      origin: req.headers.origin,
      method: req.method
    }
  });
});

//  Custom middleware for images with caching
app.use('/images', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache images for 1 year
  const filePath = path.join(__dirname, 'images', req.path);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.warn(` Image not found: ${req.path}, serving default`);
      return res.sendFile(path.join(__dirname, 'images', 'driplet-logo.png'));
    }
    next();
  });
}, express.static(path.join(__dirname, 'images')));

// ❌ Global Error Handler
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    console.error("🚫 CORS Error:", {
      message: err.message,
      origin: req.headers.origin,
      method: req.method,
      url: req.url,
    });
    return res.status(403).json({ 
      message: "CORS Error: Origin not allowed", 
      error: err.message,
      origin: req.headers.origin,
      allowedOrigins: "Check server logs for allowed origins"
    });
  }

  console.error(" Global Error:", {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
  });
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

//  Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});