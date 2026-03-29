const { DemoRequest, ClientAccessRequest, JobApplication } = require('../models')

// @desc Get dashboard stats
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id
    const email = req.user.email

    // Demo Requests
    const demoRequests = await DemoRequest.countDocuments({
      userId: userId
    })

    const activeDemoRequests = await DemoRequest.countDocuments({
      userId: userId,
      status: { $in: ['pending', 'under_review'] }
    })

    // Client Requests
    const clientRequests = await ClientAccessRequest.countDocuments({
      userId: userId
    })

    const activeClientRequests = await ClientAccessRequest.countDocuments({
      userId: userId,
      status: { $in: ['pending', 'under_review'] }
    })

    // Job Applications
    const applications = await JobApplication.countDocuments({
      email: email.toLowerCase()
    })

    const totalRequests = demoRequests + clientRequests
    const activeRequests = activeDemoRequests + activeClientRequests

    res.status(200).json({
      success: true,
      totalRequests,
      activeRequests,
      totalApplications: applications
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    next(error)
  }
}

// @desc Get recent activity
exports.getRecentActivity = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: []
    })
  } catch (error) {
    next(error)
  }
}

// @desc Get requests
exports.getRequests = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: []
    })
  } catch (error) {
    next(error)
  }
}

// @desc Get notifications
exports.getNotifications = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: []
    })
  } catch (error) {
    next(error)
  }
}

// @desc Mark notification read
exports.markNotificationRead = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    })
  } catch (error) {
    next(error)
  }
}

// @desc Mark all notifications read
exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    })
  } catch (error) {
    next(error)
  }
}

// @desc Delete notification
exports.deleteNotification = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    })
  } catch (error) {
    next(error)
  }
}