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
    const migrationPath = path.join(__dirname, 'migrations', '005_add_resume_content_to_applications.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log('🔄 Running resume content migration...')

    // Execute migration
    await connection.query(migrationSQL)

    console.log('✅ Migration completed successfully!')
    console.log('📄 Resume content columns added to job_applications table')

    // Verify columns
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM job_applications WHERE Field IN ('resume_content', 'resume_file_size', 'resume_file_type')"
    )

    if (columns.length > 0) {
      console.log('\n✓ Columns verified:')
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type}`)
      })
    }

    // Check existing applications
    const [stats] = await connection.query(
      'SELECT COUNT(*) as total FROM job_applications'
    )
    console.log(`\n📊 Total applications in database: ${stats[0].total}`)

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
