const express = require('express')
const router = express.Router()
const {
  submitClientAccessRequest,
  getAllClientAccessRequests,
  getClientAccessRequest,
  updateClientAccessRequest
} = require('../controllers/clientAccessRequestController')

const { protect, authorize } = require('../middleware/auth')

// Public route
router.post('/', submitClientAccessRequest)

// Admin routes
router.use(protect)
router.use(authorize('admin', 'hr'))

router.get('/', getAllClientAccessRequests)
router.get('/:id', getClientAccessRequest)
router.put('/:id', updateClientAccessRequest)

module.exports = router
