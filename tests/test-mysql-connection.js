require('dotenv').config()
const { sequelize, connectDB } = require('./config/database')

const testConnection = async () => {
  console.log('🔍 Testing MySQL Connection...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Host: ${process.env.MYSQL_HOST}`)
  console.log(`Port: ${process.env.MYSQL_PORT}`)
  console.log(`User: ${process.env.MYSQL_USER}`)
  console.log(`Database: ${process.env.MYSQL_DATABASE}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    await connectDB()
    console.log('\n✅ SUCCESS! MySQL connection established.')
    console.log('✅ Database models synchronized.')
    console.log('\n📊 Tables that will be created:')
    console.log('   - users')
    console.log('   - services')
    console.log('   - industries')
    console.log('   - blog_posts')
    console.log('   - job_applications')
    console.log('   - service_requests')
    console.log('   - activity_logs')
    console.log('   - contacts')
    
    // Close connection
    await sequelize.close()
    console.log('\n✅ Connection closed successfully.')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ ERROR: Failed to connect to MySQL')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('Error Details:', error.message)
    console.error('\n💡 Common Solutions:')
    console.error('   1. Make sure MySQL is running')
    console.error('   2. Check your .env file credentials')
    console.error('   3. Verify database "fortix_db" exists')
    console.error('   4. Check if port 3306 is correct')
    console.error('   5. Verify MySQL user has proper permissions')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    process.exit(1)
  }
}

testConnection()
