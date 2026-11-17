
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const blacklistedTokens = require("../middleware/tokenBlacklist");

// Email Validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


// =====================================
// REGISTER API
// =====================================

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const cleanName =
      typeof name === "string" ? name.trim() : "";

    const cleanEmail =
      typeof email === "string"
        ? email.trim().toLowerCase()
        : "";

    // Required Fields Validation
    if (
      !cleanName ||
      !cleanEmail ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Name Validation
    if (cleanName.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Name must contain at least 3 characters"
      });
    }

    // Email Validation
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email"
      });
    }

    // Password Validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters"
      });
    }

    // Check Existing User
    const existingUser = await User.findOne({
      email: cleanEmail
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const newUser = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error("Registration Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// =====================================
// LOGIN API
// =====================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanEmail =
      typeof email === "string"
        ? email.trim().toLowerCase()
        : "";

    // Required Fields Validation
    if (!cleanEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Email Validation
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email"
      });
    }

    // Password Validation
    if (typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid password format"
      });
    }

    // Find User
    const user = await User.findOne({
      email: cleanEmail
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check JWT Secret
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    // Get User Role
    const userRole = user.role || "student";

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: userRole
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    // Login Success Response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: userRole
      }
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// =====================================
// LOGOUT API
// =====================================

const logoutUser = (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided"
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format"
      });
    }

    // Add Token to Blacklist
    blacklistedTokens.add(token);

    return res.status(200).json({
      success: true,
      message: "Logout successful"
    });

  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// =====================================
// EXPORT FUNCTIONS
// =====================================

module.exports = {
  registerUser,
  loginUser,
  logoutUser
};
