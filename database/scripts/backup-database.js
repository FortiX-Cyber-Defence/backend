/**
 * Database Backup Script
 * Creates a MySQL dump of the database
 * Usage: node scripts/backup-database.js
 */

require('dotenv').config()
const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')

const BACKUP_DIR = path.join(__dirname, '../backups')
const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost'
const MYSQL_PORT = process.env.MYSQL_PORT || 3306
const MYSQL_USER = process.env.MYSQL_USER || 'root'
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || 'root'
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'fortix_db'

// Create backups directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

// Generate backup filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
const time = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-')
const backupFile = path.join(BACKUP_DIR, `${MYSQL_DATABASE}_${timestamp}_${time}.sql`)

// Build mysqldump command
const command = `mysqldump -h ${MYSQL_HOST} -P ${MYSQL_PORT} -u ${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} > "${backupFile}"`

console.log('🔄 Starting database backup...')
console.log(`📁 Database: ${MYSQL_DATABASE}`)
console.log(`📂 Backup location: ${backupFile}`)

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Backup failed:', error.message)
    process.exit(1)
  }

  if (stderr && !stderr.includes('Warning')) {
    console.error('⚠️  Backup warning:', stderr)
  }

  // Check if file was created and has content
  if (fs.existsSync(backupFile)) {
    const stats = fs.statSync(backupFile)
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2)
    
    console.log('✅ Backup completed successfully!')
    console.log(`📊 Backup size: ${fileSizeMB} MB`)
    console.log(`📁 Location: ${backupFile}`)
    
    // Clean up old backups (keep last 7 days)
    cleanOldBackups()
  } else {
    console.error('❌ Backup file was not created')
    process.exit(1)
  }
})

function cleanOldBackups() {
  const files = fs.readdirSync(BACKUP_DIR)
  const sqlFiles = files.filter(f => f.endsWith('.sql'))
  
  if (sqlFiles.length > 7) {
    // Sort by creation time
    const sortedFiles = sqlFiles
      .map(f => ({
        name: f,
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time)
    
    // Delete files older than 7 days
    const filesToDelete = sortedFiles.slice(7)
    
    filesToDelete.forEach(file => {
      const filePath = path.join(BACKUP_DIR, file.name)
      fs.unlinkSync(filePath)
      console.log(`🗑️  Deleted old backup: ${file.name}`)
    })
    
    console.log(`✅ Cleaned up ${filesToDelete.length} old backup(s)`)
  }
}
