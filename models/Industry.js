const mongoose = require("mongoose");

const industrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide an industry name'],
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  challenges: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  solutions: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  icon: {
    type: String
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


// 🔥 Indexes
industrySchema.index({ slug: 1 });
industrySchema.index({ name: 1 });

module.exports = mongoose.model("Industry", industrySchema);