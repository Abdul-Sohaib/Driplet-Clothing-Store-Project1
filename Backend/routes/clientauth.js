// routes/clientauth.js
const express = require("express");
const firebaseAuthMiddleware = require("../middleware/firebaseAuthMiddleware");
const User = require("../models/Client/clientuser");
const nodemailer = require("nodemailer");
const { generateReceiptTemplate } = require("./receiptTemplate");

require("dotenv").config();

const router = express.Router();

// Nodemailer for order receipts
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send order receipt
 */
const sendOrderReceipt = async (user, order) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Order Confirmation - Order #${order.paymentOrderId || order._id}`,
      html: generateReceiptTemplate(user, order),
    };
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] ✓ Receipt sent to ${user.email}`);
  } catch (error) {
    console.error("[EMAIL] ✗ Receipt send error:", {
      userEmail: user.email,
      orderId: order._id,
      message: error.message,
    });
  }
};

/**
 * GET /api/auth/user
 * Returns current Firebase-linked user
 */
router.get("/user", firebaseAuthMiddleware, async (req, res) => {
  try {
    console.log("[AUTH] GET /user request from:", req.user.email);

    if (!req.user || !req.user._id) {
      console.error("[AUTH] ✗ No user in request");
      return res.status(401).json({ 
        success: false,
        message: "Unauthenticated",
        requiresAuth: true
      });
    }

    const user = await User.findById(req.user._id)
      .select("name email gender addresses photoURL")
      .lean();

    if (!user) {
      console.error("[AUTH] ✗ User not found in DB:", req.user._id);
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    console.log("[AUTH] ✓ User data fetched:", user.email);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender || '',
        photoURL: user.photoURL || '',
        addresses: user.addresses || [],
      },
    });
  } catch (err) {
    console.error("[AUTH] ✗ GET /user error:", {
      message: err.message,
      userId: req.user?._id,
      stack: err.stack,
    });
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * PUT /api/auth/user
 * Update user profile (gender, name, etc.)
 */
router.put("/user", firebaseAuthMiddleware, async (req, res) => {
  try {
    const { gender, name } = req.body;
    
    console.log("[AUTH] PUT /user request:", { 
      userId: req.user._id, 
      updates: { gender, name } 
    });

    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthenticated" 
      });
    }

    const updateData = {};
    if (gender) updateData.gender = gender;
    if (name) updateData.name = name;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select("name email gender photoURL");

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    console.log("[AUTH] ✓ Profile updated:", user.email);

    res.json({
      success: true,
      message: "Profile updated",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        photoURL: user.photoURL || '',
      },
    });
  } catch (err) {
    console.error("[AUTH] ✗ PUT /user error:", {
      message: err.message,
      userId: req.user?._id,
    });
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

/**
 * GET /api/auth/addresses
 */
router.get("/addresses", firebaseAuthMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthenticated" 
      });
    }

    const user = await User.findById(req.user._id).select("addresses");
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.json({ 
      success: true,
      addresses: user.addresses || [] 
    });
  } catch (err) {
    console.error("[AUTH] ✗ GET /addresses error:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

/**
 * POST /api/auth/address
 */
router.post("/address", firebaseAuthMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthenticated" 
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    user.addresses = user.addresses || [];
    user.addresses.push(req.body);
    await user.save();

    console.log("[AUTH] ✓ Address added:", req.user.email);

    res.json({ 
      success: true,
      message: "Address added", 
      addresses: user.addresses 
    });
  } catch (err) {
    console.error("[AUTH] ✗ POST /address error:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Failed to add address" 
    });
  }
});

/**
 * PUT /api/auth/address/:index
 */
router.put("/address/:index", firebaseAuthMiddleware, async (req, res) => {
  try {
    const { index } = req.params;
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthenticated" 
      });
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.addresses || user.addresses.length <= parseInt(index)) {
      return res.status(404).json({ 
        success: false,
        message: "Address not found" 
      });
    }

    user.addresses[parseInt(index)] = req.body;
    await user.save();

    console.log("[AUTH] ✓ Address updated:", req.user.email);

    res.json({ 
      success: true,
      message: "Address updated", 
      addresses: user.addresses 
    });
  } catch (err) {
    console.error("[AUTH] ✗ PUT /address error:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Failed to update address" 
    });
  }
});

/**
 * DELETE /api/auth/address/:index
 */
router.delete("/address/:index", firebaseAuthMiddleware, async (req, res) => {
  try {
    const { index } = req.params;
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthenticated" 
      });
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.addresses || user.addresses.length <= parseInt(index)) {
      return res.status(404).json({ 
        success: false,
        message: "Address not found" 
      });
    }

    user.addresses.splice(parseInt(index), 1);
    await user.save();

    console.log("[AUTH] ✓ Address deleted:", req.user.email);

    res.json({ 
      success: true,
      message: "Address deleted", 
      addresses: user.addresses 
    });
  } catch (err) {
    console.error("[AUTH] ✗ DELETE /address error:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete address" 
    });
  }
});

/**
 * POST /api/auth/logout
 * Client-side only – Firebase handles session
 */
router.post("/logout", (req, res) => {
  res.json({ 
    success: true,
    message: "Logout successful (client-side)" 
  });
});

/**
 * DEPRECATED ENDPOINTS - Use Firebase Auth
 */
router.post("/register", (req, res) => {
  res.status(410).json({ 
    success: false,
    message: "Use Firebase Auth for registration" 
  });
});

router.post("/login", (req, res) => {
  res.status(410).json({ 
    success: false,
    message: "Use Firebase Auth for login" 
  });
});

router.post("/forgot-password", (req, res) => {
  res.status(410).json({ 
    success: false,
    message: "Use Firebase password reset" 
  });
});

router.post("/verify-code", (req, res) => {
  res.status(410).json({ 
    success: false,
    message: "Use Firebase password reset" 
  });
});

module.exports = router;
module.exports.sendOrderReceipt = sendOrderReceipt;