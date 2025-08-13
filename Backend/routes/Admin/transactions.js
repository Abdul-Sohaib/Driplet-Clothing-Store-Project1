const express = require("express");
const router = express.Router();
const Transaction = require("../../models/Transaction");
const crypto = require("crypto");
const prodConfig = require("../../config/production");

// Razorpay webhook secret (set in environment variables or prod.config.js)
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "your-webhook-secret";

// GET transactions with caching
router.get("/", async (req, res) => {
  try {
    const { period } = req.query;
    let query = {};
    if (period) {
      const [start, end] = period.split(" - ").map((d) => new Date(d));
      query.date = { $gte: start.toISOString().split("T")[0], $lte: end.toISOString().split("T")[0] };
    }
    const transactions = await Transaction.find(query).sort({ createdAt: -1 }).limit(10);
    res.setHeader("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
    res.json(transactions);
  } catch (error) {
    console.error("❌ GET /transactions error:", error.message);
    res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
  }
});

// POST transaction (for testing or admin creation)
router.post("/", async (req, res) => {
  try {
    const { name, date, amount, status, razorpayPaymentId } = req.body;
    const transaction = new Transaction({ 
      name, 
      date, 
      amount, 
      status, 
      razorpayPaymentId // Store Razorpay payment ID for tracking
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error("❌ POST /transactions error:", error.message);
    res.status(400).json({ message: "Failed to create transaction", error: error.message });
  }
});

// Razorpay webhook endpoint
router.post("/razorpay-webhook", async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("❌ Razorpay webhook signature mismatch");
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const { event, payload } = req.body;
    if (event === "payment.captured" || event === "payment.authorized") {
      const { payment } = payload;
      const transaction = new Transaction({
        name: payment.email || "Razorpay Payment",
        date: new Date(),
        amount: payment.amount / 100, // Convert paise to rupees
        status: event === "payment.captured" ? "completed" : "pending",
        razorpayPaymentId: payment.id
      });
      await transaction.save();
      console.log(`💳 Razorpay webhook processed: Payment ${payment.id}`);
      res.status(200).json({ message: "Webhook processed successfully" });
    } else {
      console.log(`ℹ️ Razorpay webhook event ignored: ${event}`);
      res.status(200).json({ message: "Event ignored" });
    }
  } catch (error) {
    console.error("❌ Razorpay webhook error:", error.message);
    res.status(500).json({ message: "Webhook processing failed", error: error.message });
  }
});

module.exports = router;