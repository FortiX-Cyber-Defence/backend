const express = require('express')
const router = express.Router()
const {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  getStats,
  deleteSubscriber
} = require('../controllers/newsletterController')
const { protect, authorize } = require('../middleware/auth')

// Public routes
router.post('/subscribe', subscribe)
router.post('/unsubscribe', unsubscribe)

// Admin routes
router.get('/subscribers', protect, authorize('admin'), getAllSubscribers)
router.get('/stats', protect, authorize('admin'), getStats)
router.delete('/subscribers/:id', protect, authorize('admin'), deleteSubscriber)

module.exports = router
