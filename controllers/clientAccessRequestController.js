const ClientAccessRequest = require('../models/ClientAccessRequest')
const User = require('../models/User')
const { sendClientAccessConfirmation, sendClientWelcomeEmail } = require('../utils/emailService')

// @desc Submit request
const submitClientAccessRequest = async (req, res, next) => {
  try {
    const { companyName, contactPerson, email, phone, requirements } = req.body

    if (!companyName || !contactPerson || !email || !phone || !requirements) {
      return res.status(400).json({ success: false })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false })
    }

    const existingRequest = await ClientAccessRequest.findOne({
      email: email.toLowerCase(),
      status: 'pending'
    })

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Pending request exists'
      })
    }

    const accessRequest = new ClientAccessRequest({
      companyName: companyName.trim(),
      contactPerson: contactPerson.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      requirements: requirements.trim(),
      status: 'pending'
    })

    await accessRequest.save()

    sendClientAccessConfirmation(accessRequest).catch(() => {})

    res.status(201).json({
      success: true,
      data: {
        id: accessRequest._id,
        email: accessRequest.email,
        status: accessRequest.status
      }
    })
  } catch (error) {
    next(error)
  }
}

// @desc Get all
const getAllClientAccessRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query

    let filter = {}
    if (status) filter.status = status

    const skip = (page - 1) * limit

    const total = await ClientAccessRequest.countDocuments(filter)

    const data = await ClientAccessRequest.find(filter)
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    res.json({
      success: true,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data
    })
  } catch (error) {
    next(error)
  }
}

// @desc Get single
const getClientAccessRequest = async (req, res, next) => {
  try {
    const accessRequest = await ClientAccessRequest.findById(req.params.id)
      .populate('reviewedBy', 'name email')
      .populate('userId', 'name email role')

    if (!accessRequest) {
      return res.status(404).json({ success: false })
    }

    res.json({
      success: true,
      data: accessRequest
    })
  } catch (error) {
    next(error)
  }
}

// @desc Update
const updateClientAccessRequest = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body

    const accessRequest = await ClientAccessRequest.findById(req.params.id)

    if (!accessRequest) {
      return res.status(404).json({ success: false })
    }

    if (status) accessRequest.status = status
    if (adminNotes) accessRequest.adminNotes = adminNotes

    accessRequest.reviewedBy = req.user.id
    accessRequest.reviewedAt = new Date()

    await accessRequest.save()

    // If approved → create user
    if (status === 'approved' && !accessRequest.userId) {
      try {
        const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!'

        const newUser = new User({
          name: accessRequest.contactPerson,
          email: accessRequest.email,
          phone: accessRequest.phone,
          password: tempPassword,
          role: 'client',
          company: accessRequest.companyName,
          clientStatus: 'approved',
          approvedBy: req.user.id,
          approvedAt: new Date(),
          isEmailVerified: true
        })

        await newUser.save()

        accessRequest.userId = newUser._id
        await accessRequest.save()

        await sendClientWelcomeEmail(newUser, tempPassword, accessRequest)
      } catch (err) {}
    }

    res.json({
      success: true,
      message: 'Updated successfully',
      data: accessRequest
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  submitClientAccessRequest,
  getAllClientAccessRequests,
  getClientAccessRequest,
  updateClientAccessRequest
}