const mongoose = require("mongoose");

const chatLeadSchema = new mongoose.Schema({
  userType: {
    type: String,
    enum: ['client', 'applicant', 'visitor'],
    default: 'visitor',
    required: true
  },
  name: {
    type: String
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^\S+@\S+\.\S+$/.test(v);
      },
      message: 'Please provide a valid email'
    }
  },
  phone: {
    type: String
  },
  requirement: {
    type: String
  },

  // For applicants
  jobRole: {
    type: String
  },

  // Conversation history
  conversation: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },

  status: {
    type: String,
    enum: ['new', 'contacted', 'converted', 'closed'],
    default: 'new'
  },
  source: {
    type: String,
    default: 'chatbot'
  }

}, {
  timestamps: true
});


// 🔥 Indexes
chatLeadSchema.index({ email: 1 });
chatLeadSchema.index({ userType: 1 });
chatLeadSchema.index({ status: 1 });
chatLeadSchema.index({ createdAt: 1 });

module.exports = mongoose.model("ChatLead", chatLeadSchema);