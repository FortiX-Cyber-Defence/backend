-- Test Users for Dashboard Testing
-- Password for all users: password123

USE fortix_db;

-- Insert Employee Test User
INSERT INTO users (name, email, password, role, department, employeeId, phone, isActive, createdAt, updatedAt)
VALUES (
  'Test Employee',
  'employee@test.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMesJQAncBVTr/VGh0XJQvjYW2',
  'employee',
  'technical',
  'EMP-TEST-001',
  '+1234567890',
  1,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE role = 'employee';

-- Insert HR Test User
INSERT INTO users (name, email, password, role, department, employeeId, phone, isActive, createdAt, updatedAt)
VALUES (
  'Test HR Manager',
  'hr@test.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMesJQAncBVTr/VGh0XJQvjYW2',
  'hr',
  'hr',
  'HR-TEST-001',
  '+1234567891',
  1,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE role = 'hr';

-- Verify users created
SELECT id, name, email, role, department, employeeId FROM users WHERE role IN ('employee', 'hr');
