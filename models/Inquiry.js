const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({

  // --- Origin type ---
  type: {
    type: String,
    enum: ['contact', 'demo_request', 'client_access', 'service_request'],
    required: true
  },

  // --- Common contact fields ---
  name: {
    type: String,
    required: [true, 'Please provide a name']
  },
  email: {
    type: String,
    required: [true, 'Please provide a valid email'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String
  },
  company: {
    type: String
  },
  jobTitle: {
    type: String
  },

  // --- Message / requirement ---
  subject: {
    type: String
  },
  message: {
    type: String
  },

  // --- Status ---
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled', 'approved', 'rejected'],
    default: 'pending'
  },

  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // --- Admin handling ---
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date
  },
  response: {
    type: String
  },
  adminNotes: {
    type: String
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },

  // --- Optional links ---
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  requestType: {
    type: String
  }

}, {
  timestamps: true
});


// 🔥 Indexes (same as Sequelize)
inquirySchema.index({ email: 1 });
inquirySchema.index({ type: 1 });
inquirySchema.index({ status: 1 });
inquirySchema.index({ userId: 1 });
inquirySchema.index({ createdAt: 1 });

module.exports = mongoose.model("Inquiry", inquirySchema);