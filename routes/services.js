const express = require('express')
const {
  getServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
  getServicesByCategory
} = require('../controllers/serviceController')
const { protect, authorize, optionalAuth } = require('../middleware/auth')
const {
  validateService,
  validateObjectId,
  validateSlug,
  validatePagination
} = require('../middleware/validation')

const router = express.Router()

router.route('/')
  .get(validatePagination, getServices)
  .post(protect, authorize('admin'), validateService, createService)

router.get('/category/:category', getServicesByCategory)

router.route('/:slug')
  .get(validateSlug, getServiceBySlug)

router.route('/:id')
  .put(protect, authorize('admin'), validateObjectId, validateService, updateService)
  .delete(protect, authorize('admin'), validateObjectId, deleteService)

module.exports = router