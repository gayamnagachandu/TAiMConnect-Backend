const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Allowed Frontend URLs
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  }
}));

app.use(helmet());
app.use(express.json());

// Database Connection
connectDB();

// API Routes
app.use("/api/auth", authRoutes);

// Home Route
app.get("/", (req, res) => {
  res.send("Registration API is Running");
});

// Global Error Handling
app.use((error, req, res, next) => {
  console.error("Server Error:", error);

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Invalid JSON format"
    });
  }

  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      message: "CORS policy: Origin not allowed"
    });
  }

  return res.status(500).json({
    message: "Internal server error"
  });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});