const { User } = require('../models')
const { sendTokenResponse } = require('../utils/jwt')
const { sendWelcomeEmail } = require('../utils/emailService')
const speakeasy = require('speakeasy')
const QRCode = require('qrcode')

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, company } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      })
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      company
    })

    await user.save()

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user).catch(err => console.error('Welcome email failed:', err.message))

    sendTokenResponse(user, 201, res, 'User registered successfully')
  } catch (error) {
    next(error)
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password, twoFactorToken } = req.body

    const user = await User.findOne({ email })

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      })
    }

    // 2FA check
    if (user.is2FAEnabled) {
      if (!twoFactorToken) {
        return res.status(200).json({
          success: true,
          requires2FA: true,
          message: 'Please provide 2FA token'
        })
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorToken,
        window: 2
      })

      if (!verified) {
        return res.status(401).json({
          success: false,
          message: 'Invalid 2FA token'
        })
      }
    }

    await user.updateLastLogin()

    sendTokenResponse(user, 200, res, 'Login successful')
  } catch (error) {
    next(error)
  }
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)

    res.status(200).json({
      success: true,
      user
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update user details
// @route   PUT /api/auth/me
// @access  Private
const updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      company: req.body.company
    }

    Object.keys(fieldsToUpdate).forEach(
      key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    )

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)

    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      })
    }

    user.password = req.body.newPassword
    await user.save()

    sendTokenResponse(user, 200, res, 'Password updated successfully')
  } catch (error) {
    next(error)
  }
}

// @desc    Enable 2FA
const enable2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)

    if (user.is2FAEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is already enabled'
      })
    }

    const secret = speakeasy.generateSecret({
      name: `FortiX Cyber Defence (${user.email})`,
      issuer: 'FortiX Cyber Defence'
    })

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url)

    user.twoFactorSecret = secret.base32
    await user.save()

    res.status(200).json({
      success: true,
      message: '2FA setup initiated',
      qrCode: qrCodeUrl,
      secret: secret.base32
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Verify 2FA
const verify2FA = async (req, res, next) => {
  try {
    const { token } = req.body
    const user = await User.findById(req.user.id)

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: '2FA setup not initiated'
      })
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2
    })

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 2FA token'
      })
    }

    user.is2FAEnabled = true
    await user.save()

    res.status(200).json({
      success: true,
      message: '2FA enabled successfully'
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Disable 2FA
const disable2FA = async (req, res, next) => {
  try {
    const { token, password } = req.body
    const user = await User.findById(req.user.id)

    if (!(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      })
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2
    })

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 2FA token'
      })
    }

    user.is2FAEnabled = false
    user.twoFactorSecret = null
    await user.save()

    res.status(200).json({
      success: true,
      message: '2FA disabled successfully'
    })
  } catch (error) {
    next(error)
  }
}

// @desc Logout
const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    })

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  enable2FA,
  verify2FA,
  disable2FA,
  logout
}