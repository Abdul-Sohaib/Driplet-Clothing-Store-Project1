// server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

// Import CORS config
const { corsOptions } = require("./middleware/cors");

dotenv.config();

const connectDB = require("./config/db");

// === SINGLE DB CONNECTION + INDEX SETUP ===
let dbConnected = false;

const initializeDB = async () => {
  if (dbConnected) return;

  try {
    await connectDB();
    console.log("MongoDB connected");

    const User = require("./models/Client/clientuser");

    // === SAFE INDEX CREATION ===
    const collection = User.collection;

    // 1. Email index (unique)
    try {
      await collection.createIndex({ email: 1 }, { unique: true, background: true });
      console.log("Index: email_1 (unique) ensured");
    } catch (err) {
      if (!err.message.includes("duplicate")) throw err;
      console.log("Index: email_1 already exists");
    }

    // 2. reviews.productId index (sparse/partial)
    try {
      await collection.createIndex(
        { "reviews.productId": 1 },
        {
          background: true,
          partialFilterExpression: { "reviews.productId": { $exists: true } },
          name: "reviews_productId_partial"
        }
      );
      console.log("Index: reviews_productId_partial ensured");
    } catch (err) {
      if (!err.message.includes("duplicate")) throw err;
      console.log("Index: reviews_productId_partial already exists");
    }

    dbConnected = true;
  } catch (err) {
    console.error("MongoDB initialization failed:", err.message);
    process.exit(1);
  }
};

// === ROUTES ===
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

const cartRoutes = require("./routes/cart");
const wishlistRoutes = require("./routes/wishlist");
const reviewRoutes = require("./routes/reviews");
const clientorderRoutes = require("./routes/clientorders");
const clientAuthRoutes = require("./routes/clientauth");

const app = express();

// === INITIALIZE DB ONCE ===
initializeDB();

// === MIDDLEWARE ===
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}
console.log(`Environment: NODE_ENV = ${process.env.NODE_ENV}`);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://*.razorpay.com"],
        frameSrc: ["'self'", "https://*.razorpay.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        connectSrc: ["'self'", "https://*.razorpay.com", "http://localhost:*", "ws://localhost:*"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(cookieParser());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
  skip: (req) => req.url === '/api/health'
});
app.use("/api/", limiter);

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    userAgent: req.headers["user-agent"]?.substring(0, 50),
    hasAuth: !!req.headers.authorization,
    contentType: req.headers["content-type"],
  };

  if (req.method === "OPTIONS") {
    console.log(`[PREFLIGHT] ${req.url}`, { origin: req.headers.origin });
  } else if (req.method !== "GET") {
    console.log(`[${req.method}] ${req.url}`, logData);
  }

  if (req.url.includes("/transactions") && req.headers["x-razorpay-signature"]) {
    console.log(`[RAZORPAY WEBHOOK] Signature: ${req.headers["x-razorpay-signature"]}`);
  }

  next();
});

const cacheMiddleware = (duration) => (req, res, next) => {
  if (req.method !== "GET" || /\/(cart|wishlist|orders|auth)\//.test(req.url)) {
    return next();
  }
  const key = `__cache__${req.originalUrl}`;
  const cached = require("memory-cache").get(key);
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    return res.json(cached);
  }
  res.setHeader("X-Cache", "MISS");
  const originalJson = res.json;
  res.json = function (body) {
    require("memory-cache").put(key, body, duration * 1000);
    return originalJson.call(this, body);
  };
  next();
};

app.use("/images", (req, res, next) => {
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  const filePath = path.join(__dirname, "images", req.path);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.warn(`[IMAGES] Not found: ${req.path}`);
      return res.sendFile(path.join(__dirname, "images", "driplet-logo.png"));
    }
    next();
  });
}, express.static(path.join(__dirname, "images")));

// === ROUTES ===
app.use("/api/products", cacheMiddleware(300), productRoutes);
app.use("/api/categories", cacheMiddleware(300), categoryRoutes);
app.use("/api/search", cacheMiddleware(300), searchRoutes);
app.use("/api/reviews", cacheMiddleware(300), reviewRoutes);
app.use("/api/site-settings", siteSettingsRoutes);
app.use("/api/sales", cacheMiddleware(300), salesRoutes);

app.use("/api/auth", clientAuthRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/client/orders", clientorderRoutes);

// ADMIN ROUTES
app.use("/api/admin/orders", orderRoutes);
app.use("/api/admin/support-tickets", supportTicketRoutes);
app.use("/api/admin/analytics", analyticsRoutes);
app.use("/api/admin/transactions", transactionRoutes);
app.use("/api/admin/mails", mailRoutes);

// === HEALTH & TEST ===
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.get("/api/cors-test", (req, res) => {
  res.json({
    message: "CORS working",
    origin: req.headers.origin,
    method: req.method,
    hasAuth: !!req.headers.authorization,
  });
});

// === 404 & ERROR HANDLER ===
app.use((req, res) => {
  console.log(`[404] Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    success: false, 
    message: "Route not found",
    requestedUrl: req.url,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  if (err.message.includes("CORS") || err.message.includes("not allowed")) {
    console.error('[CORS ERROR]', { origin: req.headers.origin, url: req.url, method: req.method });
    return res.status(403).json({
      success: false,
      message: "CORS Error: Origin not allowed",
      origin: req.headers.origin,
    });
  }

  console.error("[SERVER ERROR]", {
    message: err.message,
    url: req.url,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  res.status(err.status || 500).json({ 
    success: false,
    message: process.env.NODE_ENV === 'production' ? "Internal Server Error" : err.message,
    error: process.env.NODE_ENV === 'development' ? { message: err.message, stack: err.stack } : undefined
  });
});

// === GRACEFUL SHUTDOWN ===
let server;
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  if (server) server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  if (server) server.close(() => process.exit(0));
});

// === START SERVER ===
const PORT = process.env.PORT || 5000;
server = app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(` Server running at http://localhost:${PORT}`);
  console.log(` Mode: ${process.env.NODE_ENV}`);
  console.log(`${'='.repeat(50)}\n`);
});

module.exports = app;