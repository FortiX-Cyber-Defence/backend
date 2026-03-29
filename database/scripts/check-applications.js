const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkApplications() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'fortix_db'
    });

    console.log('✅ Connected to database\n');

    // Check if table exists
    const [tables] = await connection.execute(
      `SHOW TABLES LIKE 'job_applications'`
    );

    if (tables.length === 0) {
      console.log('❌ Table "job_applications" does not exist!');
      console.log('   Run migrations first: node run-migration.js');
      return;
    }

    console.log('✅ Table "job_applications" exists\n');

    // Count total applications
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM job_applications`
    );

    console.log(`📊 Total applications in database: ${countResult[0].total}\n`);

    if (countResult[0].total === 0) {
      console.log('⚠️  No applications found!');
      console.log('   Run: node create-demo-applications.js');
      return;
    }

    // Get all applications
    const [applications] = await connection.execute(
      `SELECT id, firstName, lastName, email, position, status, createdAt 
       FROM job_applications 
       ORDER BY createdAt DESC 
       LIMIT 10`
    );

    console.log('📋 Recent Applications:');
    console.log('━'.repeat(80));
    applications.forEach((app, index) => {
      console.log(`${index + 1}. ${app.firstName} ${app.lastName}`);
      console.log(`   Email: ${app.email}`);
      console.log(`   Position: ${app.position}`);
      console.log(`   Status: ${app.status}`);
      console.log(`   Applied: ${app.createdAt}`);
      console.log('');
    });

    // Get status breakdown
    const [statusStats] = await connection.execute(
      `SELECT status, COUNT(*) as count 
       FROM job_applications 
       GROUP BY status`
    );

    console.log('━'.repeat(80));
    console.log('\n📊 Status Breakdown:');
    statusStats.forEach(stat => {
      console.log(`  ${stat.status}: ${stat.count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkApplications();
