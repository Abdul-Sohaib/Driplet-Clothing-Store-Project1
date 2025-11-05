// config/production.js
module.exports = {
  CLIENT_APP_URL: process.env.CLIENT_APP_URL || "http://localhost:5173",
  ADMIN_APP_URL: process.env.ADMIN_APP_URL || "http://localhost:5174",

  MONGODB_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT || 5000,
  NODE_ENV: "production",

  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
};