const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const path = require('path')
require('dotenv').config()

const mongoose = require("mongoose");

// Import routes
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const serviceRoutes = require('./routes/services')
const industryRoutes = require('./routes/industries')
const requestRoutes = require('./routes/requests')
const blogRoutes = require('./routes/blog')
const careerRoutes = require('./routes/careers')
const clientAccessRoutes = require('./routes/clientAccess')
const clientAccessRequestRoutes = require('./routes/clientAccessRequest')
const contactRoutes = require('./routes/contact')
const demoRequestRoutes = require('./routes/demoRequest')
const resumeParserRoutes = require('./routes/resumeParser')
const newsletterRoutes = require('./routes/newsletter')
const userDashboardRoutes = require('./routes/userDashboard')
const inquiryRoutes = require('./routes/inquiries')
const chatbotRoutes = require('./routes/chatbot')

// Import middleware
const errorHandler = require('./middleware/errorHandler')
const { sanitizeMiddleware } = require('./middleware/sanitize')

const app = express()

// Security middleware
app.use(helmet())
app.use(hpp())

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.FRONTEND_URL || '').split(',').filter(Boolean)
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174']

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV === 'production') {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.'
      return callback(new Error(msg), false)
    }
    return callback(null, true)
  },
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
})
app.use('/api/', limiter)

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  }
})
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// Rate limiting for public submission endpoints
const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 submissions per 15 minutes
  message: {
    error: 'Too many submissions from this IP, please try again later.'
  },
  skipSuccessfulRequests: false
})

// Apply to public endpoints
app.use('/api/demo-request', publicFormLimiter)
app.use('/api/client-access', publicFormLimiter)
app.use('/api/client-access-request', publicFormLimiter)
app.use('/api/contact', publicFormLimiter)
app.use('/api/careers/apply', publicFormLimiter)
app.use('/api/newsletter/subscribe', publicFormLimiter)

// Body parser middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Input sanitization middleware (protect against XSS)
app.use(sanitizeMiddleware)

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log("MongoDB Error ❌", err));

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/industries', industryRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/blog', blogRoutes)
app.use('/api/careers', careerRoutes)
// Unified inquiries route
app.use('/api/inquiries', inquiryRoutes)

// Legacy aliases → redirect to unified endpoints for backward compatibility
app.use('/api/client-access-request', clientAccessRoutes)
app.use('/api/client-access', clientAccessRequestRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/demo-request', demoRequestRoutes)
app.use('/api/resume-parser', resumeParserRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/user-dashboard', userDashboardRoutes)
app.use('/api/chatbot', chatbotRoutes)

// Health check endpoint with database connectivity check
app.get('/api/health', async (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: {
      type: 'MongoDB',
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    }
  }

  // Check database connectivity
  try {
    healthCheck.database.status = 'connected'
  } catch (error) {
    healthCheck.status = 'ERROR'
    healthCheck.database.status = 'disconnected'
    healthCheck.database.error = error.message
    return res.status(503).json(healthCheck)
  }

  res.json(healthCheck)
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Error handling middleware
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
  console.log(`📊 Database: MongoDB`)
})
