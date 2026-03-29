const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a service title'],
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  category: {
    type: String,
    enum: ['core', 'cloud', 'advanced', 'governance'],
    required: [true, 'Please provide a service category']
  },
  description: {
    type: String,
    required: [true, 'Please provide a service description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  features: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  pricing: {
    type: String,
    enum: ['contact', 'tiered', 'custom'],
    default: 'contact'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});


// 🔥 Indexes (equivalent to Sequelize)
serviceSchema.index({ title: 'text', description: 'text' }); // FULLTEXT equivalent
serviceSchema.index({ category: 1 });
serviceSchema.index({ slug: 1 });

module.exports = mongoose.model("Service", serviceSchema);