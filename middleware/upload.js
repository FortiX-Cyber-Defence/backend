const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/resumes')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    // Generate unique filename: resume_timestamp_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    const nameWithoutExt = path.basename(file.originalname, ext)
    cb(null, `resume_${uniqueSuffix}_${nameWithoutExt}${ext}`)
  }
})

// File filter - only allow PDF, DOC, DOCX
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'))
  }
}

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
})

module.exports = upload
