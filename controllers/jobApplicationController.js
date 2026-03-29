const { JobApplication, User } = require('../models')
const {
  sendJobApplicationConfirmation,
  sendJobApplicationStatusUpdate,
  sendHRNotification
} = require('../utils/emailService')

// @desc Get my applications
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await JobApplication.find({
      email: req.user.email
    }).sort({ createdAt: -1 })

    res.json({
      success: true,
      count: applications.length,
      applications
    })
  } catch (error) { next(error) }
}

// @desc Get last application
const getLastApplication = async (req, res, next) => {
  try {
    const app = await JobApplication.findOne({
      email: req.params.email.toLowerCase()
    })
      .sort({ createdAt: -1 })
      .select('firstName lastName email phone linkedinUrl experience skills coverLetter resumeFileName resumeFileSize resumeFileType currentCompany education portfolioUrl expectedSalary')

    if (!app) return res.status(404).json({ success: false })

    res.json({ success: true, application: app })
  } catch (error) { next(error) }
}

// @desc Submit application
const submitApplication = async (req, res, next) => {
  try {
    let { jobTitle, firstName, lastName, fullName, email, phone } = req.body

    if (fullName && !firstName) {
      const parts = fullName.split(' ')
      firstName = parts[0]
      lastName = parts.slice(1).join(' ')
    }

    const exists = await JobApplication.findOne({
      email: email.toLowerCase(),
      jobTitle,
      status: { $ne: 'rejected' }
    })

    if (exists) return res.status(400).json({ success: false })

    const application = new JobApplication({
      ...req.body,
      firstName,
      lastName,
      email: email.toLowerCase()
    })

    await application.save()

    sendJobApplicationConfirmation(application).catch(() => {})
    sendHRNotification(application).catch(() => {})

    res.status(201).json({
      success: true,
      application: {
        id: application._id,
        jobTitle: application.jobTitle,
        status: application.status
      }
    })
  } catch (error) { next(error) }
}

// @desc Get all applications
const getAllApplications = async (req, res, next) => {
  try {
    const { status, jobTitle, search, page = 1, limit = 20 } = req.query

    let filter = {}

    if (status) filter.status = status
    if (jobTitle) filter.jobTitle = { $regex: jobTitle, $options: 'i' }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (page - 1) * limit
    const total = await JobApplication.countDocuments(filter)

    const applications = await JobApplication.find(filter)
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    res.json({ success: true, total, applications })
  } catch (error) { next(error) }
}

// @desc Get single application
const getApplication = async (req, res, next) => {
  try {
    const app = await JobApplication.findById(req.params.id)
      .populate('reviewedBy', 'name email')

    if (!app) return res.status(404).json({ success: false })

    res.json({ success: true, application: app })
  } catch (error) { next(error) }
}

// @desc Update status
const updateApplicationStatus = async (req, res, next) => {
  try {
    const app = await JobApplication.findById(req.params.id)

    if (!app) return res.status(404).json({ success: false })

    const oldStatus = app.status

    app.status = req.body.status || app.status
    app.adminNotes = req.body.adminNotes
    app.reviewedBy = req.user.id
    app.reviewedAt = new Date()

    await app.save()

    if (oldStatus !== app.status) {
      sendJobApplicationStatusUpdate(app, oldStatus).catch(() => {})
    }

    res.json({ success: true, application: app })
  } catch (error) { next(error) }
}

// @desc Delete
const deleteApplication = async (req, res, next) => {
  try {
    await JobApplication.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (error) { next(error) }
}

// @desc Stats
const getApplicationStats = async (req, res, next) => {
  try {
    const total = await JobApplication.countDocuments()

    const recent = await JobApplication.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })

    const statusStats = await JobApplication.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])

    const byStatus = {}
    statusStats.forEach(s => {
      byStatus[s._id] = s.count
    })

    res.json({
      success: true,
      stats: { total, recent, byStatus }
    })
  } catch (error) { next(error) }
}

module.exports = {
  submitApplication,
  getMyApplications,
  getLastApplication,
  getAllApplications,
  getApplication,
  updateApplicationStatus,
  deleteApplication,
  getApplicationStats
}