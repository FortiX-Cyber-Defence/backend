const ChatLead = require('../models/ChatLead')
const ServiceRequest = require('../models/ServiceRequest')
const Inquiry = require('../models/Inquiry')
const Service = require('../models/Service')

const {
  sendChatLeadNotification,
  sendChatUserConfirmation,
  sendClientIssueConfirmation,
  sendClientIssueToITTeam
} = require('../utils/emailService')

// POST /api/chatbot/message
const handleMessage = async (req, res) => {
  try {
    const { step, userType, message, leadData } = req.body
    const response = getBotResponse(step, userType, message, leadData)
    res.json({ success: true, ...response })
  } catch (error) {
    console.error('Chatbot error:', error)
    res.status(500).json({ success: false, message: 'Chatbot error' })
  }
}

// POST /api/chatbot/email-captured
const onEmailCaptured = async (req, res) => {
  try {
    const { email, name, userType, jobRole, service } = req.body

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Valid email required' })
    }

    let lead = await ChatLead.findOne({ email })

    if (lead) {
      lead.name = name || lead.name
      lead.userType = userType || lead.userType
      lead.jobRole = jobRole
      lead.service = service
      await lead.save()
    } else {
      lead = new ChatLead({
        email,
        name,
        userType: userType || 'visitor',
        jobRole,
        service
      })
      await lead.save()
    }

    Promise.all([
      sendChatLeadNotification({ email, name, userType, jobRole, service }),
      sendChatUserConfirmation({ email, name, userType })
    ]).catch(err => console.error('Email error:', err.message))

    res.json({ success: true, leadId: lead._id })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process email capture' })
  }
}

// POST /api/chatbot/lead
const saveLead = async (req, res) => {
  try {
    const { userType, name, email, phone, requirement, jobRole, conversation } = req.body

    if (!email && !name) {
      return res.status(400).json({ success: false, message: 'Name or email required' })
    }

    let lead = email ? await ChatLead.findOne({ email }) : null

    if (lead) {
      lead.name = name
      lead.phone = phone
      lead.requirement = requirement
      lead.jobRole = jobRole
      lead.conversation = conversation || []
      await lead.save()
    } else {
      lead = new ChatLead({
        userType: userType || 'visitor',
        name,
        email,
        phone,
        requirement,
        jobRole,
        conversation: conversation || []
      })
      await lead.save()

      sendChatLeadNotification({ userType, name, email, phone, requirement, jobRole })
        .catch(err => console.error('Email failed:', err.message))
    }

    res.json({ success: true, leadId: lead._id })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save lead' })
  }
}

// GET leads
const getLeads = async (req, res) => {
  try {
    const { status, userType, page = 1, limit = 20 } = req.query

    let filter = {}
    if (status) filter.status = status
    if (userType) filter.userType = userType

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const total = await ChatLead.countDocuments(filter)

    const leads = await ChatLead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    res.json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({ success: false })
  }
}

// UPDATE lead
const updateLead = async (req, res) => {
  try {
    const lead = await ChatLead.findById(req.params.id)
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' })

    Object.assign(lead, req.body)
    await lead.save()

    res.json({ success: true, data: lead })
  } catch {
    res.status(500).json({ success: false })
  }
}

// CLIENT CONTEXT
const getClientContext = async (req, res) => {
  try {
    const user = req.user

    const serviceRequests = await ServiceRequest.find({
      userId: user.id,
      status: { $in: ['completed', 'in-progress'] },
      serviceId: { $ne: null }
    }).populate('serviceId', 'title slug')

    const inquiries = await Inquiry.find({
      userId: user.id,
      status: { $in: ['completed', 'approved', 'in_progress'] },
      serviceId: { $ne: null }
    }).populate('serviceId', 'title slug')

    const services = [
      ...serviceRequests.map(r => r.serviceId),
      ...inquiries.map(i => i.serviceId)
    ]

    const uniqueServices = []
    const seen = new Set()

    services.forEach(s => {
      if (s && !seen.has(s._id.toString())) {
        seen.add(s._id.toString())
        uniqueServices.push(s)
      }
    })

    res.json({
      success: true,
      client: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company || '',
        role: user.role
      },
      services: uniqueServices
    })
  } catch (error) {
    res.status(500).json({ success: false })
  }
}

// SUBMIT ISSUE
const submitClientIssue = async (req, res) => {
  try {
    const user = req.user
    const { serviceId, serviceName, issueType, description, priority } = req.body

    if (!issueType || !description) {
      return res.status(400).json({ success: false })
    }

    const request = new ServiceRequest({
      userId: user.id,
      serviceId: serviceId || null,
      requestType: 'support',
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      company: user.company || null,
      subject: `[Chatbot] ${serviceName || 'Service'} Issue – ${issueType}`,
      message: description,
      priority: priority || 'medium',
      status: 'pending'
    })

    await request.save()

    Promise.all([
      sendClientIssueConfirmation({ user, serviceName, issueType, description, requestId: request._id }),
      sendClientIssueToITTeam({ user, serviceName, issueType, description, priority, requestId: request._id })
    ]).catch(err => console.error('Email error:', err.message))

    res.json({ success: true, requestId: request._id })
  } catch (error) {
    res.status(500).json({ success: false })
  }
}

// EMAIL VALIDATION
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

module.exports = {
  handleMessage,
  onEmailCaptured,
  saveLead,
  getLeads,
  updateLead,
  getClientContext,
  submitClientIssue
}