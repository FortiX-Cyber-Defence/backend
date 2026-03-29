const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
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
  company: {
    type: String
  },
  phone: {
    type: String
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject']
  },
  message: {
    type: String,
    required: [true, 'Please provide a message']
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'closed'],
    default: 'new'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  response: {
    type: String
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true
});


// 🔥 Indexes (same as Sequelize)
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: 1 });

module.exports = mongoose.model("Contact", contactSchema);