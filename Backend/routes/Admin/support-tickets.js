// backend/routes/support-tickets.js
const express = require("express");
const router = express.Router();
const SupportTicket = require("../../models/SupportTicket");
const authMiddleware = require("../../middleware/Adminauth");
const validate = require("../../middleware/Adminvalidate");
const { body } = require("express-validator");

// Validation
const ticketValidation = [
  body("customer").notEmpty().withMessage("Customer name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("subject").notEmpty().withMessage("Subject is required"),
  body("message").notEmpty().withMessage("Message is required"),
  body("status").isIn(["Open", "In Progress", "Resolved", "Closed"]).withMessage("Invalid status"),
  body("priority").isIn(["High", "Medium", "Low"]).withMessage("Invalid priority"),
];

// GET all tickets
router.get("/", async (req, res) => {
  try {
    const tickets = await SupportTicket.find();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ticket by ID
router.get("/:id", async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create ticket
router.post("/", authMiddleware, validate(ticketValidation), async (req, res) => {
  try {
    const { customer, email, subject, message, orderId, status, priority, date, assignedTo } = req.body;

    const ticket = new SupportTicket({
      customer,
      email,
      subject,
      message,
      orderId,
      status,
      priority,
      date,
      assignedTo,
    });

    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update ticket
router.put(
  "/:id",
  authMiddleware,
  validate([
    body("status").isIn(["Open", "In Progress", "Resolved", "Closed"]).withMessage("Invalid status"),
    body("priority").isIn(["High", "Medium", "Low"]).withMessage("Invalid priority"),
  ]),
  async (req, res) => {
    try {
      const { status, priority, assignedTo } = req.body;
      const ticket = await SupportTicket.findByIdAndUpdate(
        req.params.id,
        { status, priority, assignedTo },
        { new: true }
      );
      if (!ticket) return res.status(404).json({ message: "Ticket not found" });
      res.json(ticket);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// DELETE ticket
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json({ message: "Ticket deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;