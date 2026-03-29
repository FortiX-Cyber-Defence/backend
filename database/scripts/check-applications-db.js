// Direct database check for job applications
require('dotenv').config({ path: './server/.env' });
const { sequelize } = require('./server/config/database-mysql');
const JobApplication = require('./server/models-mysql/JobApplication');

async function checkApplications() {
  console.log('🔍 Checking Job Applications in Database\n');
  
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected\n');
    
    // Get all applications
    const applications = await JobApplication.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    console.log(`📊 Total applications found: ${applications.length}\n`);
    
    if (applications.length === 0) {
      console.log('⚠️  No applications found in database');
      console.log('\n💡 Possible reasons:');
      console.log('   1. No applications have been submitted yet');
      console.log('   2. Table might not exist (run migrations)');
      console.log('   3. Wrong database connection');
    } else {
      console.log('Applications in database:\n');
      applications.forEach((app, index) => {
        console.log(`${index + 1}. ${app.firstName} ${app.lastName}`);
        console.log(`   Email: ${app.email}`);
        console.log(`   Job: ${app.jobTitle}`);
        console.log(`   Status: ${app.status}`);
        console.log(`   Applied: ${new Date(app.appliedAt || app.createdAt).toLocaleString()}`);
        console.log(`   ID: ${app.id}`);
        console.log('');
      });
      
      // Group by email
      const emailGroups = {};
      applications.forEach(app => {
        if (!emailGroups[app.email]) {
          emailGroups[app.email] = 0;
        }
        emailGroups[app.email]++;
      });
      
      console.log('📧 Applications by email:');
      Object.entries(emailGroups).forEach(([email, count]) => {
        console.log(`   ${email}: ${count} application(s)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Check:');
    console.error('   1. Database credentials in server/.env');
    console.error('   2. MySQL server is running');
    console.error('   3. Database exists');
    console.error('   4. Migrations have been run');
  } finally {
    await sequelize.close();
  }
}

checkApplications();
