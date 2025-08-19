const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const User = require("../models/User");
const Mentor = require("../models/Mentor");
const Mentee = require("../models/Mentee");
const Admin = require("../models/Admin");
const uploadPhoto = require("../middleware/upload");
const { sendVerificationEmail, sendWelcomeEmail } = require("../services/emailService");

// Validation rules for mentee registration
const menteeValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("firstName").notEmpty().trim().withMessage("First name is required"),
  body("lastName").notEmpty().trim().withMessage("Last name is required"),
  body("phoneNumber").notEmpty().trim().withMessage("Phone number is required"),
  body("generalDescription").optional().isLength({ max: 500 }).withMessage("General description must be under 500 characters")
];

// Validation for mentor registration
const mentorValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("firstName").notEmpty().trim().withMessage("First name is required"),
  body("lastName").notEmpty().trim().withMessage("Last name is required"),
  body("programmingLanguages").notEmpty().withMessage("Programming languages are required"),
  body("technologies").notEmpty().withMessage("Technologies are required"),
  body("domains").notEmpty().withMessage("Domains are required"),
  body("yearsOfExperience").isInt({ min: 0 }).withMessage("Years of experience must be a positive number"),
  body("generalDescription").notEmpty().isLength({ max: 1000 }).withMessage("General description is required"),
  body("phoneNumber").notEmpty().trim().withMessage("Phone number is required"),
  body("linkedinUrl").optional().isURL().withMessage("LinkedIn URL must be valid")
];

// Login validation
const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required")
];

// POST /api/auth/register-mentor - WITH EMAIL VERIFICATION
router.post("/register-mentor", 
  uploadPhoto,        
  mentorValidation,   
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ 
          error: "Profile photo is required",
          message: "Please upload a profile photo" 
        });
      }

      let { programmingLanguages, technologies, domains } = req.body;
      
      if (typeof programmingLanguages === 'string') {
        programmingLanguages = programmingLanguages.split(',').map(lang => lang.trim());
      }
      if (typeof technologies === 'string') {
        technologies = technologies.split(',').map(tech => tech.trim());
      }
      if (typeof domains === 'string') {
        domains = domains.split(',').map(domain => domain.trim());
      }

      const {
        email, password, firstName, lastName, yearsOfExperience,
        generalDescription, phoneNumber, linkedinUrl
      } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // CREATE USER WITH EMAIL VERIFICATION
      const user = new User({
        email,
        password,
        userType: "mentor",
        isEmailVerified: false // Start as unverified
      });

      // Generate verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      // CREATE MENTOR PROFILE
      const mentor = new Mentor({
        userId: user._id,
        firstName,
        lastName,
        programmingLanguages,
        technologies,
        domains,
        yearsOfExperience: parseInt(yearsOfExperience),
        generalDescription,
        email,
        phoneNumber,
        linkedinUrl,
        profilePhoto: {
          data: req.file.buffer,
          contentType: req.file.mimetype
        },
        photoFileName: req.file.originalname
      });

      await mentor.save();

      // SEND VERIFICATION EMAIL
      const emailResult = await sendVerificationEmail(email, firstName, verificationToken);
      
      if (!emailResult.success) {
        console.error("Failed to send verification email:", emailResult.error);
        // Don't fail registration if email fails - just log it
      }

      // SET SESSION WITH USER INFO
      req.session.userId = user._id;
      req.session.userType = user.userType;
      req.session.userEmail = user.email;
      req.session.userFirstName = mentor.firstName || null;
      req.session.userLastName = mentor.lastName || null;

      res.status(201).json({
        message: "Mentor registered successfully! Please check your email to verify your account.",
        user: {
          id: user._id,
          email: user.email,
          userType: user.userType,
          isEmailVerified: user.isEmailVerified,
          firstName: mentor.firstName,
          lastName: mentor.lastName
        },
        mentor: {
          id: mentor._id,
          firstName: mentor.firstName,
          lastName: mentor.lastName,
          hasProfilePhoto: true
        },
        emailSent: emailResult.success,
        nextStep: "Please check your email and click the verification link to activate your account."
      });

    } catch (error) {
      console.error("Mentor registration error:", error);
      
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: "File too large. Maximum size is 5MB." });
        }
        return res.status(400).json({ error: "File upload error: " + error.message });
      }
      
      res.status(500).json({ error: "Server error during registration" });
    }
  }
);

// POST /api/auth/register-mentee - WITH EMAIL VERIFICATION
router.post("/register-mentee", menteeValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email, password,
      firstName, lastName, phoneNumber, generalDescription = ""
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // CREATE USER WITH EMAIL VERIFICATION
    const user = new User({
      email,
      password,
      userType: "mentee",
      isEmailVerified: false // Start as unverified
    });

    // Generate verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // CREATE MENTEE PROFILE
    const mentee = new Mentee({
      userId: user._id,
      firstName, lastName, email, phoneNumber, generalDescription
    });
    await mentee.save();

    // SEND VERIFICATION EMAIL
    const emailResult = await sendVerificationEmail(email, firstName, verificationToken);
    
    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
    }

    // SET SESSION WITH USER INFO
    req.session.userId = user._id;
    req.session.userType = user.userType;
    req.session.userEmail = user.email;
    req.session.userFirstName = mentee.firstName || null;
    req.session.userLastName = mentee.lastName || null;

    res.status(201).json({
      message: "Mentee registered successfully! Please check your email to verify your account.",
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified,
        firstName: mentee.firstName,
        lastName: mentee.lastName
      },
      mentee: {
        id: mentee._id,
        firstName: mentee.firstName,
        lastName: mentee.lastName
      },
      emailSent: emailResult.success,
      nextStep: "Please check your email and click the verification link to activate your account."
    });

  } catch (error) {
    console.error("Mentee registration error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// POST /api/auth/verify-email - NEW ENDPOINT
router.post("/verify-email", [
  body("token").notEmpty().withMessage("Verification token is required")
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.body;

    // Find user with this verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }, // Token not expired
      isEmailVerified: false // Not already verified
    });

    if (!user) {
      return res.status(400).json({ 
        error: "Invalid or expired verification token",
        message: "The verification link is invalid or has expired. Please request a new one."
      });
    }

    // Verify the email
    await user.verifyEmail();

    // Get profile information
    let profile = null;
    if (user.userType === "mentor") {
      profile = await Mentor.findOne({ userId: user._id }).select("-userId -__v -profilePhoto");
    } else if (user.userType === "mentee") {
      profile = await Mentee.findOne({ userId: user._id }).select("-userId -__v");
    }

    // Log them in automatically after verification
    req.session.userId = user._id;
    req.session.userType = user.userType;
    req.session.userEmail = user.email;
    if (profile) {
      req.session.userFirstName = profile.firstName || null;
      req.session.userLastName = profile.lastName || null;
    }

    // Save session before sending welcome email
    req.session.save((sessionErr) => {
      if (sessionErr) {
        console.error('Session save error:', sessionErr);
        return res.status(500).json({ error: "Session error after verification" });
      }

      // Send welcome email (don't wait for it)
      if (profile) {
        sendWelcomeEmail(user.email, profile.firstName, user.userType).catch(err => {
          console.error('Welcome email error:', err);
        });
      }

      res.json({
        message: "Email verified successfully! Welcome to QueenB!",
        user: {
          id: user._id,
          email: user.email,
          userType: user.userType,
          isEmailVerified: true,
          firstName: profile?.firstName || null,
          lastName: profile?.lastName || null
        },
        profile,
        autoLoggedIn: true
      });
    });

  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ error: "Server error during email verification" });
  }
});

// POST /api/auth/resend-verification - NEW ENDPOINT
router.post("/resend-verification", [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required")
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ 
      email, 
      isEmailVerified: false 
    });

    if (!user) {
      return res.status(400).json({ 
        error: "Email not found or already verified",
        message: "This email is either not registered or already verified."
      });
    }

    // Get user's first name from profile
    let firstName = "User";
    if (user.userType === "mentor") {
      const mentor = await Mentor.findOne({ userId: user._id });
      firstName = mentor?.firstName || firstName;
    } else if (user.userType === "mentee") {
      const mentee = await Mentee.findOne({ userId: user._id });
      firstName = mentee?.firstName || firstName;
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send new verification email
    const emailResult = await sendVerificationEmail(email, firstName, verificationToken);

    res.json({
      message: "Verification email sent! Please check your inbox.",
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ error: "Server error sending verification email" });
  }
});

// POST /api/auth/login - UPDATED WITH EMAIL VERIFICATION CHECK
router.post("/login", loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // CHECK EMAIL VERIFICATION
    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        error: "Email not verified",
        message: "Please verify your email before logging in. Check your inbox for the verification link.",
        needsVerification: true,
        email: user.email
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    req.session.userId = user._id;
    req.session.userType = user.userType;
    req.session.userEmail = user.email;

    let profile = null;
    if (user.userType === "mentor") {
      profile = await Mentor.findOne({ userId: user._id }).select("-userId -__v -profilePhoto");
      if (profile) {
        req.session.userFirstName = profile.firstName || null;
        req.session.userLastName  = profile.lastName || null;
      }
    } else if (user.userType === "mentee") {
      profile = await Mentee.findOne({ userId: user._id }).select("-userId -__v");
      if (profile) {
        req.session.userFirstName = profile.firstName || null;
        req.session.userLastName  = profile.lastName || null;
      }
    } else if (user.userType === "admin") {
      profile = await Admin.findOne({ userId: user._id }).select("-userId -__v");
      if (profile) {
        profile.lastLogin = new Date();
        await profile.save();
        req.session.userFirstName = profile.firstName || null;
        req.session.userLastName  = profile.lastName || null;
      }
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified,
        firstName: req.session.userFirstName || null,
        lastName:  req.session.userLastName  || null
      },
      profile
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

// POST /api/auth/logout - Unchanged
router.post("/logout", (req, res) => {
  if (!req.session.userId) {
    return res.status(400).json({ error: "Not logged in" });
  }

  const userEmail = req.session.userEmail;
  
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Could not log out" });
    }
    res.json({ 
      message: "Logged out successfully",
      user: userEmail
    });
  });
});

// GET /api/auth/me - UPDATED WITH EMAIL VERIFICATION STATUS
router.get("/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      error: "Not logged in",
      authenticated: false
    });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.status(401).json({ 
        error: "Invalid session",
        authenticated: false
      });
    }

    let profile = null;
    if (user.userType === "mentor") {
      profile = await Mentor.findOne({ userId: user._id }).select("-userId -__v -profilePhoto");
    } else if (user.userType === "mentee") {
      profile = await Mentee.findOne({ userId: user._id }).select("-userId -__v");
    } else if (user.userType === "admin") {
      profile = await Admin.findOne({ userId: user._id }).select("-userId -__v");
    }

    // Prefer names from session; if missing, try profile
    const firstName = req.session.userFirstName || profile?.firstName || null;
    const lastName  = req.session.userLastName  || profile?.lastName  || null;

    res.json({
      authenticated: true,
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        firstName,
        lastName
      },
      profile,
      session: {
        active: true,
        userType: req.session.userType
      }
    });
  } catch (error) {
    console.error("Session check error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;