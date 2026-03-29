/**
 * Database Restore Script
 * Restores a MySQL database from a backup file
 * Usage: node scripts/restore-database.js <backup-file.sql>
 */

require('dotenv').config()
const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')

const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost'
const MYSQL_PORT = process.env.MYSQL_PORT || 3306
const MYSQL_USER = process.env.MYSQL_USER || 'root'
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || 'root'
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'fortix_db'

// Get backup file from command line argument
const backupFile = process.argv[2]

if (!backupFile) {
  console.error('❌ Error: Please provide a backup file')
  console.log('Usage: node scripts/restore-database.js <backup-file.sql>')
  console.log('Example: node scripts/restore-database.js backups/fortix_db_2026-03-10_14-30-00.sql')
  process.exit(1)
}

// Check if file exists
if (!fs.existsSync(backupFile)) {
  console.error(`❌ Error: Backup file not found: ${backupFile}`)
  process.exit(1)
}

console.log('⚠️  WARNING: This will overwrite the current database!')
console.log(`📁 Database: ${MYSQL_DATABASE}`)
console.log(`📂 Backup file: ${backupFile}`)
console.log('')
console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...')

// Wait 5 seconds before proceeding
setTimeout(() => {
  console.log('🔄 Starting database restore...')
  
  // Build mysql command
  const command = `mysql -h ${MYSQL_HOST} -P ${MYSQL_PORT} -u ${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} < "${backupFile}"`
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Restore failed:', error.message)
      process.exit(1)
    }

    if (stderr && !stderr.includes('Warning')) {
      console.error('⚠️  Restore warning:', stderr)
    }

    console.log('✅ Database restored successfully!')
    console.log(`📊 Restored from: ${backupFile}`)
  })
}, 5000)
