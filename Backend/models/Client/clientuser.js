// models/Client/clientuser.js
const mongoose = require("mongoose");

/**
 * Client User Model – Firebase Auth Only
 * - firebaseUid is the single source of truth
 * - No password, no resetCode
 * - Smart indexing, virtuals, validation
 */
const userSchema = new mongoose.Schema(
  {
    // === CORE IDENTITY ===
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },

    // === FIREBASE AUTH ===
    firebaseUid: {
      type: String,
      required: [true, "Firebase UID is required"],
      unique: true,
      index: true,
    },

    // === USER DATA ===
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", ""],
      default: "",
    },

    // === CART ===
    cart: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, "Quantity must be at least 1"],
        },
        size: {
          type: String,
          required: true,
          trim: true,
        },
        _id: false,
      },
    ],

    // === WISHLIST ===
    wishlist: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        size: {
          type: String,
          required: true,
          trim: true,
        },
        _id: false,
      },
    ],

    // === REVIEWS ===
    reviews: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product ID is required"],
          validate: {
            validator: async function (value) {
              const product = await mongoose.model("Product").findById(value);
              return !!product;
            },
            message: "Invalid product ID",
          },
        },
        rating: {
          type: Number,
          required: [true, "Rating is required"],
          min: [1, "Rating must be at least 1"],
          max: [5, "Rating must be at most 5"],
        },
        comment: {
          type: String,
          trim: true,
          maxlength: [500, "Comment cannot exceed 500 characters"],
          default: "",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        _id: false,
      },
    ],

    // === ADDRESSES ===
    addresses: [
      {
        fullName: { type: String, required: true, trim: true },
        phone: {
          type: String,
          required: true,
          match: [/^\d{10}$/, "Phone must be 10 digits"],
        },
        addressLine1: { type: String, required: true, trim: true },
        addressLine2: { type: String, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        pincode: {
          type: String,
          required: true,
          match: [/^\d{6}$/, "Pincode must be 6 digits"],
        },
        country: { type: String, default: "India" },
        isDefault: { type: Boolean, default: false },
        _id: false,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============================================================================
// INDEXES
// =============================================================================

// One review per user per product
userSchema.index(
  { "reviews.productId": 1 },
  {
    unique: true,
    partialFilterExpression: { "reviews.productId": { $exists: true } },
  }
);

// Fast lookup
userSchema.index({ firebaseUid: 1 });
userSchema.index({ email: 1 });

// =============================================================================
// MIDDLEWARE
// =============================================================================

userSchema.pre("save", function (next) {
  if (this.isModified("reviews") && this.reviews.length > 0) {
    console.log("Saving reviews for user:", {
      firebaseUid: this.firebaseUid,
      email: this.email,
      count: this.reviews.length,
    });
  }
  next();
});

userSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    if (error.message.includes("reviews")) {
      return next(new Error("You have already reviewed this product"));
    }
    if (error.message.includes("firebaseUid")) {
      return next(new Error("Firebase user already linked"));
    }
  }
  next(error);
});

// =============================================================================
// VIRTUALS
// =============================================================================

userSchema.virtual("cartCount").get(function () {
  return this.cart.reduce((sum, item) => sum + item.quantity, 0);
});

userSchema.virtual("wishlistCount").get(function () {
  return this.wishlist.length;
});

userSchema.virtual("reviewCount").get(function () {
  return this.reviews.length;
});

// =============================================================================
// EXPORT
// =============================================================================

const User = mongoose.model("ClientUser", userSchema);

module.exports = User;