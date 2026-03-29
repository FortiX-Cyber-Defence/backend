const { body, param, query, validationResult } = require('express-validator')

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    })
  }
  next()
}

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)')
    .not().isIn(['password', 'Password123', '12345678', 'qwerty123'])
    .withMessage('Password is too common. Please choose a stronger password'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  handleValidationErrors
]

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
]

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  body('role')
    .optional()
    .isIn(['user', 'client', 'admin'])
    .withMessage('Invalid role'),
  handleValidationErrors
]

// Service validation rules
const validateService = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('slug')
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('category')
    .isIn(['core', 'cloud', 'advanced', 'governance'])
    .withMessage('Invalid category'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  body('features.*')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Each feature cannot exceed 200 characters'),
  handleValidationErrors
]

// Industry validation rules
const validateIndustry = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('slug')
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('threatProfile')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Threat profile must be between 10 and 1000 characters'),
  body('complianceRequirements')
    .optional()
    .isArray()
    .withMessage('Compliance requirements must be an array'),
  body('complianceRequirements.*')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Each compliance requirement cannot exceed 100 characters'),
  handleValidationErrors
]

// Blog post validation rules
const validateBlogPost = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('slug')
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('content')
    .trim()
    .isLength({ min: 100 })
    .withMessage('Content must be at least 100 characters'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Excerpt cannot exceed 500 characters'),
  body('category')
    .optional()
    .isIn(['cybersecurity', 'threat-intelligence', 'compliance', 'best-practices', 'news', 'case-study'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters'),
  body('published')
    .optional()
    .isBoolean()
    .withMessage('Published must be a boolean'),
  handleValidationErrors
]

// Service request validation rules
const validateServiceRequest = [
  body('serviceId')
    .isInt({ min: 1 })
    .withMessage('Invalid service ID'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  handleValidationErrors
]

// Parameter validation
const validateObjectId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid ID format'),
  handleValidationErrors
]

const validateSlug = [
  param('slug')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Invalid slug format'),
  handleValidationErrors
]

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
]

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateService,
  validateIndustry,
  validateBlogPost,
  validateServiceRequest,
  validateObjectId,
  validateSlug,
  validatePagination
}