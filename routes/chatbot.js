const express = require('express')
const router = express.Router()
const { handleMessage, onEmailCaptured, saveLead, getLeads, updateLead, getClientContext, submitClientIssue } = require('../controllers/chatbotController')
const { protect, authorize } = require('../middleware/auth')

// Public routes
router.post('/message', handleMessage)
router.post('/email-captured', onEmailCaptured)
router.post('/lead', saveLead)

// Authenticated client routes
router.get('/client-context', protect, getClientContext)
router.post('/client-issue', protect, submitClientIssue)

// Admin / HR only
router.get('/leads', protect, authorize('admin', 'hr'), getLeads)
router.put('/leads/:id', protect, authorize('admin', 'hr'), updateLead)

module.exports = router
