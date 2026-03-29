const DemoRequest = require('../models/DemoRequest')
const User = require('../models/User')
const { sendAdminNotification, sendClientConfirmation } = require('../utils/emailService')

// @desc Submit demo request
const submitDemoRequest = async (req, res, next) => {
  try {
    const { name, email, about } = req.body

    if (!name || !email || !about) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email'
      })
    }

    const existingRequest = await DemoRequest.findOne({
      email: email.toLowerCase(),
      status: 'pending'
    })

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending demo request'
      })
    }

    const demoRequest = new DemoRequest({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      about: about.trim(),
      status: 'pending'
    })

    await demoRequest.save()

    Promise.all([
      sendAdminNotification(demoRequest),
      sendClientConfirmation(demoRequest)
    ]).catch(() => {})

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully',
      data: {
        id: demoRequest._id,
        name: demoRequest.name,
        email: demoRequest.email,
        status: demoRequest.status,
        submittedAt: demoRequest.createdAt
      }
    })
  } catch (error) {
    next(error)
  }
}

// @desc Get all demo requests
const getAllDemoRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query

    let filter = {}
    if (status) filter.status = status

    const skip = (page - 1) * limit

    const total = await DemoRequest.countDocuments(filter)

    const data = await DemoRequest.find(filter)
      .populate('contactedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data
    })
  } catch (error) {
    next(error)
  }
}

// @desc Get single demo request
const getDemoRequest = async (req, res, next) => {
  try {
    const demoRequest = await DemoRequest.findById(req.params.id)
      .populate('contactedBy', 'name email')

    if (!demoRequest) {
      return res.status(404).json({ success: false })
    }

    res.json({
      success: true,
      data: demoRequest
    })
  } catch (error) {
    next(error)
  }
}

// @desc Update demo request
const updateDemoRequest = async (req, res, next) => {
  try {
    const { status, notes } = req.body

    const demoRequest = await DemoRequest.findById(req.params.id)

    if (!demoRequest) {
      return res.status(404).json({ success: false })
    }

    if (status) demoRequest.status = status
    if (notes) demoRequest.notes = notes

    if (status === 'contacted' && !demoRequest.contactedAt) {
      demoRequest.contactedBy = req.user.id
      demoRequest.contactedAt = new Date()
    }

    await demoRequest.save()

    const updated = await DemoRequest.findById(demoRequest._id)
      .populate('contactedBy', 'name email')

    res.json({
      success: true,
      message: 'Updated successfully',
      data: updated
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  submitDemoRequest,
  getAllDemoRequests,
  getDemoRequest,
  updateDemoRequest
}