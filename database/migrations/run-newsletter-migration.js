const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

async function runMigration() {
  let connection

  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'fortix_db',
      multipleStatements: true
    })

    console.log('📊 Connected to MySQL database')

    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '004_create_newsletter_subscribers.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log('🔄 Running newsletter_subscribers migration...')

    // Execute migration
    await connection.query(migrationSQL)

    console.log('✅ Migration completed successfully!')
    console.log('📧 Newsletter subscribers table created')

    // Verify table creation
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'newsletter_subscribers'"
    )

    if (tables.length > 0) {
      console.log('✓ Table verified: newsletter_subscribers')
      
      // Show table structure
      const [columns] = await connection.query(
        'DESCRIBE newsletter_subscribers'
      )
      console.log('\n📋 Table structure:')
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type}`)
      })
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log('\n🔌 Database connection closed')
    }
  }
}

runMigration()
