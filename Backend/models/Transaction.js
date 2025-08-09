// backend/models/Transaction.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["Credited", "Debited"], required: true },
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);