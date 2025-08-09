const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema({
  size: { type: String, required: true, trim: true },
  stock: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: "Stock must be an integer",
    },
  },
});

const variantSchema = new mongoose.Schema({
  imageUrls: {
    type: [String],
    default: [],
    validate: {
      validator: (arr) => Array.isArray(arr),
      message: "Image URLs must be an array",
    },
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: (v) => !isNaN(v),
      message: "Price must be a valid number",
    },
  },
  sizes: {
    type: [sizeSchema],
    required: true,
    validate: {
      validator: (arr) => arr.length > 0,
      message: "At least one size is required",
    },
  },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, trim: true, default: "" },
  category: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: async (value) => {
        const Category = mongoose.model("Category");
        const category = await Category.findOne({ ID: value });
        return !!category;
      },
      message: (props) => `Category ID ${props.value} does not exist`,
    },
  },
  fitType: {
    type: String,
    required: true,
    enum: ["Oversized", "Regular", "Slim"],
    default: "Oversized",
  },
  neckType: {
    type: String,
    required: true,
    enum: ["Round Neck", "V-Neck", "Collar"],
    default: "Round Neck",
  },
  pattern: {
    type: String,
    required: true,
    enum: ["Graphic Print", "Solid", "Striped"],
    default: "Graphic Print",
  },
  variants: {
    type: [variantSchema],
    required: true,
    validate: {
      validator: (arr) => arr.length > 0,
      message: "At least one variant is required",
    },
  },
});

productSchema.pre("save", function (next) {
  console.log("Saving product:", {
    name: this.name,
    price: this.price,
    category: this.category,
    fitType: this.fitType,
    neckType: this.neckType,
    pattern: this.pattern,
    variants: this.variants.map(v => ({
      price: v.price,
      sizes: v.sizes.map(s => ({ size: s.size, stock: s.stock })),
    })),
  });
  next();
});

productSchema.post("save", function (error, doc, next) {
  if (error) {
    console.error("Error saving product:", {
      message: error.message,
      name: doc?.name,
      stack: error.stack,
    });
    next(error);
  } else {
    console.log("Product saved:", doc.name);
    next();
  }
});

module.exports = mongoose.model("Product", productSchema);