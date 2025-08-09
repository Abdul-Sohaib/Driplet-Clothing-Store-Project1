const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../config/cloudinary");
const Product = require("../../models/Product");
const Category = require("../../models/Category");
const authMiddleware = require("../../middleware/Adminauth");
const validate = require("../../middleware/Adminvalidate");
const { body, validationResult } = require("express-validator");

// Initialize router
const router = express.Router();

// Setup Multer + Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "clothing_store/products",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "avif"],
  },
});
const upload = multer({ storage });

// Custom middleware to handle dynamic fields
const dynamicUpload = upload.fields(
  Array.from({ length: 10 }, (_, i) => ({ name: `variants[${i}][images]`, maxCount: 10 }))
);

// Validation middleware
const productValidations = [
  body("name").notEmpty().trim().withMessage("Name is required"),
  body("price").isFloat({ min: 0 }).withMessage("Invalid price"),
  body("category")
    .notEmpty()
    .trim()
    .withMessage("Category is required")
    .custom(async (value) => {
      const category = await Category.findOne({ ID: value });
      if (!category) throw new Error(`Category ID ${value} does not exist`);
      return true;
    }),
  body("fitType")
    .notEmpty()
    .trim()
    .isIn(["Oversized", "Regular", "Slim"])
    .withMessage("Invalid fit type"),
  body("neckType")
    .notEmpty()
    .trim()
    .isIn(["Round Neck", "V-Neck", "Collar"])
    .withMessage("Invalid neck type"),
  body("pattern")
    .notEmpty()
    .trim()
    .isIn(["Graphic Print", "Solid", "Striped"])
    .withMessage("Invalid pattern"),
  body("variants")
    .notEmpty()
    .withMessage("Variants are required")
    .custom((value) => {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error("Variants must be a non-empty array");
        }
        parsed.forEach((v, i) => {
          if (!v.sizes || !Array.isArray(v.sizes) || v.sizes.length === 0) {
            throw new Error(`Variant ${i + 1} must have at least one size`);
          }
          if (!v.price || isNaN(Number(v.price)) || Number(v.price) < 0) {
            throw new Error(`Variant ${i + 1} has an invalid price`);
          }
          v.sizes.forEach((s, j) => {
            if (!s.size || isNaN(Number(s.stock)) || Number(s.stock) < 0) {
              throw new Error(`Size ${j + 1} in variant ${i + 1} is invalid`);
            }
          });
        });
        return true;
      } catch (e) {
        throw new Error(`Invalid variants format: ${e.message}`);
      }
    }),
];

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    const mapped = products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      price: p.price,
      description: p.description,
      category: p.category,
      fitType: p.fitType,
      neckType: p.neckType,
      pattern: p.pattern,
      variants: p.variants,
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: "Server error while fetching products", error: err.message });
  }
});

// POST new product
router.post(
  "/",
  authMiddleware,
  dynamicUpload,
  validate(productValidations),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, price, description, category, fitType, neckType, pattern, variants } = req.body;
      console.log("Received body:", req.body);
      console.log("Received files:", req.files);

      const parsedVariants = JSON.parse(variants);
      const variantImages = req.files || {};

      const variantsWithImages = parsedVariants.map((variant, index) => {
        const fieldName = `variants[${index}][images]`;
        const variantFiles = variantImages[fieldName] || [];
        return {
          ...variant,
          price: Number(variant.price),
          imageUrls: variantFiles.map((file) => file.path),
        };
      });

      const product = new Product({
        name: name.trim(),
        price: Number(price),
        description: description?.trim() || "",
        category: category.trim(),
        fitType: fitType.trim(),
        neckType: neckType.trim(),
        pattern: pattern.trim(),
        variants: variantsWithImages,
      });

      const saved = await product.save();
      res.status(201).json({
        id: saved._id.toString(),
        name: saved.name,
        price: saved.price,
        description: saved.description,
        category: saved.category,
        fitType: saved.fitType,
        neckType: saved.neckType,
        pattern: saved.pattern,
        variants: saved.variants,
      });
    } catch (err) {
      console.error("Error creating product:", err);
      res.status(500).json({ message: "Error saving product", error: err.message });
    }
  }
);

// PUT update product
router.put(
  "/:id",
  authMiddleware,
  dynamicUpload,
  validate(productValidations),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { name, price, description, category, fitType, neckType, pattern, variants } = req.body;
      console.log("Received body:", req.body);
      console.log("Received files:", req.files);

      const parsedVariants = JSON.parse(variants);
      const variantImages = req.files || {};

      const variantsWithImages = parsedVariants.map((variant, index) => {
        const fieldName = `variants[${index}][images]`;
        const variantFiles = variantImages[fieldName] || [];
        const existingImages = Array.isArray(variant.imageUrls) ? variant.imageUrls : [];
        return {
          ...variant,
          price: Number(variant.price),
          imageUrls: [...existingImages, ...variantFiles.map((file) => file.path)],
        };
      });

      const updated = await Product.findByIdAndUpdate(
        id,
        {
          name: name.trim(),
          price: Number(price),
          description: description?.trim() || "",
          category: category.trim(),
          fitType: fitType.trim(),
          neckType: neckType.trim(),
          pattern: pattern.trim(),
          variants: variantsWithImages,
        },
        { new: true }
      );

      if (!updated) return res.status(404).json({ message: "Product not found" });

      res.json({
        id: updated._id.toString(),
        name: updated.name,
        price: updated.price,
        description: updated.description,
        category: updated.category,
        fitType: updated.fitType,
        neckType: updated.neckType,
        pattern: updated.pattern,
        variants: updated.variants,
      });
    } catch (err) {
      console.error("Error updating product:", err);
      res.status(500).json({ message: "Error updating product", error: err.message });
    }
  }
);

// DELETE product
router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });

      for (const variant of product.variants) {
        if (Array.isArray(variant.imageUrls)) {
          for (const imageUrl of variant.imageUrls) {
            const publicId = imageUrl.split("/").pop()?.split(".")[0];
            if (publicId) {
              await cloudinary.uploader.destroy(`clothing_store/products/${publicId}`);
            }
          }
        }
      }

      res.json({ message: "Product deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error while deleting product", error: err.message });
    }
  }
);

module.exports = router;