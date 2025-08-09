const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
      size: { type: String, required: true },
    },
  ],
   
  wishlist: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      size: { type: String, required: true },
    },
  ],
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
    },
  ],
  resetCode: {
    type: String,
  },

  addresses: [{
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: "India" }
}],
});

// Ensure unique reviews per user and product
userSchema.index({ "reviews.productId": 1 }, { unique: true });

// Pre-save hook for debugging reviews
userSchema.pre("save", function (next) {
  if (this.isModified("reviews")) {
    console.log("Saving user with reviews:", {
      userId: this._id,
      email: this.email,
      reviews: this.reviews.map((r) => ({
        productId: r.productId.toString(),
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
    });
  }
  next();
});

// Post-save error hook for reviews
userSchema.post("save", function (error, doc, next) {
  if (error && error.name === "MongoServerError" && error.code === 11000) {
    console.error("Duplicate review error:", {
      message: error.message,
      userId: doc._id,
      email: doc.email,
      productId: error.keyValue?.["reviews.productId"],
    });
    next(new Error("You have already reviewed this product"));
  } else if (error) {
    console.error("Error saving user with reviews:", {
      message: error.message,
      userId: doc._id,
      email: doc.email,
      stack: error.stack,
    });
    next(error);
  } else {
    if (doc.isModified("reviews")) {
      console.log("User reviews saved successfully:", {
        userId: doc._id,
        email: doc.email,
        reviews: doc.reviews.map((r) => ({
          productId: r.productId.toString(),
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
        })),
      });
    }
    next();
  }
});

// Debug hook for find queries involving reviews
userSchema.post("find", function (docs) {
  if (docs && docs.length) {
    console.log("Fetched users with reviews:", {
      userIds: docs.map((doc) => ({ id: doc._id, email: doc.email })),
      reviews: docs.flatMap((doc) =>
        doc.reviews.map((r) => ({
          productId: r.productId.toString(),
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
        }))
      ),
    });
  } else {
    console.log("No users found with reviews for query");
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    console.log("Comparing password for user:", this.email);
    const isMatch = enteredPassword === this.password;
    console.log("Password match result:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("Password comparison error:", error);
    throw error;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;