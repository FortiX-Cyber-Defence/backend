const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  excerpt: {
    type: String,
    required: [true, 'Please provide an excerpt'],
    maxlength: [500, 'Excerpt cannot be more than 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide content']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category']
  },
  tags: {
    type: [String],
    default: []
  },
  featuredImage: {
    type: String
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  readTime: {
    type: Number
  }
}, {
  timestamps: true
});


// 🔥 Indexes (equivalent)
blogPostSchema.index({ title: 'text', excerpt: 'text', content: 'text' }); // FULLTEXT
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ isPublished: 1 });
blogPostSchema.index({ publishedAt: 1 });

module.exports = mongoose.model("BlogPost", blogPostSchema);