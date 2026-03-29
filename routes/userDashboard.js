const express = require('express')
const router = express.Router()
const {
  getStats,
  getRecentActivity,
  getRequests,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification
} = require('../controllers/userDashboardController')
const { protect } = require('../middleware/auth')

// All routes require authentication
router.use(protect)

router.get('/stats', getStats)
router.get('/activity', getRecentActivity)
router.get('/requests', getRequests)
router.get('/notifications', getNotifications)
router.put('/notifications/:id/read', markNotificationRead)
router.put('/notifications/read-all', markAllNotificationsRead)
router.delete('/notifications/:id', deleteNotification)

module.exports = router
