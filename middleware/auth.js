const jwt = require('jsonwebtoken')
const { User, ActivityLog } = require('../models')

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from the token
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      })

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        })
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated'
        })
      }

      next()
    } catch (error) {
      console.error('Token verification error:', error)
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      })
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    })
  }
}

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      })
    }

    next()
  }
}

// Check if user has access to specific service
const checkServiceAccess = async (req, res, next) => {
  try {
    const serviceId = req.params.serviceId || req.body.serviceId

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Service ID is required'
      })
    }

    // Admin has access to all services
    if (req.user.role === 'admin') {
      return next()
    }

    // For MySQL, we'll check if user is a client with approved status
    // In a full implementation, you'd have a junction table for user-service relationships
    if (req.user.role === 'client' && req.user.clientStatus === 'approved') {
      return next()
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied to this service'
    })
  } catch (error) {
    console.error('Service access check error:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error during access check'
    })
  }
}

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      })
    } catch (error) {
      // Token is invalid, but we continue without user
      req.user = null
    }
  }

  next()
}

// Middleware to check if client is approved
const requireApprovedClient = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    })
  }

  if (req.user.role === 'client' && req.user.clientStatus !== 'approved') {
    return res.status(403).json({
      success: false,
      message: 'Your client account is pending approval. Please wait for admin approval.',
      clientStatus: req.user.clientStatus
    })
  }

  next()
}

// Middleware to verify employee email domain
const requireCompanyEmail = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    })
  }

  if ((req.user.role === 'employee' || req.user.role === 'hr') && !req.user.isValidEmployeeEmail()) {
    return res.status(403).json({
      success: false,
      message: 'Invalid company email. Please use your company email address.'
    })
  }

  next()
}

// Middleware to log user activity
const logActivity = (action, resource = 'other') => {
  return async (req, res, next) => {
    try {
      if (req.user) {
        await ActivityLog.create({
          userId: req.user.id,
          userRole: req.user.role,
          action,
          resource,
          resourceId: req.params.id || null,
          details: JSON.stringify({
            method: req.method,
            path: req.path,
            body: req.method !== 'GET' ? req.body : undefined
          }),
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent')
        })
      }
    } catch (error) {
      console.error('Activity logging error:', error)
    }
    next()
  }
}

// Check if user can access specific resource
const canAccessResource = (resourceType) => {
  return async (req, res, next) => {
    const { role } = req.user
    const resourceId = req.params.id

    // Admin can access everything
    if (role === 'admin') {
      return next()
    }

    // Client can only access their own resources
    if (role === 'client' && resourceType === 'client') {
      if (req.user.id.toString() !== resourceId) {
        return res.status(403).json({
          success: false,
          message: 'You can only access your own resources'
        })
      }
      return next()
    }

    // HR can only access job applications
    if (role === 'hr' && resourceType === 'application') {
      return next()
    }

    // Employee can access based on department
    if (role === 'employee') {
      // Add department-specific logic here
      return next()
    }

    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this resource'
    })
  }
}

// Restrict HR to only careers/applications
const restrictHRAccess = (req, res, next) => {
  if (req.user.role === 'hr') {
    const allowedPaths = [
      '/api/careers',
      '/api/auth',
      '/api/users/me'
    ]

    const isAllowed = allowedPaths.some(path => req.path.startsWith(path))

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: 'HR users can only access career and application management'
      })
    }
  }

  next()
}

module.exports = {
  protect,
  authorize,
  checkServiceAccess,
  optionalAuth,
  requireApprovedClient,
  requireCompanyEmail,
  logActivity,
  canAccessResource,
  restrictHRAccess
}
