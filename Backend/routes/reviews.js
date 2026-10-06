const express = require("express");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/Client/clientuser");
const Review = require("../models/Review");
const authMiddleware = require("../middleware/clientauthmiddleware");
const cache = require("memory-cache");

const router = express.Router();

// Validation middleware for reviews
const reviewValidations = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5"),
  body("comment")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Comment cannot exceed 500 characters"),
];

// Middleware to apply review validations
const validateReviews = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }
    next();
  };
};

// POST a new review
router.post(
  "/:productId",
  authMiddleware,
  validateReviews(reviewValidations),
  async (req, res) => {
    try {
      const { productId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized: Please log in" });
      }

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid product ID format" });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userName = user.name || "Customer";

      // 1. Create or update in Review collection
      const savedReview = await Review.findOneAndUpdate(
        { productId, userId },
        {
          productId,
          userId,
          rating: Number(rating),
          comment: comment?.trim() || "",
          userName,
          createdAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // 2. Also keep user's reviews array synchronized
      const existingUserReviewIndex = user.reviews.findIndex(
        (r) => r.productId?.toString() === productId
      );
      if (existingUserReviewIndex > -1) {
        user.reviews[existingUserReviewIndex].rating = Number(rating);
        user.reviews[existingUserReviewIndex].comment = comment?.trim() || "";
        user.reviews[existingUserReviewIndex].createdAt = new Date();
      } else {
        user.reviews.push({
          productId: new mongoose.Types.ObjectId(productId),
          rating: Number(rating),
          comment: comment?.trim() || "",
          createdAt: new Date(),
        });
      }
      await user.save();

      // 3. Recalculate real-time average rating & total reviews for the product
      const allProductReviews = await Review.find({ productId });
      const numReviews = allProductReviews.length;
      const avgRating =
        numReviews > 0
          ? Number(
              (
                allProductReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
                numReviews
              ).toFixed(1)
            )
          : Number(rating);

      await Product.findByIdAndUpdate(productId, {
        rating: avgRating,
        numReviews: numReviews,
      });

      // 4. Invalidate memory-cache so all users immediately see updated reviews & ratings
      try {
        cache.clear();
      } catch (cErr) {
        console.warn("Cache clear error:", cErr);
      }

      res.status(201).json({
        message: "Review submitted successfully",
        review: {
          id: savedReview._id?.toString(),
          productId: savedReview.productId.toString(),
          userName,
          rating: savedReview.rating,
          comment: savedReview.comment,
          createdAt: savedReview.createdAt,
        },
        productStats: {
          rating: avgRating,
          numReviews,
        },
      });
    } catch (err) {
      console.error("Error creating review:", err);
      res.status(500).json({ message: "Error saving review", error: err.message });
    }
  }
);

// GET reviews for a product
router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId || productId === "undefined" || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(200).json([]);
    }

    // 1. Fetch from Review collection
    const reviewsFromCollection = await Review.find({
      productId: new mongoose.Types.ObjectId(productId),
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    const reviewsMap = new Map();

    // Add standalone reviews
    reviewsFromCollection.forEach((r) => {
      const uName = r.userName || r.userId?.name || "Customer";
      reviewsMap.set(r._id.toString(), {
        id: r._id.toString(),
        productId: r.productId.toString(),
        userName: uName,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      });
    });

    // 2. Fetch from User subdocuments as fallback/legacy
    try {
      const usersWithReviews = await User.find({
        "reviews.productId": new mongoose.Types.ObjectId(productId),
      }).select("name reviews");

      usersWithReviews.forEach((user) => {
        if (user.reviews && Array.isArray(user.reviews)) {
          user.reviews
            .filter((r) => r.productId?.toString() === productId.toString())
            .forEach((r) => {
              const key = r._id?.toString() || `${user._id}_${productId}`;
              if (!reviewsMap.has(key)) {
                reviewsMap.set(key, {
                  id: key,
                  productId: r.productId.toString(),
                  userName: user.name || "Customer",
                  rating: r.rating,
                  comment: r.comment,
                  createdAt: r.createdAt,
                });
              }
            });
        }
      });
    } catch (uErr) {
      console.warn("User reviews fallback warning:", uErr.message);
    }

    const reviews = Array.from(reviewsMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ message: "Error fetching reviews", error: err.message });
  }
});

module.exports = router;