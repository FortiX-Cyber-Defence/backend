const express = require('express')
const router = express.Router()
const {
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
} = require('../controllers/inquiryController')
const { protect, authorize } = require('../middleware/auth')
const { validateObjectId, validatePagination } = require('../middleware/validation')

// ── Public submission endpoints ──────────────────────────────────────────────
router.post('/contact',        submitContact)
router.post('/demo-request',   submitDemoRequest)
router.post('/client-access',  submitClientAccess)
router.get('/check-demo',      checkDemoRequest)

// ── Authenticated user ───────────────────────────────────────────────────────
router.post('/service-request', protect, submitServiceRequest)
router.get('/user',             protect, validatePagination, getUserInquiries)

// ── Admin ────────────────────────────────────────────────────────────────────
router.get('/',    protect, authorize('admin', 'hr'), validatePagination, getAllInquiries)
router.get('/:id', protect, authorize('admin', 'hr'), validateObjectId, getInquiry)
router.put('/:id', protect, authorize('admin', 'hr'), validateObjectId, updateInquiry)
router.delete('/:id', protect, authorize('admin'),    validateObjectId, deleteInquiry)

module.exports = router
