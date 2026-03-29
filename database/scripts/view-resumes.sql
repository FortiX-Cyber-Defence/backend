-- View Resumes in Database
-- This script shows all job applications with resume information

USE fortix_db;

-- ============================================
-- 1. View All Applications with Resume Info
-- ============================================
SELECT 
  id,
  job_title,
  CONCAT(first_name, ' ', last_name) as full_name,
  email,
  phone,
  status,
  resume_file_name,
  resume_file_size,
  resume_file_type,
  CASE 
    WHEN resume_content IS NOT NULL THEN 'YES'
    ELSE 'NO'
  END as has_resume_content,
  LENGTH(resume_content) as content_size_bytes,
  created_at,
  applied_at
FROM job_applications
ORDER BY created_at DESC;

-- ============================================
-- 2. Count Applications with/without Resumes
-- ============================================
SELECT 
  COUNT(*) as total_applications,
  SUM(CASE WHEN resume_content IS NOT NULL THEN 1 ELSE 0 END) as with_resume,
  SUM(CASE WHEN resume_content IS NULL THEN 1 ELSE 0 END) as without_resume,
  ROUND(SUM(CASE WHEN resume_content IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as resume_percentage
FROM job_applications;

-- ============================================
-- 3. View Resume Details by Email
-- ============================================
-- Replace 'user@example.com' with actual email
SELECT 
  id,
  email,
  job_title,
  resume_file_name,
  resume_file_type,
  resume_file_size,
  SUBSTRING(resume_content, 1, 100) as resume_preview,
  created_at
FROM job_applications
WHERE email = 'user@example.com'
ORDER BY created_at DESC;

-- ============================================
-- 4. View Latest Application per User
-- ============================================
SELECT 
  email,
  MAX(created_at) as latest_application,
  COUNT(*) as total_applications,
  SUM(CASE WHEN resume_content IS NOT NULL THEN 1 ELSE 0 END) as applications_with_resume
FROM job_applications
GROUP BY email
ORDER BY latest_application DESC;

-- ============================================
-- 5. View Resume File Types Distribution
-- ============================================
SELECT 
  resume_file_type,
  COUNT(*) as count,
  ROUND(AVG(resume_file_size), 2) as avg_size_bytes,
  ROUND(AVG(resume_file_size) / 1024, 2) as avg_size_kb
FROM job_applications
WHERE resume_content IS NOT NULL
GROUP BY resume_file_type
ORDER BY count DESC;

-- ============================================
-- 6. View Applications with Large Resumes
-- ============================================
SELECT 
  id,
  email,
  resume_file_name,
  resume_file_size,
  ROUND(resume_file_size / 1024, 2) as size_kb,
  ROUND(resume_file_size / 1024 / 1024, 2) as size_mb,
  created_at
FROM job_applications
WHERE resume_content IS NOT NULL
ORDER BY resume_file_size DESC
LIMIT 10;

-- ============================================
-- 7. Export Resume Content (for specific user)
-- ============================================
-- To export a specific resume, use this query
-- Then copy the base64 content and decode it
SELECT 
  id,
  email,
  resume_file_name,
  resume_file_type,
  resume_content
FROM job_applications
WHERE email = 'user@example.com'
  AND resume_content IS NOT NULL
ORDER BY created_at DESC
LIMIT 1;
