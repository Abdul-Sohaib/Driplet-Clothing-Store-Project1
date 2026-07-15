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
    
    // Safely drop the incorrect index on user reviews if it exists
    try {
      const db = mongoose.connection.db;
      if (db) {
        await db.collection("users").dropIndex("reviews.productId_1");
        console.log("✅ Successfully dropped incorrect reviews.productId_1 index from users collection");
      } else {
        console.warn("⚠️ mongoose.connection.db is undefined, skipping index drop");
      }
    } catch (err) {
      if (err.codeName === "IndexNotFound" || err.message.includes("index not found")) {
        console.log("ℹ️ Index reviews.productId_1 not found (already dropped or not created)");
      } else {
        console.warn("⚠️ Failed to drop reviews.productId_1 index:", err.message);
      }
    }
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

module.exports = connectDB;