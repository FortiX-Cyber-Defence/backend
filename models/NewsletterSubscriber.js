const mongoose = require("mongoose");

const newsletterSubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide a valid email address'],
    lowercase: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed'],
    default: 'active'
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});


// 🔥 Indexes
newsletterSubscriberSchema.index({ email: 1 }, { unique: true });
newsletterSubscriberSchema.index({ status: 1 });
newsletterSubscriberSchema.index({ subscribedAt: 1 });

module.exports = mongoose.model("NewsletterSubscriber", newsletterSubscriberSchema);