const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/Client/clientuser");
const nodemailer = require("nodemailer");
const authMiddleware = require("../middleware/clientauthmiddleware");
const { generateReceiptTemplate } = require("./receiptTemplate");

// Import centralized cookie configuration
const { setAuthCookie, clearAuthCookie } = require("../middleware/cookies");

require("dotenv").config();

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send order receipt email
const sendOrderReceipt = async (user, order) => {
  try {
    console.log("Sending receipt for order:", {
      orderId: order._id,
      items: order.items,
      customer: order.customer,
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Order Confirmation - Order #${order.paymentOrderId || order._id}`,
      html: generateReceiptTemplate(user, order),
    };
    await transporter.sendMail(mailOptions);
    console.log(`Order receipt sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending order receipt:", {
      message: error.message,
      stack: error.stack,
      userEmail: user.email,
      orderId: order._id,
    });
  }
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("Register request:", { name, email, password: "[REDACTED]" });
    console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Present" : "Missing");

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUsers = await User.find({ email: email.toLowerCase() });
    if (existingUsers.length > 0) {
      console.log(`Found ${existingUsers.length} existing users for ${email}. Deleting...`);
      await User.deleteMany({ email: email.toLowerCase() });
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      cart: [],
      addresses: [],
    });

    await user.save();
    console.log("User saved successfully:", { email: user.email, id: user._id });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Use centralized cookie configuration
    setAuthCookie(res, token);

    res.status(201).json({ message: "User registered successfully", user: { name: user.name, email: user.email }, token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login request:", { email, password: "[REDACTED]" });
    console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Present" : "Missing");

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(400).json({ message: "Invalid credentials: Email not found" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(400).json({ message: "Invalid credentials: Incorrect password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Use centralized cookie configuration
    setAuthCookie(res, token);

    res.json({ message: "Login successful", user: { name: user.name, email: user.email }, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    // Use centralized cookie configuration
    clearAuthCookie(res);
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/user", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }
    const user = await User.findById(req.user._id).select("name email _id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user: { name: user.name, email: user.email, _id: user._id } });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/user-details", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }
    const user = await User.findById(req.user._id).select("addresses");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ addresses: user.addresses || [] });
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/address", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.addresses = user.addresses || [];
    user.addresses.push(req.body);
    await user.save();
    res.json({ message: "Address added", addresses: user.addresses });
  } catch (err) {
    console.error("Add address error:", err);
    res.status(500).json({ message: "Failed to add address" });
  }
});

router.put("/address/:index", authMiddleware, async (req, res) => {
  try {
    const { index } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.addresses || user.addresses.length <= parseInt(index)) {
      return res.status(404).json({ message: "Address not found" });
    }
    user.addresses[parseInt(index)] = req.body;
    await user.save();
    res.json({ message: "Address updated", addresses: user.addresses });
  } catch (err) {
    console.error("Update address error:", err);
    res.status(500).json({ message: "Failed to update address" });
  }
});

router.delete("/address/:index", authMiddleware, async (req, res) => {
  try {
    const { index } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.addresses || user.addresses.length <= parseInt(index)) {
      return res.status(404).json({ message: "Address not found" });
    }
    user.addresses.splice(parseInt(index), 1);
    await user.save();
    res.json({ message: "Address deleted", addresses: user.addresses });
  } catch (err) {
    console.error("Delete address error:", err);
    res.status(500).json({ message: "Failed to delete address" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = resetCode;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${resetCode}`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Reset code sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/verify-code", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.resetCode !== code) {
      return res.status(400).json({ message: "Invalid code" });
    }

    user.password = newPassword;
    user.resetCode = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Verify code error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
module.exports.sendOrderReceipt = sendOrderReceipt;