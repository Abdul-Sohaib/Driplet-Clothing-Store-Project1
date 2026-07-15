// backend/config/db.js
const mongoose = require("mongoose");
const dns = require("dns");

// Set fallback Google DNS servers to ensure Atlas SRV resolution works
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
  console.log("✅ Configured Google DNS servers for SRV resolution");
} catch (err) {
  console.warn("⚠️ Failed to set custom DNS servers, using default resolver:", err.message);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

module.exports = connectDB;