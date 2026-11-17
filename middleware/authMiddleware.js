
const jwt = require("jsonwebtoken");
const blacklistedTokens = require("./tokenBlacklist");

const authMiddleware = (req, res, next) => {
  try {
    // Check JWT Secret
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");

      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }

    // Get Authorization Header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided"
      });
    }

    // Extract Token
    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format"
      });
    }

    // Check Blacklisted Token
    if (blacklistedTokens.has(token)) {
      return res.status(401).json({
        success: false,
        message: "You are logged out. Please login again"
      });
    }

    // Verify JWT Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate Token Payload
    if (
      !decoded.id ||
      !["admin", "student"].includes(decoded.role)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload. Please login again."
      });
    }

    // Store Authenticated User Information
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

module.exports = authMiddleware;
