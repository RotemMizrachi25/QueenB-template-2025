// server/middleware/auth.js
const Admin = require("../models/Admin");

const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      error: "Authentication required", 
      message: "Please login to access this resource",
      authenticated: false
    });
  }
  next();
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ 
        error: "Authentication required",
        authenticated: false
      });
    }
    
    if (req.session.userType !== role) {
      return res.status(403).json({ 
        error: "Access denied", 
        message: `${role} role required. You are: ${req.session.userType}`,
        requiredRole: role,
        currentRole: req.session.userType
      });
    }
    
    next();
  };
};

// Middleware פשוט לבדיקת אדמין
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ 
        error: "Authentication required",
        authenticated: false
      });
    }
    
    if (req.session.userType !== 'admin') {
      return res.status(403).json({
        error: "Admin access required",
        message: "This resource is restricted to administrators"
      });
    }

    // בדיקה שהאדמין קיים ופעיל
    const admin = await Admin.findOne({ userId: req.session.userId });
    
    if (!admin) {
      return res.status(403).json({
        error: "Admin profile not found"
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        error: "Admin account disabled"
      });
    }

    // עדכון מועד התחברות אחרון
    admin.lastLogin = new Date();
    await admin.save();

    req.adminProfile = admin;
    
    next();
    
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ error: "Error checking admin status" });
  }
};

// Optional: middleware to check if user is logged in (doesn't block, just adds info)
const checkAuth = (req, res, next) => {
  req.isAuthenticated = !!req.session.userId;
  req.currentUser = req.session.userId ? {
    id: req.session.userId,
    type: req.session.userType,
    email: req.session.userEmail
  } : null;
  next();
};

module.exports = { 
  requireAuth, 
  requireRole, 
  requireAdmin,
  checkAuth 
};