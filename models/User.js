
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // User Name
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must contain at least 3 characters"]
    },

    // User Email
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email"
      ]
    },

    // User Password
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must contain at least 6 characters"],
      select: false
    },

    // User Role
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
