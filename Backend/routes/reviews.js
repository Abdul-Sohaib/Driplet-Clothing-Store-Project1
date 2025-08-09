const express = require("express");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/Client/clientuser");
const authMiddleware = require("../middleware/clientauthmiddleware");

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
      console.log("Validation errors:", errors.array());
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

      console.log("POST /api/reviews/:productId request:", {
        productId,
        userId: userId?.toString(),
        rating,
        comment,
        user: { id: req.user?._id?.toString(), email: req.user?.email },
      });

      // Check authentication
      if (!userId) {
        console.log("Authentication failed: No user ID in req.user");
        return res.status(401).json({ message: "Unauthorized: Please log in" });
      }

      // Verify MongoDB connection
      if (mongoose.connection.readyState !== 1) {
        console.error("MongoDB not connected:", mongoose.connection.readyState);
        return res.status(500).json({ message: "Database not connected" });
      }

      // Validate productId
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        console.log("Invalid productId format:", productId);
        return res.status(400).json({ message: "Invalid product ID format" });
      }

      // Verify product exists
      const product = await Product.findById(productId);
      if (!product) {
        console.log("Product not found for ID:", productId);
        return res.status(404).json({ message: "Product not found" });
      }

      // Find user
      const user = await User.findById(userId);
      if (!user) {
        console.log("User not found for ID:", userId);
        return res.status(404).json({ message: "User not found" });
      }

      // Check for existing review
      const existingReview = user.reviews.find(
        (review) => review.productId.toString() === productId
      );
      if (existingReview) {
        console.log("Duplicate review attempt:", {
          productId,
          userId: userId.toString(),
          email: user.email,
        });
        return res.status(400).json({ message: "You have already reviewed this product" });
      }

      // Create new review
      const newReview = {
        productId: new mongoose.Types.ObjectId(productId),
        rating,
        comment: comment || "",
        createdAt: new Date(),
      };

      // Add review to user's reviews array
      user.reviews.push(newReview);

      // Save user with new review
      const updatedUser = await user.save();
      console.log("User saved with new review:", {
        userId: userId.toString(),
        email: user.email,
        reviewsCount: updatedUser.reviews.length,
      });

      // Retrieve the saved review
      const savedReview = updatedUser.reviews.find(
        (review) => review.productId.toString() === productId
      );

      if (!savedReview) {
        console.error("Failed to retrieve saved review:", {
          productId,
          userId: userId.toString(),
          email: user.email,
        });
        return res.status(500).json({ message: "Failed to retrieve saved review" });
      }

      const response = {
        message: "Review submitted successfully",
        review: {
          id: savedReview._id?.toString() || new Date().toISOString(),
          productId: savedReview.productId.toString(),
          userName: user.name || "User",
          rating: savedReview.rating,
          comment: savedReview.comment,
          createdAt: savedReview.createdAt,
        },
      };

      console.log("Sending POST response:", response);
      res.status(201).json(response);
    } catch (err) {
      console.error("Error creating review:", {
        message: err.message,
        stack: err.stack,
        productId: req.params.productId,
        userId: req.user?._id?.toString(),
        email: req.user?.email,
      });
      if (err.message === "You have already reviewed this product") {
        return res.status(400).json({ message: err.message });
      }
      if (err.name === "ValidationError") {
        return res.status(400).json({ message: "Invalid review data", errors: err.errors });
      }
      res.status(500).json({ message: "Error saving review", error: err.message });
    }
  }
);

// GET reviews for a product
router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    console.log("GET /api/reviews/:productId request:", { productId });

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.log("Invalid productId format:", productId);
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    // Verify MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error("MongoDB not connected:", mongoose.connection.readyState);
      return res.status(500).json({ message: "Database not connected" });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.log("Product not found for ID:", productId);
      return res.status(404).json({ message: "Product not found" });
    }

    // Find all users with reviews for this product
    const users = await User.find({
      "reviews.productId": productId,
    }).select("name reviews");

    const reviews = users
      .flatMap((user) =>
        user.reviews
          .filter((review) => review.productId.toString() === productId)
          .map((review) => ({
            id: review._id?.toString() || new Date().toISOString(),
            productId: review.productId.toString(),
            userName: user.name || "User",
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
          }))
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log("Sending GET reviews response:", { length: reviews.length, reviews });

    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", {
      message: err.message,
      stack: err.stack,
      productId: req.params.productId,
    });
    res.status(500).json({ message: "Error fetching reviews", error: err.message });
  }
});

module.exports = router;