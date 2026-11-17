
const adminMiddleware = (req, res, next) => {
  try {
    // Check user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login."
      });
    }

    // Check admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only."
      });
    }

    // Allow admin access
    next();

  } catch (error) {
    console.error("Admin Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};

module.exports = adminMiddleware;
