// backend/routes/analytics.js
const express = require("express");
const router = express.Router();
const Order = require("../../models/Order");
const { subDays, format } = require("date-fns");

// GET sales analytics
router.get("/sales", async (req, res) => {
  try {
    const { year } = req.query;
    const startDate = new Date(`${year || new Date().getFullYear()}-01-01`);
    const endDate = new Date(`${year || new Date().getFullYear()}-12-31`);

    const orders = await Order.find({
      date: { $gte: format(startDate, "yyyy-MM-dd"), $lte: format(endDate, "yyyy-MM-dd") },
    });

    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = format(new Date(2022, i, 1), "MMM");
      const income = orders
        .filter((o) => new Date(o.date).getMonth() === i)
        .reduce((sum, o) => sum + (o.paymentStatus === "Paid" ? o.amount : 0), 0);
      const spending = income * 0.6; // Mock spending (adjust with real data)
      return { name: month, income, spending };
    });

    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET category stats
router.get("/stats", async (req, res) => {
  try {
    const orders = await Order.find();
    const stats = [
      { name: "Searched", value: orders.length * 2, color: "#3b82f6" }, // Mock
      { name: "Ordered", value: orders.length, color: "#f97316" },
      { name: "Added to Cart", value: orders.length * 1.5, color: "#ef4444" }, // Mock
    ];
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;