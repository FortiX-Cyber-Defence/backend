const express = require('express')
const router = express.Router()
const { submitContact, getAllContacts, getContact, updateContact, deleteContact } = require('../controllers/contactController')
const { protect, authorize } = require('../middleware/auth')
const { validateObjectId, validatePagination } = require('../middleware/validation')

// Public route
router.post('/', submitContact)

// Admin routes
router.get('/', protect, authorize('admin'), validatePagination, getAllContacts)
router.get('/:id', protect, authorize('admin'), validateObjectId, getContact)
router.put('/:id', protect, authorize('admin'), validateObjectId, updateContact)
router.delete('/:id', protect, authorize('admin'), validateObjectId, deleteContact)

module.exports = router
