const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  size: { type: String, required: true },
  price: { type: Number, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  image: { type: String },
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  date: { type: String, required: true },
});

const orderSchema = new mongoose.Schema({
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
  },
  date: { type: String, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Placed", "Packed", "Shipped", "Delivered", "Cancelled"],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Paid", "Pending", "Failed"],
    required: true,
  },
  items: [itemSchema],
  category: { type: String, required: true },
  statusHistory: [statusHistorySchema],
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);