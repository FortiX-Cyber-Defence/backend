/**
 * Input Sanitization Middleware
 * Sanitizes user input to prevent XSS attacks
 */

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    // Remove HTML tags
    let sanitized = input.replace(/<[^>]*>/g, '')
    
    // Remove script tags and their content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    
    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    
    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '')
    
    // Remove data: protocol (can be used for XSS)
    sanitized = sanitized.replace(/data:text\/html/gi, '')
    
    // Trim whitespace
    sanitized = sanitized.trim()
    
    return sanitized
  }
  
  if (typeof input === 'object' && input !== null) {
    if (Array.isArray(input)) {
      return input.map(item => sanitizeInput(item))
    }
    
    const sanitized = {}
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        sanitized[key] = sanitizeInput(input[key])
      }
    }
    return sanitized
  }
  
  return input
}

/**
 * Middleware to sanitize request body, query, and params
 */
const sanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeInput(req.body)
  }
  
  if (req.query) {
    req.query = sanitizeInput(req.query)
  }
  
  if (req.params) {
    req.params = sanitizeInput(req.params)
  }
  
  next()
}

module.exports = { sanitizeMiddleware, sanitizeInput }
