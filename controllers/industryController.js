const { Industry, User } = require('../models')

// @desc Get all industries
const getIndustries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    let filter = { isActive: true }

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ]
    }

    const total = await Industry.countDocuments(filter)

    const industries = await Industry.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.status(200).json({
      success: true,
      count: industries.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      industries
    })
  } catch (error) {
    next(error)
  }
}

// @desc Get single industry by slug
const getIndustryBySlug = async (req, res, next) => {
  try {
    const industry = await Industry.findOne({
      slug: req.params.slug,
      isActive: true
    }).populate('createdBy', 'name')

    if (!industry) {
      return res.status(404).json({ success: false })
    }

    res.status(200).json({
      success: true,
      industry
    })
  } catch (error) {
    next(error)
  }
}

// @desc Create industry
const createIndustry = async (req, res, next) => {
  try {
    const existingIndustry = await Industry.findOne({ slug: req.body.slug })

    if (existingIndustry) {
      return res.status(400).json({
        success: false,
        message: 'Slug already exists'
      })
    }

    const industry = new Industry({
      ...req.body,
      createdBy: req.user.id
    })

    await industry.save()

    res.status(201).json({
      success: true,
      message: 'Created successfully',
      industry
    })
  } catch (error) {
    next(error)
  }
}

// @desc Update industry
const updateIndustry = async (req, res, next) => {
  try {
    let industry = await Industry.findById(req.params.id)

    if (!industry) {
      return res.status(404).json({ success: false })
    }

    if (req.body.slug && req.body.slug !== industry.slug) {
      const exists = await Industry.findOne({ slug: req.body.slug })
      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Slug already exists'
        })
      }
    }

    industry = await Industry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name')

    res.status(200).json({
      success: true,
      message: 'Updated successfully',
      industry
    })
  } catch (error) {
    next(error)
  }
}

// @desc Delete industry (soft delete)
const deleteIndustry = async (req, res, next) => {
  try {
    const industry = await Industry.findById(req.params.id)

    if (!industry) {
      return res.status(404).json({ success: false })
    }

    industry.isActive = false
    await industry.save()

    res.status(200).json({
      success: true,
      message: 'Deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getIndustries,
  getIndustryBySlug,
  createIndustry,
  updateIndustry,
  deleteIndustry
}