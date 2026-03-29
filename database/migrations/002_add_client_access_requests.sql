-- Migration: Add Client Access Requests Table
-- Date: 2024
-- Description: Creates table for managing client access requests with approval workflow

USE fortix_db;

-- Create client_access_requests table
CREATE TABLE IF NOT EXISTS client_access_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  companyName VARCHAR(100) NOT NULL,
  contactPerson VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  requirements TEXT NOT NULL,
  status ENUM('pending', 'under_review', 'approved', 'rejected') DEFAULT 'pending' NOT NULL,
  reviewedBy INT NULL,
  reviewedAt DATETIME NULL,
  adminNotes TEXT NULL,
  userId INT NULL COMMENT 'Created user ID if approved',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt),
  
  FOREIGN KEY (reviewedBy) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add sample data (optional)
-- INSERT INTO client_access_requests (companyName, contactPerson, email, phone, requirements, status)
-- VALUES 
-- ('Tech Corp', 'John Doe', 'john@techcorp.com', '+1234567890', 'Need access to security dashboard for our enterprise', 'pending');

SELECT 'Client Access Requests table created successfully' AS message;
