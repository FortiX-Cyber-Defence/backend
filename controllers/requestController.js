const { ServiceRequest, User, Service } = require('../models')

// @desc Create service request
const createRequest = async (req, res, next) => {
  try {
    const { serviceId, requestType, name, email, phone, company, subject, message, priority } = req.body

    if (serviceId) {
      const service = await Service.findById(serviceId)
      if (!service) {
        return res.status(404).json({ success: false })
      }
    }

    const existingRequest = await ServiceRequest.findOne({
      userId: req.user.id,
      serviceId,
      status: 'pending'
    })

    if (existingRequest) {
      return res.status(400).json({ success: false })
    }

    const request = new ServiceRequest({
      userId: req.user.id,
      serviceId,
      requestType: requestType || 'demo',
      name: name || req.user.name,
      email: email || req.user.email,
      phone,
      company,
      subject,
      message,
      priority: priority || 'medium'
    })

    await request.save()

    const populated = await ServiceRequest.findById(request._id)
      .populate('userId', 'name email')
      .populate('serviceId', 'title slug category')

    res.status(201).json({
      success: true,
      request: populated
    })
  } catch (error) { next(error) }
}

// @desc Get user requests
const getUserRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit

    const total = await ServiceRequest.countDocuments({ userId: req.user.id })

    const requests = await ServiceRequest.find({ userId: req.user.id })
      .populate('serviceId', 'title slug category')
      .populate('assignedTo', 'name')
      .populate('respondedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    res.json({
      success: true,
      total,
      requests
    })
  } catch (error) { next(error) }
}

// @desc Get all requests (admin)
const getAllRequests = async (req, res, next) => {
  try {
    const { status, priority, requestType, page = 1, limit = 20 } = req.query

    let filter = {}
    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (requestType) filter.requestType = requestType

    const skip = (page - 1) * limit
    const total = await ServiceRequest.countDocuments(filter)

    const requests = await ServiceRequest.find(filter)
      .populate('userId', 'name email company')
      .populate('serviceId', 'title slug category')
      .populate('assignedTo', 'name')
      .populate('respondedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    res.json({
      success: true,
      total,
      requests
    })
  } catch (error) { next(error) }
}

// @desc Update request
const updateRequestStatus = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)

    if (!request) return res.status(404).json({ success: false })

    const { status, response, assignedTo } = req.body

    if (status) request.status = status

    if (response) {
      request.response = response
      request.respondedBy = req.user.id
      request.respondedAt = new Date()
    }

    if (assignedTo) {
      request.assignedTo = assignedTo
      request.assignedAt = new Date()
    }

    if (status === 'completed') {
      request.completedAt = new Date()
    }

    await request.save()

    const updated = await ServiceRequest.findById(request._id)
      .populate('userId', 'name email')
      .populate('serviceId', 'title slug')
      .populate('assignedTo', 'name')
      .populate('respondedBy', 'name')

    res.json({
      success: true,
      request: updated
    })
  } catch (error) { next(error) }
}

// @desc Get single request
const getRequest = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('userId', 'name email company')
      .populate('serviceId', 'title slug category description')
      .populate('assignedTo', 'name')
      .populate('respondedBy', 'name')

    if (!request) return res.status(404).json({ success: false })

    if (request.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false })
    }

    res.json({ success: true, request })
  } catch (error) { next(error) }
}

module.exports = {
  createRequest,
  getUserRequests,
  getAllRequests,
  updateRequestStatus,
  getRequest
}
