const express = require('express')
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  grantServiceAccess,
  revokeServiceAccess
} = require('../controllers/userController')
const { protect, authorize } = require('../middleware/auth')
const {
  validateUserUpdate,
  validateObjectId,
  validatePagination
} = require('../middleware/validation')

const router = express.Router()

// All routes require authentication and admin role
router.use(protect)
router.use(authorize('admin'))

router.route('/')
  .get(validatePagination, getUsers)

router.route('/:id')
  .get(validateObjectId, getUser)
  .put(validateObjectId, validateUserUpdate, updateUser)
  .delete(validateObjectId, deleteUser)

router.post('/:id/grant-access', validateObjectId, grantServiceAccess)
router.post('/:id/revoke-access', validateObjectId, revokeServiceAccess)

module.exports = router