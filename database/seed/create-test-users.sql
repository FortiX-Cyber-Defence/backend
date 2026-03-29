-- Create test users for all dashboard roles
-- Password for all users: Test@123

-- 1. Admin User
INSERT INTO users (name, email, password, role, email_verified, created_at, updated_at)
VALUES (
  'Admin Test User',
  'admin@fortix.com',
  '$2a$10$YourHashedPasswordHere',
  'admin',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE role = 'admin';

-- 2. Client User
INSERT INTO users (name, email, password, role, email_verified, created_at, updated_at)
VALUES (
  'Client Test User',
  'client@fortix.com',
  '$2a$10$YourHashedPasswordHere',
  'client',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE role = 'client';

-- 3. HR User
INSERT INTO users (name, email, password, role, email_verified, created_at, updated_at)
VALUES (
  'HR Test User',
  'hr@fortix.com',
  '$2a$10$YourHashedPasswordHere',
  'hr',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE role = 'hr';

-- 4. Employee User
INSERT INTO users (name, email, password, role, email_verified, created_at, updated_at)
VALUES (
  'Employee Test User',
  'employee@fortix.com',
  '$2a$10$YourHashedPasswordHere',
  'employee',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE role = 'employee';

-- Verify users
SELECT id, name, email, role, email_verified FROM users 
WHERE email IN ('admin@fortix.com', 'client@fortix.com', 'hr@fortix.com', 'employee@fortix.com');
