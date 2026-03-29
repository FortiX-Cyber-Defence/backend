const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },

  // Request Details
  requestType: {
    type: String,
    enum: ['demo', 'quote', 'consultation', 'purchase', 'support'],
    default: 'demo',
    required: true
  },

  // Contact Information
  name: {
    type: String,
    required: true
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

  // Request Content
  subject: {
    type: String
  },
  message: {
    type: String,
    required: true
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date
  },

  // Response
  response: {
    type: String
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedAt: {
    type: Date
  },

  // Completion
  completedAt: {
    type: Date
  }

}, {
  timestamps: true
});


// 🔥 Indexes (same as Sequelize)
serviceRequestSchema.index({ userId: 1 });
serviceRequestSchema.index({ serviceId: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ requestType: 1 });
serviceRequestSchema.index({ createdAt: 1 });

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);