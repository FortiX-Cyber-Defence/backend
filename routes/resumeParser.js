const express = require('express')
const multer = require('multer')
const pdfParse = require('pdf-parse')
const { parseResume } = require('../utils/resumeParser')

const router = express.Router()

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'))
    }
  }
})

/**
 * @route   POST /api/resume-parser/parse
 * @desc    Parse resume PDF and extract structured data
 * @access  Public
 */
router.post('/parse', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded'
      })
    }

    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer)
    const text = pdfData.text

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract text from PDF. The file may be image-based or corrupted.'
      })
    }

    // Parse resume
    const parsedData = parseResume(text)

    res.status(200).json({
      success: true,
      message: 'Resume parsed successfully',
      data: parsedData
    })

  } catch (error) {
    console.error('Resume parsing error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to parse resume',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

/**
 * @route   POST /api/resume-parser/parse-text
 * @desc    Parse resume from plain text
 * @access  Public
 */
router.post('/parse-text', express.json(), (req, res) => {
  try {
    const { text } = req.body

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No text provided'
      })
    }

    // Parse resume
    const parsedData = parseResume(text)

    res.status(200).json({
      success: true,
      message: 'Resume parsed successfully',
      data: parsedData
    })

  } catch (error) {
    console.error('Resume parsing error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to parse resume'
    })
  }
})

module.exports = router
