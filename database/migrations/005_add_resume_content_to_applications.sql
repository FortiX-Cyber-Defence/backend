-- Migration: Add resume content storage to job_applications table
-- Description: Store actual resume file content in database for "use last application" feature

ALTER TABLE job_applications
ADD COLUMN resume_content LONGTEXT NULL COMMENT 'Base64 encoded resume file content',
ADD COLUMN resume_file_size INT NULL COMMENT 'Resume file size in bytes',
ADD COLUMN resume_file_type VARCHAR(100) NULL COMMENT 'Resume MIME type (e.g., application/pdf)';

-- Add index for better query performance
CREATE INDEX idx_email_resume ON job_applications(email, resume_content(100));
