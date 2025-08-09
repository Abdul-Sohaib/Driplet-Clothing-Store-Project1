// backend/models/SupportTicket.js
const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema({
  customer: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  orderId: { type: String, default: "" },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Resolved", "Closed"],
    required: true,
  },
  priority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    required: true,
  },
  date: { type: String, required: true },
  assignedTo: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("SupportTicket", supportTicketSchema);