const express = require("express");
const router = express.Router();
const Product = require("../../models/Product");
const Category = require("../../models/Category");

// Utility function for safe regex
const escapeRegex = (str) => {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
};

router.get("/", async (req, res) => {
  try {
    const rawQuery = req.query.q;
    if (!rawQuery || typeof rawQuery !== "string" || !rawQuery.trim()) {
      return res.status(400).json({ message: "Query parameter required" });
    }

    const q = escapeRegex(rawQuery.trim());

    // Limit results to prevent overload
    const [products, categories] = await Promise.all([
      Product.find({
        $or: [
          { name: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { category: { $regex: q, $options: "i" } },
        ],
      })
        .limit(6)
        .sort({ updatedAt: -1 }), // Optional sorting

      Category.find({
        $or: [
          { name: { $regex: q, $options: "i" } },
          { ID: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
        ],
      }).limit(6),
    ]);

    res.json({ products, categories });
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
