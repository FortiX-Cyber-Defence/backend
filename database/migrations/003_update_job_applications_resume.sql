-- Migration: Update job_applications table for resume storage
-- Description: Ensures resume storage fields are properly configured

USE fortix_db;

-- Check if resumeUrl column exists, if not add it
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'fortix_db' 
  AND TABLE_NAME = 'job_applications' 
  AND COLUMN_NAME = 'resumeUrl';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE job_applications ADD COLUMN resumeUrl VARCHAR(255) NULL AFTER coverLetter',
  'SELECT "Column resumeUrl already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if resumeFileName column exists, if not add it
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'fortix_db' 
  AND TABLE_NAME = 'job_applications' 
  AND COLUMN_NAME = 'resumeFileName';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE job_applications ADD COLUMN resumeFileName VARCHAR(255) NULL AFTER resumeUrl',
  'SELECT "Column resumeFileName already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


-- Add index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_status ON job_applications(status);

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_email ON job_applications(email);

-- Add index on createdAt for sorting
CREATE INDEX IF NOT EXISTS idx_createdAt ON job_applications(createdAt);

SELECT 'Migration 003 completed successfully' AS status;
