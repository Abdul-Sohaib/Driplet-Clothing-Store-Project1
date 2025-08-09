const express = require("express");
const router = express.Router();
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const Category = require("../../models/Category");
const authMiddleware = require("../../middleware/Adminauth");
const validate = require("../../middleware/Adminvalidate");
const { body } = require("express-validator");
const { format, subDays } = require("date-fns");

// Validation
const orderValidation = [
  body("customer.name").notEmpty().withMessage("Customer name is required"),
  body("customer.email").isEmail().withMessage("Valid email is required"),
  body("customer.address").notEmpty().withMessage("Address is required"),
  body("amount").isFloat({ min: 0 }).withMessage("Invalid amount"),
  body("status").isIn(["Placed", "Packed", "Shipped", "Delivered", "Cancelled"]).withMessage("Invalid status"),
  body("paymentStatus").isIn(["Paid", "Pending", "Failed"]).withMessage("Invalid payment status"),
  body("items").isArray({ min: 1 }).withMessage("At least one item required"),
  body("category").notEmpty().withMessage("Category is required"),
];

// Helper function to get category and its subcategories by name
const getCategoryAndSubcategories = async (categoryName) => {
  const categories = await Category.find({
    $or: [{ name: categoryName }, { parent: categoryName }],
  });
  return categories.map(cat => cat.ID);
};

// Helper function to get category name by ID
const getCategoryName = async (categoryId) => {
  const category = await Category.findOne({ ID: categoryId });
  return category ? category.name : "N/A";
};

// GET all orders
router.get("/", async (req, res) => {
  try {
    const { status, paymentStatus, category, dateRange } = req.query;
    let query = {};

    if (status && status !== "All") query.status = status;
    if (paymentStatus && paymentStatus !== "All") query.paymentStatus = paymentStatus;
    if (category && category !== "All") {
      const categoryIds = await getCategoryAndSubcategories(category);
      if (categoryIds.length === 0) {
        return res.json([]);
      }
      const products = await Product.find({ category: { $in: categoryIds } });
      const productIds = products.map(p => p._id.toString());
      query["items.productId"] = { $in: productIds };
    }
    if (dateRange) {
      const days = parseInt(dateRange) || 7;
      const startDate = format(subDays(new Date(), days), "yyyy-MM-dd");
      query.date = { $gte: startDate };
    }

    const orders = await Order.find(query).populate("items.productId");
    const mappedOrders = await Promise.all(
      orders.map(async order => {
        const firstItem = order.items[0] || {};
        const product = firstItem.productId || {};
        const categoryName = await getCategoryName(product.category || order.category);
        return {
          id: order._id.toString(),
          productName: firstItem.name || product.name || "N/A",
          customer: order.customer.name,
          category: categoryName,
          quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
          total: order.amount,
          status: order.status === "Placed" || order.status === "Packed" ? "Pending" : order.status,
          paymentStatus: order.paymentStatus,
          date: order.date,
        };
      })
    );

    // Sort orders by category name
    mappedOrders.sort((a, b) => a.category.localeCompare(b.category));

    res.json(mappedOrders);
  } catch (error) {
    console.error("Error fetching orders:", {
      message: error.message,
      stack: error.stack,
      query: req.query,
    });
    res.status(500).json({ message: `Failed to fetch orders: ${error.message}` });
  }
});

// GET order by ID
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.productId");
    if (!order) return res.status(404).json({ message: "Order not found" });
    const firstItem = order.items[0] || {};
    const product = firstItem.productId || {};
    const categoryName = await getCategoryName(product.category || order.category);
    const mappedOrder = {
      id: order._id.toString(),
      productName: firstItem.name || product.name || "N/A",
      customer: order.customer.name,
      category: categoryName,
      quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
      total: order.amount,
      status: order.status === "Placed" || order.status === "Packed" ? "Pending" : order.status,
      paymentStatus: order.paymentStatus,
      date: order.date,
    };
    res.json(mappedOrder);
  } catch (error) {
    console.error("Error fetching order by ID:", {
      message: error.message,
      stack: error.stack,
      id: req.params.id,
    });
    res.status(500).json({ message: error.message });
  }
});

// POST create order
router.post("/", authMiddleware, validate(orderValidation), async (req, res) => {
  try {
    const { customer, date, amount, status, paymentStatus, items, category } = req.body;

    // Validate category by name
    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      return res.status(400).json({ message: `Category "${category}" not found` });
    }

    const order = new Order({
      customer,
      date,
      amount,
      status,
      paymentStatus,
      items,
      category: categoryDoc.ID,
      statusHistory: [{ status, date: format(new Date(), "yyyy-MM-dd HH:mm") }],
    });

    await order.save();
    const populatedOrder = await Order.findById(order._id).populate("items.productId");
    const firstItem = populatedOrder.items[0] || {};
    const product = firstItem.productId || {};
    const categoryName = await getCategoryName(product.category || populatedOrder.category);
    const mappedOrder = {
      id: populatedOrder._id.toString(),
      productName: firstItem.name || product.name || "N/A",
      customer: populatedOrder.customer.name,
      category: categoryName,
      quantity: populatedOrder.items.reduce((sum, item) => sum + item.quantity, 0),
      total: order.amount,
      status: order.status === "Placed" || order.status === "Packed" ? "Pending" : order.status,
      paymentStatus: order.paymentStatus,
      date: order.date,
    };
    res.status(201).json(mappedOrder);
  } catch (error) {
    console.error("Error creating order:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });
    res.status(400).json({ message: error.message });
  }
});

// PUT update order
router.put(
  "/:id",
  authMiddleware,
  validate([
    body("status").isIn(["Placed", "Packed", "Shipped", "Delivered", "Cancelled"]).withMessage("Invalid status"),
  ]),
  async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findById(req.params.id).populate("items.productId");
      if (!order) return res.status(404).json({ message: "Order not found" });

      order.status = status;
      order.statusHistory.push({ status, date: format(new Date(), "yyyy-MM-dd HH:mm") });
      await order.save();

      const firstItem = order.items[0] || {};
      const product = firstItem.productId || {};
      const categoryName = await getCategoryName(product.category || order.category);
      const mappedOrder = {
        id: order._id.toString(),
        productName: firstItem.name || product.name || "N/A",
        customer: order.customer.name,
        category: categoryName,
        quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
        total: order.amount,
        status: order.status === "Placed" || order.status === "Packed" ? "Pending" : order.status,
        paymentStatus: order.paymentStatus,
        date: order.date,
      };
      res.json(mappedOrder);
    } catch (error) {
      console.error("Error updating order:", {
        message: error.message,
        stack: error.stack,
        id: req.params.id,
      });
      res.status(400).json({ message: error.message });
    }
  }
);

// DELETE order
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (error) {
    console.error("Error deleting order:", {
      message: error.message,
      stack: error.stack,
      id: req.params.id,
    });
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;