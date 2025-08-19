const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const session = require("express-session");
require("dotenv").config();

// Import database connection
const connectDB = require("./config/database");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true // Important for sessions to work!
}));
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "queenb-super-secret-session-key",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: false, // HTTPS only in production
    sameSite: 'lax'
  }
}));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/mentors", require("./routes/mentors"));
app.use("/api/admin", require("./routes/admin"))
// Health check endpoint with session info
app.get("/api/health", (req, res) => {
  res.json({
    message: "QueenB Server is running!",
    timestamp: new Date().toISOString(),
    status: "healthy",
    environment: process.env.NODE_ENV || "development",
    session: {
      active: !!req.session.userId,
      userType: req.session.userType || null,
      userEmail: req.session.userEmail || null
    }
  });
});

// Root endpoint with session info
app.get("/", (req, res) => {
  res.json({ 
    message: "Welcome to QueenB API - Mentorship Matching Platform",
    version: "1.0.0",
    session: {
      active: !!req.session.userId,
      userType: req.session.userType || null
    },
    endpoints: {
      "Register Mentor": "POST /api/auth/register-mentor",
      "Register Mentee": "POST /api/auth/register-mentee", 
      "Login": "POST /api/auth/login",
      "Logout": "POST /api/auth/logout",
      "Check Session": "GET /api/auth/me",
      "View Mentors": "GET /api/mentors",
      "Search Mentors": "GET /api/mentors/search?q=...",
      "Health Check": "GET /api/health"
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  
  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: "Validation Error", details: errors });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ error: `${field} already exists` });
  }
  
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 QueenB Server is running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🍪 Sessions enabled - Max age: 24 hours`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
});