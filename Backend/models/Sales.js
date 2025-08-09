const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  totalOrders: { type: Number, required: true, default: 0 },
  totalRevenue: { type: Number, required: true, default: 0 },
  title: { type: String, required: true, default: "Sales Overview" },
}, { timestamps: true });

module.exports = mongoose.model("Sales", salesSchema);