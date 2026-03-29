const mongoose = require("mongoose");

const demoRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name']
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
  about: {
    type: String,
    required: [true, 'Please describe your service requirement']
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  contactedAt: {
    type: Date
  },
  contactedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});


// 🔥 Indexes (same as Sequelize indexes)
demoRequestSchema.index({ email: 1 });
demoRequestSchema.index({ status: 1 });
demoRequestSchema.index({ email: 1, status: 1 });
demoRequestSchema.index({ createdAt: 1 });

module.exports = mongoose.model("DemoRequest", demoRequestSchema);