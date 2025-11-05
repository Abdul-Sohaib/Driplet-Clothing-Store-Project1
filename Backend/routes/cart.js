// routes/cart.js
const express = require("express");
const User = require("../models/Client/clientuser");
const firebaseAuthMiddleware = require("../middleware/firebaseAuthMiddleware");

const router = express.Router();

// ===================================================================
// ADD TO CART
// POST /api/cart
// ===================================================================
router.post("/", firebaseAuthMiddleware, async (req, res) => {
  try {
    const { productId, quantity = 1, size } = req.body;

    console.log("Add to cart request:", {
      productId,
      quantity,
      size,
      userId: req.user._id,
      firebaseUid: req.user.id,
      email: req.user.email,
    });

    if (!productId || !size) {
      return res.status(400).json({ message: "Product ID and size are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingItem = user.cart.find(
      (item) => item.productId.toString() === productId && item.size === size
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ productId, quantity, size });
    }

    await user.save();

    console.log("Cart updated:", { userId: req.user._id, cartCount: user.cartCount });

    res.status(200).json({ message: "Item added to cart" });
  } catch (error) {
    console.error("Add to cart error:", {
      message: error.message,
      userId: req.user._id,
      stack: error.stack,
    });
    res.status(500).json({ message: "Server error" });
  }
});

// ===================================================================
// GET CART
// GET /api/cart
// ===================================================================
router.get("/", firebaseAuthMiddleware, async (req, res) => {
  try {
    console.log("Fetching cart for user:", req.user.email);

    const user = await User.findById(req.user._id)
      .populate({
        path: "cart.productId",
        select: "name variants",
      })
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartItems = user.cart.map((item) => {
      const variant = item.productId?.variants?.[0] || {};
      return {
        productId: item.productId?._id?.toString(),
        quantity: item.quantity,
        size: item.size,
        product: {
          name: item.productId?.name || "Unknown Product",
          price: variant.price || 0,
          imageUrls: variant.imageUrls || [],
        },
      };
    });

    console.log("Cart fetched:", { count: cartItems.length });

    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Get cart error:", {
      message: error.message,
      userId: req.user._id,
    });
    res.status(500).json({ message: "Server error" });
  }
});

// ===================================================================
// REMOVE FROM CART
// DELETE /api/cart/:productId
// ===================================================================
router.delete("/:productId", firebaseAuthMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const { size } = req.body;

    console.log("Remove from cart:", { productId, size, userId: req.user._id });

    if (!productId || !size) {
      return res.status(400).json({ message: "Product ID and size are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const initialLength = user.cart.length;
    user.cart = user.cart.filter(
      (item) => !(item.productId.toString() === productId && item.size === size)
    );

    if (user.cart.length === initialLength) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    await user.save();

    console.log("Item removed from cart:", { userId: req.user._id });

    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Remove from cart error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ===================================================================
// CLEAR CART
// DELETE /api/cart
// ===================================================================
router.delete("/", firebaseAuthMiddleware, async (req, res) => {
  try {
    console.log("Clear cart request for user:", req.user.email);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = [];
    await user.save();

    console.log("Cart cleared:", { userId: req.user._id });

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Clear cart error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;