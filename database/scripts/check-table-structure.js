// Check actual database table structure
require('dotenv').config({ path: './server/.env' });
const { sequelize } = require('./server/config/database-mysql');

async function checkTableStructure() {
  console.log('🔍 Checking job_applications table structure\n');
  
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');
    
    // Get actual table structure
    const [columns] = await sequelize.query("DESCRIBE job_applications");
    
    console.log('📊 Actual columns in database:\n');
    columns.forEach(col => {
      console.log(`   ${col.Field.padEnd(25)} ${col.Type.padEnd(20)} ${col.Null === 'NO' ? 'REQUIRED' : 'OPTIONAL'}`);
    });
    
    console.log('\n📝 Resume-related columns:');
    const resumeColumns = columns.filter(col => col.Field.toLowerCase().includes('resume'));
    resumeColumns.forEach(col => {
      console.log(`   ✓ ${col.Field}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTableStructure();
