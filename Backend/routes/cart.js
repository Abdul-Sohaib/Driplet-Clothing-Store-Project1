const express = require("express");
const User = require("../models/Client/clientuser");
const authMiddleware = require("../middleware/clientauthmiddleware");

const router = express.Router();

// Add product to cart
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { productId, quantity, size } = req.body;

    console.log("Add to cart request:", { productId, quantity, size, userId: req.user._id });

    if (!productId || !quantity || !size) {
      return res.status(400).json({ message: "Product ID, quantity, and size are required" });
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
    console.log("Cart updated for user:", req.user.email);

    res.status(200).json({ message: "Item added to cart" });
  } catch (error) {
    console.error("Add to cart error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's cart
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("Fetching cart for user:", req.user.email);

    const user = await User.findById(req.user._id).populate({
      path: "cart.productId",
      select: "name variants",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartItems = user.cart.map((item) => {
      const variant = item.productId?.variants?.[0] || {};
      return {
        productId: item.productId?._id,
        quantity: item.quantity,
        size: item.size,
        product: {
          name: item.productId?.name || "Unknown Product",
          price: variant.price || 0,
          imageUrls: variant.imageUrls || [],
        },
      };
    });

    console.log("Cart items fetched:", cartItems);
    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Get cart error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove product from cart
router.delete("/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const { size } = req.body;

    console.log("Remove from cart request:", { productId, size, userId: req.user._id });

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
    console.log("Item removed from cart for user:", req.user.email);

    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Remove from cart error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Clear user's cart
router.delete("/", authMiddleware, async (req, res) => {
  try {
    console.log("Clear cart request for user:", req.user.email);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = [];
    await user.save();
    console.log("Cart cleared for user:", req.user.email);

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Clear cart error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;