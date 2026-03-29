const { Inquiry, User, Service } = require('../models')

// ─── PUBLIC SUBMISSIONS ─────────────────

// Contact
const submitContact = async (req, res, next) => {
  try {
    const { name, email, company, phone, subject, message, service } = req.body

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false })
    }

    const inquiry = new Inquiry({
      type: 'contact',
      name: name.trim(),
      email,
      company,
      phone,
      subject: service ? `${subject} [Service: ${service}]` : subject,
      message,
      status: 'pending'
    })

    await inquiry.save()

    const { sendContactNotificationToAdmin } = require('../utils/emailService')
    sendContactNotificationToAdmin(inquiry).catch(() => {})

    res.status(201).json({
      success: true,
      inquiry: {
        id: inquiry._id,
        name: inquiry.name,
        email: inquiry.email,
        submittedAt: inquiry.createdAt
      }
    })
  } catch (error) { next(error) }
}

// Demo
const submitDemoRequest = async (req, res, next) => {
  try {
    const { name, email, about, phone, company, jobTitle } = req.body

    const existing = await Inquiry.findOne({
      email: email.toLowerCase(),
      type: 'demo_request',
      status: 'pending'
    })

    if (existing) {
      return res.status(400).json({ success: false })
    }

    const inquiry = new Inquiry({
      type: 'demo_request',
      name,
      email,
      phone,
      company,
      jobTitle,
      message: about,
      status: 'pending'
    })

    await inquiry.save()

    const { sendAdminNotification, sendClientConfirmation } = require('../utils/emailService')
    Promise.all([sendAdminNotification(inquiry), sendClientConfirmation(inquiry)]).catch(() => {})

    res.status(201).json({
      success: true,
      data: { id: inquiry._id }
    })
  } catch (error) { next(error) }
}

// Client Access
const submitClientAccess = async (req, res, next) => {
  try {
    const { companyName, contactPerson, email, phone, requirements } = req.body

    const existing = await Inquiry.findOne({
      email: email.toLowerCase(),
      type: 'client_access',
      status: 'pending'
    })

    if (existing) return res.status(400).json({ success: false })

    const inquiry = new Inquiry({
      type: 'client_access',
      name: contactPerson,
      email,
      phone,
      company: companyName,
      message: requirements,
      subject: 'Client Access Request',
      priority: 'high',
      status: 'pending'
    })

    await inquiry.save()

    const { sendClientAccessConfirmation } = require('../utils/emailService')
    sendClientAccessConfirmation(inquiry).catch(() => {})

    res.status(201).json({ success: true, data: { id: inquiry._id } })
  } catch (error) { next(error) }
}

// Service Request
const submitServiceRequest = async (req, res, next) => {
  try {
    const { serviceId, requestType, name, email, phone, company, subject, message, priority } = req.body

    if (serviceId) {
      const service = await Service.findById(serviceId)
      if (!service) return res.status(404).json({ success: false })
    }

    const existing = await Inquiry.findOne({
      userId: req.user.id,
      serviceId: serviceId || null,
      type: 'service_request',
      status: 'pending'
    })

    if (existing) return res.status(400).json({ success: false })

    const inquiry = new Inquiry({
      type: 'service_request',
      userId: req.user.id,
      serviceId,
      requestType,
      name,
      email,
      phone,
      company,
      subject,
      message,
      priority,
      status: 'pending'
    })

    await inquiry.save()

    const populated = await Inquiry.findById(inquiry._id)
      .populate('userId', 'name email')
      .populate('serviceId', 'title slug category')

    res.status(201).json({ success: true, request: populated })
  } catch (error) { next(error) }
}

// ─── ADMIN ─────────────────

// Get all
const getAllInquiries = async (req, res, next) => {
  try {
    const { type, status, priority, search, page = 1, limit = 20 } = req.query

    let filter = {}

    if (type) filter.type = type
    if (status) filter.status = status
    if (priority) filter.priority = priority

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (page - 1) * limit
    const total = await Inquiry.countDocuments(filter)

    const inquiries = await Inquiry.find(filter)
      .populate('assignedTo', 'name')
      .populate('respondedBy', 'name')
      .populate('userId', 'name email')
      .populate('serviceId', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    res.json({
      success: true,
      total,
      inquiries
    })
  } catch (error) { next(error) }
}

// Get one
const getInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('assignedTo')
      .populate('respondedBy')
      .populate('userId')
      .populate('serviceId')

    if (!inquiry) return res.status(404).json({ success: false })

    if (inquiry.type === 'contact' && inquiry.status === 'pending') {
      inquiry.status = 'in_progress'
      await inquiry.save()
    }

    res.json({ success: true, inquiry })
  } catch (error) { next(error) }
}

// Update
const updateInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
    if (!inquiry) return res.status(404).json({ success: false })

    Object.assign(inquiry, req.body)

    if (req.body.response) {
      inquiry.respondedBy = req.user.id
      inquiry.respondedAt = new Date()
    }

    if (req.body.assignedTo) {
      inquiry.assignedAt = new Date()
    }

    if (req.body.status === 'completed') {
      inquiry.completedAt = new Date()
    }

    await inquiry.save()

    res.json({ success: true, inquiry })
  } catch (error) { next(error) }
}

// Delete
const deleteInquiry = async (req, res, next) => {
  try {
    await Inquiry.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (error) { next(error) }
}

// User inquiries
const getUserInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({ userId: req.user.id })
      .populate('serviceId')

    res.json({ success: true, inquiries })
  } catch (error) { next(error) }
}

// Check demo
const checkDemoRequest = async (req, res, next) => {
  try {
    const { email } = req.query

    const data = await Inquiry.find({
      email: email.toLowerCase(),
      type: 'demo_request'
    }).sort({ createdAt: -1 })

    res.json({ success: true, data })
  } catch (error) { next(error) }
}

module.exports = {
  submitContact,
  submitDemoRequest,
  submitClientAccess,
  submitServiceRequest,
  getAllInquiries,
  getInquiry,
  updateInquiry,
  deleteInquiry,
  getUserInquiries,
  checkDemoRequest
}