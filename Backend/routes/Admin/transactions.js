// backend/routes/transactions.js
const express = require("express");
const router = express.Router();
const Transaction = require("../../models/Transaction");

// GET transactions
router.get("/", async (req, res) => {
  try {
    const { period } = req.query;
    let query = {};
    if (period) {
      const [start, end] = period.split(" - ").map((d) => new Date(d));
      query.date = { $gte: start.toISOString().split("T")[0], $lte: end.toISOString().split("T")[0] };
    }
    const transactions = await Transaction.find(query).sort({ createdAt: -1 }).limit(10);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST transaction (for testing or admin creation)
router.post("/", async (req, res) => {
  try {
    const { name, date, amount, status } = req.body;
    const transaction = new Transaction({ name, date, amount, status });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;