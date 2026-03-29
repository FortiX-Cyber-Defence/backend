const { Service, User } = require('../models')

// @desc Get all services
const getServices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    let filter = { isActive: true }

    if (req.query.category) {
      filter.category = req.query.category
    }

    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ]
    }

    const total = await Service.countDocuments(filter)

    const services = await Service.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json({
      success: true,
      total,
      services
    })
  } catch (error) { next(error) }
}

// @desc Get single by slug
const getServiceBySlug = async (req, res, next) => {
  try {
    const service = await Service.findOne({
      slug: req.params.slug,
      isActive: true
    }).populate('createdBy', 'name')

    if (!service) return res.status(404).json({ success: false })

    res.json({ success: true, service })
  } catch (error) { next(error) }
}

// @desc Create
const createService = async (req, res, next) => {
  try {
    const existing = await Service.findOne({ slug: req.body.slug })

    if (existing) {
      return res.status(400).json({ success: false })
    }

    const service = new Service({
      ...req.body,
      createdBy: req.user.id
    })

    await service.save()

    res.status(201).json({
      success: true,
      service
    })
  } catch (error) { next(error) }
}

// @desc Update
const updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id)

    if (!service) return res.status(404).json({ success: false })

    if (req.body.slug && req.body.slug !== service.slug) {
      const exists = await Service.findOne({ slug: req.body.slug })
      if (exists) {
        return res.status(400).json({ success: false })
      }
    }

    service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name')

    res.json({ success: true, service })
  } catch (error) { next(error) }
}

// @desc Delete (soft)
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)

    if (!service) return res.status(404).json({ success: false })

    service.isActive = false
    await service.save()

    res.json({ success: true })
  } catch (error) { next(error) }
}

// @desc Get by category
const getServicesByCategory = async (req, res, next) => {
  try {
    const services = await Service.find({
      category: req.params.category,
      isActive: true
    })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      count: services.length,
      services
    })
  } catch (error) { next(error) }
}

module.exports = {
  getServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
  getServicesByCategory
}