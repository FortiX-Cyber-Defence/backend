const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const demoEmployees = [
  {
    name: 'Alex Morgan',
    email: 'alex.morgan@fortixcyber.com',
    password: 'Employee@123',
    role: 'employee',
    employeeId: 'EMP-001',
    department: 'security',
    companyEmail: 'alex.morgan@fortixcyber.com',
    companyDomain: 'fortixcyber.com',
    phone: '+1-555-1001'
  },
  {
    name: 'Jordan Smith',
    email: 'jordan.smith@fortixcyber.com',
    password: 'Employee@123',
    role: 'employee',
    employeeId: 'EMP-002',
    department: 'technical',
    companyEmail: 'jordan.smith@fortixcyber.com',
    companyDomain: 'fortixcyber.com',
    phone: '+1-555-1002'
  },
  {
    name: 'Taylor Davis',
    email: 'taylor.davis@fortixcyber.com',
    password: 'Employee@123',
    role: 'employee',
    employeeId: 'EMP-003',
    department: 'operations',
    companyEmail: 'taylor.davis@fortixcyber.com',
    companyDomain: 'fortixcyber.com',
    phone: '+1-555-1003'
  },
  {
    name: 'Casey Wilson',
    email: 'casey.wilson@fortixcyber.com',
    password: 'Employee@123',
    role: 'employee',
    employeeId: 'EMP-004',
    department: 'security',
    companyEmail: 'casey.wilson@fortixcyber.com',
    companyDomain: 'fortixcyber.com',
    phone: '+1-555-1004'
  },
  {
    name: 'Morgan Lee',
    email: 'morgan.lee@fortixcyber.com',
    password: 'Employee@123',
    role: 'employee',
    employeeId: 'EMP-005',
    department: 'technical',
    companyEmail: 'morgan.lee@fortixcyber.com',
    companyDomain: 'fortixcyber.com',
    phone: '+1-555-1005'
  },
  {
    name: 'Riley Johnson',
    email: 'riley.johnson@fortixcyber.com',
    password: 'HR@123',
    role: 'hr',
    employeeId: 'HR-001',
    department: 'hr',
    companyEmail: 'riley.johnson@fortixcyber.com',
    companyDomain: 'fortixcyber.com',
    phone: '+1-555-2001'
  },
  {
    name: 'Sam Martinez',
    email: 'sam.martinez@fortixcyber.com',
    password: 'Employee@123',
    role: 'employee',
    employeeId: 'EMP-006',
    department: 'operations',
    companyEmail: 'sam.martinez@fortixcyber.com',
    companyDomain: 'fortixcyber.com',
    phone: '+1-555-1006'
  },
  {
    name: 'Jamie Brown',
    email: 'jamie.brown@fortixcyber.com',
    password: 'Employee@123',
    role: 'employee',
    employeeId: 'EMP-007',
    department: 'security',
    companyEmail: 'jamie.brown@fortixcyber.com',
    companyDomain: 'fortixcyber.com',
    phone: '+1-555-1007'
  }
];

async function createDemoEmployees() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'fortix_db'
    });

    console.log('✅ Connected to database\n');

    console.log('📝 Creating demo employees...\n');

    for (const emp of demoEmployees) {
      const hashedPassword = await bcrypt.hash(emp.password, 10);
      
      await connection.execute(
        `INSERT INTO users (
          name, email, password, role, employeeId, department, companyEmail, 
          companyDomain, phone, isEmailVerified, isActive, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name),
          role = VALUES(role),
          employeeId = VALUES(employeeId),
          department = VALUES(department),
          companyEmail = VALUES(companyEmail),
          companyDomain = VALUES(companyDomain),
          phone = VALUES(phone),
          updatedAt = NOW()`,
        [
          emp.name, emp.email, hashedPassword, emp.role, emp.employeeId,
          emp.department, emp.companyEmail, emp.companyDomain, emp.phone
        ]
      );

      const roleEmoji = emp.role === 'hr' ? '👔' : '👨‍💻';
      const deptLabels = {
        'security': 'Security',
        'technical': 'Technical',
        'operations': 'Operations',
        'hr': 'Human Resources',
        'admin': 'Administration'
      };

      console.log(`${roleEmoji} ${emp.name} - ${deptLabels[emp.department]} (${emp.employeeId})`);
    }

    console.log('\n📊 Employee Statistics:');
    console.log('━'.repeat(60));
    
    const [deptStats] = await connection.execute(
      `SELECT 
        department,
        COUNT(*) as count
       FROM users
       WHERE role IN ('employee', 'hr') AND email LIKE '%@fortixcyber.com'
       GROUP BY department
       ORDER BY count DESC`
    );

    deptStats.forEach(stat => {
      const deptLabels = {
        'security': 'Security',
        'technical': 'Technical',
        'operations': 'Operations',
        'hr': 'Human Resources',
        'admin': 'Administration'
      };
      console.log(`  ${deptLabels[stat.department]}: ${stat.count}`);
    });

    const [roleStats] = await connection.execute(
      `SELECT 
        role,
        COUNT(*) as count
       FROM users
       WHERE role IN ('employee', 'hr') AND email LIKE '%@fortixcyber.com'
       GROUP BY role`
    );

    console.log('\n  By Role:');
    roleStats.forEach(stat => {
      const roleLabel = stat.role === 'hr' ? 'HR Staff' : 'Employees';
      console.log(`    ${roleLabel}: ${stat.count}`);
    });

    console.log('\n━'.repeat(60));
    console.log('\n✅ Demo employees created successfully!');
    console.log('\n🎯 Employee Credentials:');
    console.log('  Email: [name]@fortixcyber.com');
    console.log('  Password: Employee@123 (or HR@123 for HR staff)');
    console.log('\n📋 Next Steps:');
    console.log('1. Login as HR user: hr@fortix.com / Test@123');
    console.log('2. Navigate to HR Dashboard → Employees');
    console.log('3. View and manage the demo employees\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('\n💡 Note: Some employees already exist and were updated.');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createDemoEmployees();
