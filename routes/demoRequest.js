const express = require('express')
const router = express.Router()

const demoRequestController = require('../controllers/demoRequestController')

// 🔥 CRITICAL DEBUG
console.log('🔍 demoRequestController =', demoRequestController)
console.log('🔍 submitDemoRequest =', demoRequestController.submitDemoRequest)

// PUBLIC
router.post('/', demoRequestController.submitDemoRequest)

module.exports = router
