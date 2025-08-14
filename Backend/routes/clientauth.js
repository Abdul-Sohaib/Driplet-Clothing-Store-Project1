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

// Get authenticated user details - FIXED
router.get("/user", authMiddleware, async (req, res) => {
  try {
    console.log("GET /user - req.user:", req.user);
    
    // Use req.user data directly since it's already populated by middleware
    const user = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      gender: req.user.gender
    };

    console.log("User fetched successfully:", user);
    res.status(200).json({ user });
  } catch (error) {
    console.error("Fetch user error:", {
      message: error.message,
      stack: error.stack,
      userId: req.user?._id
    });
    res.status(500).json({ message: "Server error" });
  }
});

// Update user details - FIXED
router.put("/user", authMiddleware, async (req, res) => {
  try {
    const { gender } = req.body;
    console.log("PUT /user - updating user:", req.user._id, "with data:", { gender });
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { gender },
      { new: true, runValidators: true }
    ).select('-password -resetCode');
    
    if (!user) {
      console.log("User not found for update:", req.user._id);
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log("User updated successfully:", {
      id: user._id,
      email: user.email,
      gender: user.gender
    });
    
    res.status(200).json({ 
      message: "User updated successfully",
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        gender: user.gender 
      } 
    });
  } catch (error) {
    console.error("Update user error:", {
      message: error.message,
      stack: error.stack,
      userId: req.user?._id
    });
    res.status(500).json({ message: "Server error" });
  }
});

// Get user addresses
router.get("/addresses", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("addresses");
    if (!user) {
      console.log("User not found for ID:", req.user._id);
      return res.status(404).json({ message: "User not found" });
    }
    console.log("Addresses fetched successfully:", { userId: user._id, addresses: user.addresses });
    res.status(200).json({ addresses: user.addresses || [] });
  } catch (error) {
    console.error("Fetch addresses error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout endpoint
router.post("/logout", (req, res) => {
  try {
    console.log("Logout request received from:", req.headers.origin || 'unknown origin');
    clearAuthCookie(res);
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("Register request:", { 
      name, 
      email, 
      password: "[REDACTED]",
      origin: req.headers.origin,
      userAgent: req.headers['user-agent']?.substring(0, 50)
    });
    console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Present" : "Missing");

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password strength
    if (password.trim().length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log(`User already exists for email: ${email}`);
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password: password.trim(),
      cart: [],
      addresses: [],
    });

    await user.save();
    console.log("User saved successfully:", { email: user.email, id: user._id });

    const token = jwt.sign(
      { 
        id: user._id.toString(), // Ensure string conversion
        email: user.email,
        name: user.name,
        iat: Math.floor(Date.now() / 1000)
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    setAuthCookie(res, token);

    // Send token in response body as fallback
    res.status(201).json({ 
      message: "User registered successfully", 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        gender: user.gender 
      }, 
      token,
      success: true
    });
  } catch (error) {
    console.error("Registration error:", {
      message: error.message,
      stack: error.stack,
      email: req.body?.email
    });
    res.status(500).json({ message: "Server error during registration" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login request:", { 
      email, 
      password: "[REDACTED]",
      origin: req.headers.origin,
      userAgent: req.headers['user-agent']?.substring(0, 50)
    });
    console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Present" : "Missing");

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(400).json({ message: "Invalid credentials: Email not found" });
    }

    const isMatch = await user.matchPassword(password.trim());
    if (!isMatch) {
      console.log("Password mismatch for email:", email);
      return res.status(400).json({ message: "Invalid credentials: Incorrect password" });
    }

    const token = jwt.sign(
      { 
        id: user._id.toString(), // Ensure string conversion
        email: user.email,
        name: user.name,
        iat: Math.floor(Date.now() / 1000)
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    setAuthCookie(res, token);

    console.log("Login successful for user:", { email: user.email, id: user._id });

    // Send token in response body as fallback
    res.status(200).json({ 
      message: "Login successful", 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        gender: user.gender 
      }, 
      token,
      success: true
    });
  } catch (error) {
    console.error("Login error:", {
      message: error.message,
      stack: error.stack,
      email: req.body?.email
    });
    res.status(500).json({ message: "Server error during login" });
  }
});

router.post("/address", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log("User not found for ID:", req.user._id);
      return res.status(404).json({ message: "User not found" });
    }
    console.log("Add address request:", { userId: user._id, address: req.body });
    user.addresses = user.addresses || [];
    user.addresses.push(req.body);
    await user.save();
    console.log("Address saved successfully:", { userId: user._id, addresses: user.addresses });
    res.json({ message: "Address added", addresses: user.addresses });
  } catch (err) {
    console.error("Add address error:", { message: err.message, stack: err.stack, address: req.body });
    res.status(500).json({ message: "Failed to add address" });
  }
});

router.put("/address/:index", authMiddleware, async (req, res) => {
  try {
    const { index } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log("User not found for ID:", req.user._id);
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.addresses || user.addresses.length <= parseInt(index)) {
      console.log("Address not found for index:", index, "userId:", user._id);
      return res.status(404).json({ message: "Address not found" });
    }
    console.log("Update address request:", { userId: user._id, index, address: req.body });
    user.addresses[parseInt(index)] = req.body;
    await user.save();
    console.log("Address updated successfully:", { userId: user._id, addresses: user.addresses });
    res.json({ message: "Address updated", addresses: user.addresses });
  } catch (err) {
    console.error("Update address error:", { message: err.message, stack: err.stack, index, address: req.body });
    res.status(500).json({ message: "Failed to update address" });
  }
});

router.delete("/address/:index", authMiddleware, async (req, res) => {
  try {
    const { index } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log("User not found for ID:", req.user._id);
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.addresses || user.addresses.length <= parseInt(index)) {
      console.log("Address not found for index:", index, "userId:", user._id);
      return res.status(404).json({ message: "Address not found" });
    }
    console.log("Delete address request:", { userId: user._id, index });
    user.addresses.splice(parseInt(index), 1);
    await user.save();
    console.log("Address deleted successfully:", { userId: user._id, addresses: user.addresses });
    res.json({ message: "Address deleted", addresses: user.addresses });
  } catch (err) {
    console.error("Delete address error:", { message: err.message, stack: err.stack, index });
    res.status(500).json({ message: "Failed to delete address" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(404).json({ message: "User not found" });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = resetCode;
    await user.save();
    console.log("Reset code saved for user:", { email: user.email, resetCode });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${resetCode}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Reset code sent to:", email);
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
      console.log("Invalid reset code for email:", email);
      return res.status(400).json({ message: "Invalid code" });
    }

    user.password = newPassword.trim();
    user.resetCode = undefined;
    await user.save();
    console.log("Password reset successful for user:", { email: user.email });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Verify code error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
module.exports.sendOrderReceipt = sendOrderReceipt;