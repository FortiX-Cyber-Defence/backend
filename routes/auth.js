const express = require('express')
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  enable2FA,
  verify2FA,
  disable2FA,
  logout
} = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate
} = require('../middleware/validation')

const router = express.Router()

router.post('/register', validateUserRegistration, register)
router.post('/login', validateUserLogin, login)
router.get('/logout', logout)
router.get('/me', protect, getMe)
router.put('/me', protect, validateUserUpdate, updateDetails)
router.put('/updatepassword', protect, updatePassword)
router.post('/enable-2fa', protect, enable2FA)
router.post('/verify-2fa', protect, verify2FA)
router.post('/disable-2fa', protect, disable2FA)

module.exports = router