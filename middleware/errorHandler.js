const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Log to console for dev
  console.error('ERROR:', err)

  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(e => e.message).join(', ')
    error = { message, statusCode: 400 }
  }

  // Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value entered'
    error = { message, statusCode: 400 }
  }

  // Sequelize Database Error
  if (err.name === 'SequelizeDatabaseError') {
    // Provide more detailed error message in development
    const message = process.env.NODE_ENV === 'development' 
      ? `Database error: ${err.message}`
      : 'Database error occurred'
    error = { message, statusCode: 500 }
    
    // Log detailed error for debugging
    console.error('Sequelize Database Error Details:', {
      message: err.message,
      sql: err.sql,
      parameters: err.parameters
    })
  }

  // Sequelize Connection Error
  if (err.name === 'SequelizeConnectionError') {
    const message = 'Database connection error'
    error = { message, statusCode: 500 }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token'
    error = { message, statusCode: 401 }
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired'
    error = { message, statusCode: 401 }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

module.exports = errorHandler