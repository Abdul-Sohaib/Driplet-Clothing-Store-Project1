const express = require("express");
const router = express.Router();
const Sales = require("../../models/Sales");
const Order = require("../../models/Order");
const authMiddleware = require("../../middleware/Adminauth");

// GET sales summary
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);

    let sales = await Sales.findOne();
    if (!sales) {
      sales = new Sales({
        totalOrders,
        totalRevenue,
        title: "Sales Overview",
      });
      await sales.save();
    } else {
      sales.totalOrders = totalOrders;
      sales.totalRevenue = totalRevenue;
      await sales.save();
    }

    res.json({
      totalOrders: sales.totalOrders,
      totalRevenue: sales.totalRevenue,
      title: sales.title,
    });
  } catch (error) {
    console.error("Error fetching sales summary:", error.message);
    res.status(500).json({ message: "Server error while fetching sales summary" });
  }
});

module.exports = router;