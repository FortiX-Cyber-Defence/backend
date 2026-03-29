const express = require('express')
const router = express.Router()
const { submitClientAccessRequest, getAllClientAccessRequests, approveClientAccessRequest, rejectClientAccessRequest } = require('../controllers/clientAccessController')
const { protect, authorize } = require('../middleware/auth')
const { validateObjectId, validatePagination } = require('../middleware/validation')

// Public route
router.post('/', submitClientAccessRequest)

// Admin routes
router.get('/', protect, authorize('admin'), validatePagination, getAllClientAccessRequests)
router.put('/:id/approve', protect, authorize('admin'), validateObjectId, approveClientAccessRequest)
router.put('/:id/reject', protect, authorize('admin'), validateObjectId, rejectClientAccessRequest)

module.exports = router
