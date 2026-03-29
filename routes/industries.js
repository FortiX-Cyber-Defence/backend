const express = require('express')
const {
  getIndustries,
  getIndustryBySlug,
  createIndustry,
  updateIndustry,
  deleteIndustry
} = require('../controllers/industryController')
const { protect, authorize } = require('../middleware/auth')
const {
  validateIndustry,
  validateObjectId,
  validateSlug,
  validatePagination
} = require('../middleware/validation')

const router = express.Router()

router.route('/')
  .get(validatePagination, getIndustries)
  .post(protect, authorize('admin'), validateIndustry, createIndustry)

router.route('/:slug')
  .get(validateSlug, getIndustryBySlug)

router.route('/:id')
  .put(protect, authorize('admin'), validateObjectId, validateIndustry, updateIndustry)
  .delete(protect, authorize('admin'), validateObjectId, deleteIndustry)

module.exports = router