
const express = require("express");
const router = express.Router();

const rateLimit = require("express-rate-limit");

// Authentication Controllers
const {
  registerUser,
  loginUser,
  logoutUser
} = require("../controllers/authController");

const { getProfile } = require("../controllers/userController");

// Student Controllers
const {
  addStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  sendStudentEmail
} = require("../controllers/studentController");

// Middleware
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Login Rate Limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: process.env.NODE_ENV === "production" ? 5 : 20,

  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes."
  },

  standardHeaders: true,
  legacyHeaders: false
});

// =====================================
// AUTHENTICATION APIs
// =====================================

// Registration API
router.post("/register", registerUser);

// Login API
router.post("/login", loginLimiter, loginUser);

// Logout API
router.post("/logout", authMiddleware, logoutUser);

// Protected Profile API
router.get("/profile", authMiddleware, getProfile);


// =====================================
// STUDENT MANAGEMENT APIs (ADMIN ONLY)
// =====================================

// Add Student
router.post(
  "/students",
  authMiddleware,
  adminMiddleware,
  addStudent
);

// Get All Students
router.get(
  "/students",
  authMiddleware,
  adminMiddleware,
  getAllStudents
);

// Get Single Student
router.get(
  "/students/:id",
  authMiddleware,
  adminMiddleware,
  getStudentById
);

// Update Student
router.put(
  "/students/:id",
  authMiddleware,
  adminMiddleware,
  updateStudent
);

// Delete Student
router.delete(
  "/students/:id",
  authMiddleware,
  adminMiddleware,
  deleteStudent
);


// =====================================
// MANUAL SEND EMAIL API
// =====================================

router.post(
  "/students/:id/send-email",
  authMiddleware,
  adminMiddleware,
  sendStudentEmail
);


// =====================================
// EXPORT ROUTER
// =====================================

module.exports = router;
