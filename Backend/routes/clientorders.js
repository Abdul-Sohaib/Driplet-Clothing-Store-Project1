const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const authMiddleware = require("../middleware/clientauthmiddleware");
const User = require("../models/Client/clientuser");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const { generateReceiptTemplate } = require("./receiptTemplate");
const { format } = require("date-fns");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const sendOrderReceipt = async (user, order) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Await the template to ensure we get a string
    const html = await generateReceiptTemplate(user, order);
    if (typeof html !== "string") {
      throw new Error("generateReceiptTemplate did not return a string");
    }

    console.log("Calling generateReceiptTemplate for user:", user.email, "order:", order._id);
    console.log("Generated HTML length:", html.length);

    await transporter.sendMail({
      from: '"Driplet" <no-reply@driplet.com>',
      to: user.email,
      subject: `Order Confirmation - Order #${order.paymentOrderId || order._id}`,
      html,
    });
    console.log(`Order receipt sent to ${user.email} for order ${order._id}`);
  } catch (err) {
    console.error("Error sending order receipt:", {
      message: err.message,
      stack: err.stack,
      userEmail: user.email,
      orderId: order._id,
    });
    throw err;
  }
};

router.post("/initiate", authMiddleware, async (req, res) => {
  const { amount } = req.body;
  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency: "INR",
      receipt: "order_" + Date.now(),
      payment_capture: 1,
    });
    res.json({ orderId: order.id, amount: order.amount });
  } catch (err) {
    console.error("Razorpay order creation error:", {
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ message: "Failed to create order with Razorpay" });
  }
});

router.post("/complete", authMiddleware, async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    cartItems,
    address,
    category,
    customer,
    paymentStatus,
    status,
    date,
  } = req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !cartItems || !address || !customer) {
    console.error("Missing required fields:", {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      cartItems,
      address,
      customer,
    });
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    console.error("Invalid cartItems:", { cartItems });
    return res.status(400).json({ message: "Cart items must be a non-empty array" });
  }

  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  const expected = crypto
    .createHmac("sha256", key_secret)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");
  if (expected !== razorpay_signature) {
    console.error("Payment verification failed:", { expected, razorpay_signature });
    return res.status(400).json({ message: "Payment verification failed" });
  }

  try {
    const items = cartItems.map((item, index) => {
      if (!item.product || !item.productId) {
        console.warn(`Invalid cart item at index ${index}:`, { item });
        throw new Error(`Invalid cart item at index ${index}`);
      }
      const image = Array.isArray(item.product.imageUrls) && item.product.imageUrls.length > 0 && typeof item.product.imageUrls[0] === "string"
        ? item.product.imageUrls[0]
        : "";
      console.log(`Mapping item ${index}:`, {
        name: item.product.name,
        productId: item.productId,
        imageUrls: item.product.imageUrls,
        selectedImage: image,
      });
      return {
        name: item.product.name || "Unknown Product",
        quantity: item.quantity || 1,
        size: item.size || "Unknown",
        price: item.product.price || 0,
        productId: item.productId,
        image,
      };
    });

    const order = new Order({
      customer,
      date: date || format(new Date(), "yyyy-MM-dd"),
      amount: cartItems.reduce(
        (sum, i) => sum + Number(i.product?.price || 0) * Number(i.quantity || 1),
        0
      ),
      status: status || "Placed",
      paymentStatus: paymentStatus || "Paid",
      items,
      category: category || "Clothing",
      paymentOrderId: razorpay_order_id,
      statusHistory: [{ status: status || "Placed", date: format(new Date(), "yyyy-MM-dd HH:mm") }],
    });

    await order.save();
    console.log("Order saved with items:", order.items);

    const transaction = new Transaction({
      name: `Order #${razorpay_order_id}`,
      date: format(new Date(), "yyyy-MM-dd"),
      amount: order.amount,
      status: "Credited",
    });
    await transaction.save();

    await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });
    await sendOrderReceipt(req.user, order);

    res.json({ message: "Order placed successfully!" });
  } catch (err) {
    console.error("Order save error:", {
      message: err.message,
      stack: err.stack,
      payload: { status, paymentStatus, category, customer, items: cartItems },
    });
    return res.status(500).json({ message: "Failed to save order", error: err.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ "customer.email": req.user.email }).sort({ createdAt: -1 });
    console.log("Fetched orders:", orders.map(o => ({
      _id: o._id,
      items: o.items.map(i => ({ name: i.name, image: i.image })),
    })));
    res.json(orders || []);
  } catch (err) {
    console.error("Fetch orders error:", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

module.exports = router;