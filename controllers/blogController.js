const { BlogPost, User } = require('../models')

// @desc    Get all blog posts
const getBlogPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    let filter = {}

    // Admin vs public
    if (req.user && req.user.role === 'admin') {
      if (req.query.published !== undefined) {
        filter.isPublished = req.query.published === 'true'
      }
    } else {
      filter.isPublished = true
    }

    if (req.query.category) {
      filter.category = req.query.category
    }

    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { excerpt: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } }
      ]
    }

    const total = await BlogPost.countDocuments(filter)

    const posts = await BlogPost.find(filter)
      .populate('author', 'name')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      posts
    })
  } catch (error) {
    next(error)
  }
}

// @desc Get single blog post by slug
const getBlogPostBySlug = async (req, res, next) => {
  try {
    let filter = { slug: req.params.slug }

    if (!req.user || req.user.role !== 'admin') {
      filter.isPublished = true
    }

    const post = await BlogPost.findOne(filter).populate('author', 'name')

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      })
    }

    // Increment views
    post.views += 1
    await post.save()

    res.status(200).json({
      success: true,
      post
    })
  } catch (error) {
    next(error)
  }
}

// @desc Create blog post
const createBlogPost = async (req, res, next) => {
  try {
    const existingPost = await BlogPost.findOne({ slug: req.body.slug })
    if (existingPost) {
      return res.status(400).json({
        success: false,
        message: 'Blog post with this slug already exists'
      })
    }

    req.body.author = req.user.id

    const post = new BlogPost(req.body)
    await post.save()

    const populatedPost = await BlogPost.findById(post._id).populate('author', 'name')

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      post: populatedPost
    })
  } catch (error) {
    next(error)
  }
}

// @desc Update blog post
const updateBlogPost = async (req, res, next) => {
  try {
    let post = await BlogPost.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      })
    }

    if (req.body.slug && req.body.slug !== post.slug) {
      const existingPost = await BlogPost.findOne({ slug: req.body.slug })
      if (existingPost) {
        return res.status(400).json({
          success: false,
          message: 'Blog post with this slug already exists'
        })
      }
    }

    post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('author', 'name')

    res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      post
    })
  } catch (error) {
    next(error)
  }
}

// @desc Delete blog post
const deleteBlogPost = async (req, res, next) => {
  try {
    const post = await BlogPost.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      })
    }

    await BlogPost.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

// @desc Get blog posts by category
const getBlogPostsByCategory = async (req, res, next) => {
  try {
    const posts = await BlogPost.find({
      category: req.params.category,
      isPublished: true
    })
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .limit(10)

    res.status(200).json({
      success: true,
      count: posts.length,
      posts
    })
  } catch (error) {
    next(error)
  }
}

// @desc Get featured posts
const getFeaturedPosts = async (req, res, next) => {
  try {
    const posts = await BlogPost.find({
      isPublished: true
    })
      .populate('author', 'name')
      .sort({ views: -1, publishedAt: -1 })
      .limit(5)

    res.status(200).json({
      success: true,
      count: posts.length,
      posts
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogPostsByCategory,
  getFeaturedPosts
}