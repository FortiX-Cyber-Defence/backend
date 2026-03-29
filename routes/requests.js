const express = require('express')
const {
  createRequest,
  getUserRequests,
  getAllRequests,
  updateRequestStatus,
  getRequest
} = require('../controllers/requestController')
const { protect, authorize } = require('../middleware/auth')
const {
  validateServiceRequest,
  validateObjectId,
  validatePagination
} = require('../middleware/validation')

const router = express.Router()

// All routes require authentication
router.use(protect)

router.route('/')
  .post(validateServiceRequest, createRequest)
  .get(authorize('admin'), validatePagination, getAllRequests)

router.get('/user', validatePagination, getUserRequests)

router.route('/:id')
  .get(validateObjectId, getRequest)

router.put('/:id/status', authorize('admin'), validateObjectId, updateRequestStatus)

module.exports = router