const { ServiceRequest, User } = require('../models')
const crypto = require('crypto')

// @desc Submit client access request
const submitClientAccessRequest = async (req, res, next) => {
  try {
    const { name, email, company, phone, message } = req.body

    // Check existing request
    const existingRequest = await ServiceRequest.findOne({
      email,
      requestType: 'consultation',
      status: 'pending'
    })

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending client access request'
      })
    }

    // Create request
    const request = new ServiceRequest({
      userId: null,
      serviceId: null,
      requestType: 'consultation',
      name,
      email,
      phone,
      company,
      subject: 'Client Access Request',
      message: message || 'Requesting client access to FortiX Cyber Defence services',
      priority: 'high',
      status: 'pending'
    })

    await request.save()

    const { sendClientAccessRequestNotification } = require('../utils/emailService')
    sendClientAccessRequestNotification(request).catch(() => {})

    res.status(201).json({
      success: true,
      message: 'Your request has been submitted successfully.',
      request: {
        id: request._id,
        name: request.name,
        email: request.email,
        status: request.status,
        submittedAt: request.createdAt
      }
    })
  } catch (error) {
    next(error)
  }
}

// @desc Get all requests
const getAllClientAccessRequests = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const filter = {
      requestType: 'consultation',
      subject: 'Client Access Request'
    }

    const total = await ServiceRequest.countDocuments(filter)

    const requests = await ServiceRequest.find(filter)
      .populate('assignedTo', 'name')
      .populate('respondedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      requests
    })
  } catch (error) {
    next(error)
  }
}

// @desc Approve request
const approveClientAccessRequest = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)

    if (!request) {
      return res.status(404).json({ success: false, message: 'Not found' })
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Already processed' })
    }

    request.status = 'completed'
    request.response = 'Client access approved.'
    request.respondedBy = req.user.id
    request.respondedAt = new Date()
    request.completedAt = new Date()

    await request.save()

    // Generate password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    const symbols = '@$!%*?&'
    let tempPassword = Array.from({ length: 10 }, () => chars[crypto.randomInt(chars.length)]).join('')
    tempPassword += symbols[crypto.randomInt(symbols.length)]
    tempPassword += crypto.randomInt(10)

    let clientUser = await User.findOne({ email: request.email })

    if (!clientUser) {
      clientUser = new User({
        name: request.name,
        email: request.email,
        password: tempPassword,
        company: request.company || '',
        role: 'client',
        isActive: true
      })
    } else {
      clientUser.password = tempPassword
      clientUser.role = 'client'
      clientUser.isActive = true
    }

    await clientUser.save()

    const { sendClientWelcomeEmail } = require('../utils/emailService')
    sendClientWelcomeEmail(clientUser, tempPassword, request).catch(() => {})

    res.json({
      success: true,
      message: 'Approved successfully',
      request
    })
  } catch (error) {
    next(error)
  }
}

// @desc Reject request
const rejectClientAccessRequest = async (req, res, next) => {
  try {
    const { reason } = req.body

    const request = await ServiceRequest.findById(req.params.id)

    if (!request) {
      return res.status(404).json({ success: false })
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false })
    }

    request.status = 'cancelled'
    request.response = reason || 'Request rejected'
    request.respondedBy = req.user.id
    request.respondedAt = new Date()

    await request.save()

    const { sendClientAccessRejectionEmail } = require('../utils/emailService')
    sendClientAccessRejectionEmail(request, reason).catch(() => {})

    res.json({
      success: true,
      message: 'Rejected successfully',
      request
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  submitClientAccessRequest,
  getAllClientAccessRequests,
  approveClientAccessRequest,
  rejectClientAccessRequest
}