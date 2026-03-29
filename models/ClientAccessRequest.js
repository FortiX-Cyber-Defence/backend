const mongoose = require("mongoose");

const clientAccessRequestSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Please provide company name']
  },
  contactPerson: {
    type: String,
    required: [true, 'Please provide contact person name']
  },
  email: {
    type: String,
    required: [true, 'Please provide a valid email'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number']
  },
  requirements: {
    type: String,
    required: [true, 'Please describe your requirements']
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  adminNotes: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});


// 🔥 Indexes (same as Sequelize)
clientAccessRequestSchema.index({ email: 1 });
clientAccessRequestSchema.index({ status: 1 });

module.exports = mongoose.model("ClientAccessRequest", clientAccessRequestSchema);