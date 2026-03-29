const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema({

  // Job Information
  jobTitle: {
    type: String,
    required: [true, 'Please provide job title']
  },
  jobId: {
    type: String
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },

  // Personal Information
  firstName: {
    type: String,
    required: [true, 'Please provide first name']
  },
  lastName: {
    type: String,
    required: [true, 'Please provide last name']
  },
  email: {
    type: String,
    required: [true, 'Please provide a valid email'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number']
  },

  // Department
  department: {
    type: String
  },

  // Professional Information
  currentCompany: {
    type: String
  },
  experience: {
    type: String
  },
  education: {
    type: String
  },
  skills: {
    type: String
  },

  // Resume
  resumeUrl: {
    type: String
  },
  resumeFileName: {
    type: String
  },
  resumeFileSize: {
    type: Number
  },
  resumeFileType: {
    type: String
  },

  // Cover Letter
  coverLetter: {
    type: String
  },

  // Links
  linkedinUrl: {
    type: String
  },
  portfolioUrl: {
    type: String
  },

  // Status
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'rejected', 'hired'],
    default: 'submitted'
  },

  // Additional Info
  expectedSalary: {
    type: String
  },
  availableFrom: {
    type: Date
  },
  referralSource: {
    type: String
  },

  // Admin
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  adminNotes: {
    type: String
  },
  reviewNotes: {
    type: String
  },

  // Interview
  interviewDate: {
    type: Date
  },
  interviewNotes: {
    type: String
  }

}, {
  timestamps: true
});


// 🔥 Indexes (same as Sequelize)
jobApplicationSchema.index({ email: 1 });
jobApplicationSchema.index({ status: 1 });
jobApplicationSchema.index({ createdAt: 1 });
jobApplicationSchema.index({ jobTitle: 1 });
jobApplicationSchema.index({ appliedAt: 1 });
jobApplicationSchema.index({ email: 1, status: 1 });
jobApplicationSchema.index({ reviewedBy: 1 });

module.exports = mongoose.model("JobApplication", jobApplicationSchema);