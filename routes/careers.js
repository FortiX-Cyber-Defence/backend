const express = require('express')
const {
  submitApplication,
  getMyApplications,
  getLastApplication,
  getAllApplications,
  getApplication,
  updateApplicationStatus,
  deleteApplication,
  getApplicationStats
} = require('../controllers/jobApplicationController')
const { protect, authorize } = require('../middleware/auth')
const { body } = require('express-validator')
const { handleValidationErrors, validateObjectId, validatePagination } = require('../middleware/validation')
const upload = require('../middleware/upload')

const router = express.Router()

// Validation for job application submission
const validateJobApplication = [
  body('jobTitle')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Job title must be between 3 and 100 characters'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('linkedIn')
    .optional()
    .isURL()
    .withMessage('Please provide a valid LinkedIn URL'),
  body('coverLetter')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Cover letter cannot exceed 2000 characters'),
  handleValidationErrors
]

// Validation for status update
const validateStatusUpdate = [
  body('status')
    .optional()
    .isIn(['submitted', 'reviewing', 'interview', 'rejected', 'hired'])
    .withMessage('Invalid status'),
  body('adminNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Admin notes cannot exceed 1000 characters'),
  body('interviewScheduled')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date for interview'),
  body('interviewNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Interview notes cannot exceed 1000 characters'),
  handleValidationErrors
]

// Public routes
router.post('/apply', upload.single('resume'), validateJobApplication, submitApplication)
router.get('/last-application/:email', getLastApplication)

// Protected user routes (get own applications)
router.get('/my-applications', protect, getMyApplications)

// Admin and HR routes
router.use(protect)
router.use(authorize('admin', 'hr'))

router.route('/applications')
  .get(validatePagination, getAllApplications)

router.route('/applications/:id')
  .get(validateObjectId, getApplication)
  .delete(validateObjectId, deleteApplication)

router.put('/applications/:id/status', validateObjectId, validateStatusUpdate, updateApplicationStatus)

router.get('/stats', getApplicationStats)

module.exports = router