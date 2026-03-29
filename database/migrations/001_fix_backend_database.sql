-- Database Migration: Fix Backend/Database Issues
-- Run this SQL script to update existing tables with missing fields and indexes

-- ============================================
-- 1. Update Users Table
-- ============================================

-- Add phone column to users table (if not exists)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) AFTER email;

-- ============================================
-- 2. Update Job Applications Table
-- ============================================

-- Add missing columns to job_applications table
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS jobTitle VARCHAR(100) NOT NULL DEFAULT 'Untitled Position' AFTER id;

ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS jobId VARCHAR(50) AFTER jobTitle;

ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP AFTER jobId;

ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS interviewDate DATETIME AFTER reviewedAt;

ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS interviewNotes TEXT AFTER interviewDate;

ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS reviewNotes TEXT AFTER interviewNotes;

-- Update status enum to match frontend expectations
-- Note: This requires recreating the column
ALTER TABLE job_applications 
MODIFY COLUMN status ENUM('submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'rejected', 'hired') 
DEFAULT 'submitted';

-- Change skills from JSON to TEXT for better compatibility
ALTER TABLE job_applications 
MODIFY COLUMN skills TEXT;

-- Update existing 'pending' status to 'submitted'
UPDATE job_applications SET status = 'submitted' WHERE status = 'pending';

-- Update existing 'reviewing' status to 'under_review'
UPDATE job_applications SET status = 'under_review' WHERE status = 'reviewing';

-- Update existing 'interview' status to 'interview_scheduled'
UPDATE job_applications SET status = 'interview_scheduled' WHERE status = 'interview';

-- Update existing 'accepted' status to 'hired'
UPDATE job_applications SET status = 'hired' WHERE status = 'accepted';

-- ============================================
-- 3. Add Indexes for Performance
-- ============================================

-- Job Applications indexes
CREATE INDEX IF NOT EXISTS idx_job_applications_email 
ON job_applications(email);

CREATE INDEX IF NOT EXISTS idx_job_applications_job_title 
ON job_applications(jobTitle);

CREATE INDEX IF NOT EXISTS idx_job_applications_status_date 
ON job_applications(status, appliedAt);

CREATE INDEX IF NOT EXISTS idx_job_applications_email_job 
ON job_applications(email, jobTitle);

-- Demo Requests indexes
CREATE INDEX IF NOT EXISTS idx_demo_requests_email_status 
ON demo_requests(email, status);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email 
ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_role 
ON users(role);

-- ============================================
-- 4. Update Demo Requests Table
-- ============================================

-- Add missing columns to demo_requests table
ALTER TABLE demo_requests 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) AFTER email;

ALTER TABLE demo_requests 
ADD COLUMN IF NOT EXISTS company VARCHAR(100) AFTER phone;

ALTER TABLE demo_requests 
ADD COLUMN IF NOT EXISTS jobTitle VARCHAR(100) AFTER company;

-- ============================================
-- 5. Data Cleanup
-- ============================================

-- Set appliedAt for existing records that don't have it
UPDATE job_applications 
SET appliedAt = createdAt 
WHERE appliedAt IS NULL;

-- ============================================
-- 6. Verify Migration
-- ============================================

-- Check users table structure
DESCRIBE users;

-- Check job_applications table structure
DESCRIBE job_applications;

-- Check demo_requests table structure
DESCRIBE demo_requests;

-- Check indexes
SHOW INDEX FROM job_applications;
SHOW INDEX FROM demo_requests;
SHOW INDEX FROM users;

-- Count records by status
SELECT status, COUNT(*) as count 
FROM job_applications 
GROUP BY status;

-- ============================================
-- Migration Complete
-- ============================================

SELECT 'Migration completed successfully!' as message;
