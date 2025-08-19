const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  userType: {
    type: String,
    enum: ["mentor", "mentee", "admin"],
    required: true
  },
  // EMAIL VERIFICATION FIELDS
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  // ACCOUNT STATUS
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.checkPassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require("crypto");
  
  this.emailVerificationToken = crypto.randomBytes(32).toString("hex");
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  return this.emailVerificationToken;
};

// Method to verify email
userSchema.methods.verifyEmail = function() {
  this.isEmailVerified = true;
  this.emailVerificationToken = null;
  this.emailVerificationExpires = null;
  return this.save();
};

module.exports = mongoose.model("User", userSchema);