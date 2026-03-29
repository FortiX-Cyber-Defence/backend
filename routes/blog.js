const express = require('express')
const {
  getBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogPostsByCategory,
  getFeaturedPosts
} = require('../controllers/blogController')
const { protect, authorize, optionalAuth } = require('../middleware/auth')
const {
  validateBlogPost,
  validateObjectId,
  validateSlug,
  validatePagination
} = require('../middleware/validation')

const router = express.Router()

router.route('/')
  .get(optionalAuth, validatePagination, getBlogPosts)
  .post(protect, authorize('admin'), validateBlogPost, createBlogPost)

router.get('/featured', getFeaturedPosts)
router.get('/category/:category', getBlogPostsByCategory)

router.route('/:slug')
  .get(optionalAuth, validateSlug, getBlogPostBySlug)

router.route('/:id')
  .put(protect, authorize('admin'), validateObjectId, validateBlogPost, updateBlogPost)
  .delete(protect, authorize('admin'), validateObjectId, deleteBlogPost)

module.exports = router