const { Contact, User } = require('../models')

// @desc Submit contact form
const submitContact = async (req, res, next) => {
  try {
    const { name, email, company, phone, subject, message } = req.body

    const contact = new Contact({
      name,
      email,
      company,
      phone,
      subject,
      message
    })

    await contact.save()

    const { sendContactNotificationToAdmin } = require('../utils/emailService')
    sendContactNotificationToAdmin(contact).catch(() => {})

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us!',
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        submittedAt: contact.createdAt
      }
    })
  } catch (error) {
    next(error)
  }
}

// @desc Get all contacts
const getAllContacts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    let filter = {}

    if (req.query.status) {
      filter.status = req.query.status
    }

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { company: { $regex: req.query.search, $options: 'i' } },
        { subject: { $regex: req.query.search, $options: 'i' } }
      ]
    }

    const total = await Contact.countDocuments(filter)

    const contacts = await Contact.find(filter)
      .populate('assignedTo', 'name')
      .populate('respondedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.status(200).json({
      success: true,
      count: contacts.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      contacts
    })
  } catch (error) {
    next(error)
  }
}

// @desc Get single contact
const getContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('respondedBy', 'name email')

    if (!contact) {
      return res.status(404).json({ success: false })
    }

    if (contact.status === 'new') {
      contact.status = 'read'
      await contact.save()
    }

    res.status(200).json({
      success: true,
      contact
    })
  } catch (error) {
    next(error)
  }
}

// @desc Update contact
const updateContact = async (req, res, next) => {
  try {
    const { status, response, assignedTo } = req.body

    const contact = await Contact.findById(req.params.id)

    if (!contact) {
      return res.status(404).json({ success: false })
    }

    if (status) contact.status = status

    if (response) {
      contact.response = response
      contact.respondedBy = req.user.id
      contact.respondedAt = new Date()
    }

    if (assignedTo) {
      contact.assignedTo = assignedTo
    }

    await contact.save()

    const updatedContact = await Contact.findById(contact._id)
      .populate('assignedTo', 'name')
      .populate('respondedBy', 'name')

    res.status(200).json({
      success: true,
      message: 'Updated successfully',
      contact: updatedContact
    })
  } catch (error) {
    next(error)
  }
}

// @desc Delete contact
const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id)

    if (!contact) {
      return res.status(404).json({ success: false })
    }

    await Contact.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  submitContact,
  getAllContacts,
  getContact,
  updateContact,
  deleteContact
}