const express = require("express");
const User = require("../models/Client/clientuser");
const authMiddleware = require("../middleware/clientauthmiddleware");

const router = express.Router();

// Add product to wishlist
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { productId, size } = req.body;

    console.log("Add to wishlist request:", { productId, size, userId: req.user._id });

    if (!productId || !size) {
      return res.status(400).json({ message: "Product ID and size are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingItem = user.wishlist.find(
      (item) => item.productId.toString() === productId && item.size === size
    );
    if (existingItem) {
      return res.status(400).json({ message: "Item already in wishlist" });
    }

    user.wishlist.push({ productId, size });
    await user.save();
    console.log("Wishlist updated for user:", req.user.email);

    res.status(200).json({ message: "Item added to wishlist" });
  } catch (error) {
    console.error("Add to wishlist error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's wishlist
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("Fetching wishlist for user:", req.user.email);

    const user = await User.findById(req.user._id).populate({
      path: "wishlist.productId",
      select: "name variants",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const wishlistItems = user.wishlist.map((item) => {
      const variant = item.productId?.variants?.[0] || {};
      return {
        productId: item.productId?._id,
        size: item.size,
        product: {
          name: item.productId?.name || "Unknown Product",
          price: variant.price || 0,
          imageUrls: variant.imageUrls || [],
        },
      };
    });

    console.log("Wishlist items fetched:", wishlistItems);
    res.status(200).json(wishlistItems);
  } catch (error) {
    console.error("Get wishlist error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove product from wishlist
router.delete("/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const { size } = req.body;

    console.log("Remove from wishlist request:", { productId, size, userId: req.user._id });

    if (!productId || !size) {
      return res.status(400).json({ message: "Product ID and size are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const initialLength = user.wishlist.length;
    user.wishlist = user.wishlist.filter(
      (item) => !(item.productId.toString() === productId && item.size === size)
    );

    if (user.wishlist.length === initialLength) {
      return res.status(404).json({ message: "Item not found in wishlist" });
    }

    await user.save();
    console.log("Item removed from wishlist for user:", req.user.email);

    res.status(200).json({ message: "Item removed from wishlist" });
  } catch (error) {
    console.error("Remove from wishlist error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Move item from wishlist to cart
router.post("/add-to-cart", authMiddleware, async (req, res) => {
  try {
    const { productId, size } = req.body;

    console.log("Move to cart request:", { productId, size, userId: req.user._id });

    if (!productId || !size) {
      return res.status(400).json({ message: "Product ID and size are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if item is in wishlist
    const wishlistItem = user.wishlist.find(
      (item) => item.productId.toString() === productId && item.size === size
    );
    if (!wishlistItem) {
      return res.status(404).json({ message: "Item not found in wishlist" });
    }

    // Add to cart
    const existingCartItem = user.cart.find(
      (item) => item.productId.toString() === productId && item.size === size
    );
    if (existingCartItem) {
      existingCartItem.quantity += 1;
    } else {
      user.cart.push({ productId, quantity: 1, size });
    }

    // Remove from wishlist
    user.wishlist = user.wishlist.filter(
      (item) => !(item.productId.toString() === productId && item.size === size)
    );

    await user.save();
    console.log("Item moved from wishlist to cart for user:", req.user.email);

    res.status(200).json({ message: "Item moved to cart" });
  } catch (error) {
    console.error("Move to cart error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;