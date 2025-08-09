// backend/models/Mail.js
const mongoose = require("mongoose");

const mailSchema = new mongoose.Schema({
  name: { type: String, required: true },
  unread: { type: Boolean, default: true },
  date: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Mail", mailSchema);