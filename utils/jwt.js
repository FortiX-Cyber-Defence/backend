const jwt = require('jsonwebtoken')

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  })
}

// Send token response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  // Create token using user.id (Sequelize)
  const token = generateToken(user.id)

  const options = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }

  // Remove password from output - use toJSON() for Sequelize
  const userObj = user.toJSON ? user.toJSON() : user.get({ plain: true })
  delete userObj.password
  delete userObj.twoFactorSecret

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      token,
      user: userObj
    })
}

// Verify token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    throw new Error('Invalid token')
  }
}

module.exports = {
  generateToken,
  sendTokenResponse,
  verifyToken
}