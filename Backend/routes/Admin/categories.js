// backend/routes/categories.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../config/cloudinary");
const Category = require("../../models/Category");
const authMiddleware = require("../../middleware/Adminauth");
const validate = require("../../middleware/Adminvalidate");
const { body } = require("express-validator");

// Updated fixedCategories to match frontend
const fixedCategories = ["Oversized T-shirt", "Topware", "Bottom Ware", "New Arrival", "Center Stage", "CLASSIC FIT T-SHIRTS"];

// Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "clothing_store/categories",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const upload = multer({ storage });

// Validation middleware
const categoryValidations = [
  body("name").notEmpty().withMessage("Name is required"),
  body("ID")
    .notEmpty()
    .withMessage("ID is required")
    .isAlphanumeric()
    .withMessage("ID must be alphanumeric"),
];

// GET all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    const mappedCategories = categories.map(cat => ({
      id: cat._id.toString(),
      name: cat.name,
      ID: cat.ID,
      parent: cat.parent,
      gender: cat.gender,
      clothingType: cat.clothingType,
      description: cat.description,
      imageUrl: cat.imageUrl,
    }));
    console.log(`Fetched ${categories.length} categories`);
    res.json(mappedCategories);
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    res.status(500).json({ message: "Server error while fetching categories" });
  }
});

// GET category by ID
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({
      id: category._id.toString(),
      name: category.name,
      ID: category.ID,
      parent: category.parent,
      gender: category.gender,
      clothingType: category.clothingType,
      description: category.description,
      imageUrl: category.imageUrl,
    });
  } catch (error) {
    console.error("Error fetching category:", error.message);
    res.status(500).json({ message: "Server error while fetching category" });
  }
});

// POST create category
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  validate(categoryValidations),
  async (req, res) => {
    try {
      const { name, ID, parent, gender, clothingType, description } = req.body;
      console.log("Received data:", { name, ID, parent, gender, clothingType, description }); // Debug log

      // Check for duplicate ID
      const existingCategory = await Category.findOne({ ID });
      if (existingCategory) {
        return res.status(400).json({ message: `Category ID "${ID}" must be unique` });
      }

      // Validate parent (must be null, empty, or one of fixed categories)
      if (parent && parent !== "" && !fixedCategories.includes(parent)) {
        return res.status(400).json({ message: `Invalid parent "${parent}". Must be one of the fixed categories or left empty` });
      }

      // If no parent, name must be one of fixed categories for top-level categories
      if (!parent && !fixedCategories.includes(name)) {
        return res.status(400).json({ message: "Top-level category name must be one of the fixed categories" });
      }

      const category = new Category({
        name,
        ID,
        parent: parent || null, // Ensure null if undefined or empty
        gender: gender || null,
        clothingType: clothingType || null,
        description: description || null,
        imageUrl: req.file?.path || null,
      });

      await category.save();
      console.log(`Category created: ${name} (ID: ${ID})`);
      res.status(201).json({
        id: category._id.toString(),
        name: category.name,
        ID: category.ID,
        parent: category.parent,
        gender: category.gender,
        clothingType: category.clothingType,
        description: category.description,
        imageUrl: category.imageUrl,
      });
    } catch (error) {
      console.error("Error creating category:", error.message);
      res.status(400).json({ message: error.message || "Error creating category" });
    }
  }
);

// PUT update category
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  validate(categoryValidations),
  async (req, res) => {
    try {
      const { name, ID, parent, gender, clothingType, description } = req.body;

      const existingCategory = await Category.findById(req.params.id);
      if (!existingCategory) {
        return res.status(404).json({ message: "Category not found" });
      }

      // Check for duplicate ID (excluding current category)
      const duplicateCategory = await Category.findOne({ ID, _id: { $ne: req.params.id } });
      if (duplicateCategory) {
        return res.status(400).json({ message: `Category ID "${ID}" must be unique` });
      }

      // Validate parent (must be null, empty, or one of fixed categories)
      if (parent && parent !== "" && !fixedCategories.includes(parent)) {
        return res.status(400).json({ message: `Invalid parent "${parent}". Must be one of the fixed categories or left empty` });
      }

      // If updating to top-level, name must be one of fixed categories
      if (!parent && !fixedCategories.includes(name) && existingCategory.parent) {
        return res.status(400).json({ message: "Top-level category name must be one of the fixed categories" });
      }

      // Delete old image if new image is uploaded
      if (existingCategory.imageUrl && req.file) {
        const publicId = existingCategory.imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`clothing_store/categories/${publicId}`);
      }

      const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
          name,
          ID,
          parent: parent || null,
          gender: gender || null,
          clothingType: clothingType || null,
          description: description || null,
          imageUrl: req.file?.path || existingCategory.imageUrl,
        },
        { new: true }
      );

      console.log(`Category updated: ${name} (ID: ${ID})`);
      res.json({
        id: category._id.toString(),
        name: category.name,
        ID: category.ID,
        parent: category.parent,
        gender: category.gender,
        clothingType: category.clothingType,
        description: category.description,
        imageUrl: category.imageUrl,
      });
    } catch (error) {
      console.error("Error updating category:", error.message);
      res.status(400).json({ message: error.message || "Error updating category" });
    }
  }
);

// DELETE category
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Delete image from Cloudinary
    if (category.imageUrl) {
      const publicId = category.imageUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`clothing_store/categories/${publicId}`);
    }

    console.log(`Category deleted: ${category.name} (ID: ${category.ID})`);
    res.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error.message);
    res.status(500).json({ message: "Server error while deleting category" });
  }
});

module.exports = router;