-- FortiX Cyber Defence - Database Query Script
-- Use this to view all data in your MySQL database

-- Connect to database
USE fortix_db;

-- Show all tables
SHOW TABLES;

-- View Users table
SELECT * FROM Users;

-- View Services table
SELECT * FROM Services;

-- View Industries table
SELECT * FROM Industries;

-- View Blog Posts
SELECT * FROM BlogPosts;

-- View Job Applications
SELECT * FROM JobApplications;

-- View Service Requests
SELECT * FROM ServiceRequests;

-- View Demo Requests
SELECT * FROM demo_requests;

-- View Contacts
SELECT * FROM Contacts;

-- View Activity Logs
SELECT * FROM ActivityLogs;

-- Count records in each table
SELECT 'Users' as TableName, COUNT(*) as RecordCount FROM Users
UNION ALL
SELECT 'Services', COUNT(*) FROM Services
UNION ALL
SELECT 'Industries', COUNT(*) FROM Industries
UNION ALL
SELECT 'BlogPosts', COUNT(*) FROM BlogPosts
UNION ALL
SELECT 'JobApplications', COUNT(*) FROM JobApplications
UNION ALL
SELECT 'ServiceRequests', COUNT(*) FROM ServiceRequests
UNION ALL
SELECT 'demo_requests', COUNT(*) FROM demo_requests
UNION ALL
SELECT 'Contacts', COUNT(*) FROM Contacts
UNION ALL
SELECT 'ActivityLogs', COUNT(*) FROM ActivityLogs;

-- View Users with their roles
SELECT id, name, email, role, isActive, createdAt 
FROM Users 
ORDER BY createdAt DESC;

-- View recent Demo Requests
SELECT id, name, email, status, createdAt 
FROM demo_requests 
ORDER BY createdAt DESC 
LIMIT 10;

-- View recent Contacts
SELECT id, name, email, subject, status, createdAt 
FROM Contacts 
ORDER BY createdAt DESC 
LIMIT 10;

-- View Job Applications summary
SELECT id, fullName, email, position, status, createdAt 
FROM JobApplications 
ORDER BY createdAt DESC 
LIMIT 10;
