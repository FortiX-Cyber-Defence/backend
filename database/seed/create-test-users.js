const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const testUsers = [
  {
    name: 'Admin Test User',
    email: 'admin@fortix.com',
    password: 'Test@123',
    role: 'admin'
  },
  {
    name: 'Client Test User',
    email: 'client@fortix.com',
    password: 'Test@123',
    role: 'client'
  },
  {
    name: 'HR Test User',
    email: 'hr@fortix.com',
    password: 'Test@123',
    role: 'hr'
  },
  {
    name: 'Employee Test User',
    email: 'employee@fortix.com',
    password: 'Test@123',
    role: 'employee'
  }
];

async function createTestUsers() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root',
      database: process.env.MYSQL_DATABASE || 'fortix_db'
    });

    console.log('✅ Connected to database\n');

    for (const user of testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      const [result] = await connection.execute(
        `INSERT INTO users (name, email, password, role, isEmailVerified, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, 1, NOW(), NOW())
         ON DUPLICATE KEY UPDATE 
         name = VALUES(name),
         password = VALUES(password),
         role = VALUES(role),
         updatedAt = NOW()`,
        [user.name, user.email, hashedPassword, user.role]
      );

      console.log(`✅ Created/Updated ${user.role.toUpperCase()} user: ${user.email}`);
    }

    console.log('\n📋 Test Users Summary:');
    console.log('━'.repeat(60));
    
    const [users] = await connection.execute(
      `SELECT id, name, email, role, isEmailVerified, createdAt 
       FROM users 
       WHERE email IN (?, ?, ?, ?)
       ORDER BY FIELD(role, 'admin', 'client', 'hr', 'employee')`,
      testUsers.map(u => u.email)
    );

    users.forEach(user => {
      console.log(`\n${user.role.toUpperCase()} Dashboard:`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: Test@123`);
      console.log(`  Dashboard URL: http://localhost:3000/${user.role}`);
    });

    console.log('\n━'.repeat(60));
    console.log('\n🎯 Testing Instructions:');
    console.log('1. Start the server: npm run dev (in server folder)');
    console.log('2. Start the client: npm run dev (in client folder)');
    console.log('3. Go to: http://localhost:3000/login');
    console.log('4. Login with any of the above credentials');
    console.log('5. You will be automatically redirected to the correct dashboard\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createTestUsers();
