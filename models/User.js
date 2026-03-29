const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide a valid email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return /^[\d\s\-\+\(\)]+$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  password: {
    type: String,
    required: [true, 'Password must be at least 6 characters'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'client', 'employee', 'admin', 'hr'],
    default: 'user'
  },

  // Client-specific fields
  clientStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,

  // Employee-specific fields
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  department: {
    type: String,
    enum: ['technical', 'security', 'operations', 'hr', 'admin']
  },
  companyEmail: {
    type: String,
    lowercase: true
  },

  // Company
  company: String,
  companyDomain: {
    type: String,
    lowercase: true
  },

  // Security
  is2FAEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,

  // Email Verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,

  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  },

  // Audit
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date

}, { timestamps: true });


// 🔥 Hooks (same logic)
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return ;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});


// 🔥 Methods (UNCHANGED LOGIC)

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return await this.save();
};

userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = null;
    return await this.save();
  }

  this.loginAttempts += 1;

  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000;

  if (this.loginAttempts >= maxAttempts && !this.isLocked()) {
    this.lockUntil = new Date(Date.now() + lockTime);
  }

  return await this.save();
};

userSchema.methods.resetLoginAttempts = async function() {
  this.loginAttempts = 0;
  this.lockUntil = null;
  return await this.save();
};

userSchema.methods.hasRole = function(roles) {
  if (Array.isArray(roles)) {
    return roles.includes(this.role);
  }
  return this.role === roles;
};

userSchema.methods.isApprovedClient = function() {
  return this.role === 'client' && this.clientStatus === 'approved';
};

userSchema.methods.isValidEmployeeEmail = function() {
  if (this.role === 'employee' || this.role === 'hr') {
    return this.companyEmail && this.companyDomain &&
           this.companyEmail.endsWith(`@${this.companyDomain}`);
  }
  return true;
};

module.exports = mongoose.model("User", userSchema);