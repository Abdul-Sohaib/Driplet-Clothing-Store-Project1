// backend/models/Category.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  ID: { type: String, required: true, unique: true },
  parent: { type: String, default: null }, // Changed to null for consistency with validation
  gender: { type: String, default: null },
  clothingType: { type: String, default: null },
  description: { type: String, default: null },
  imageUrl: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);