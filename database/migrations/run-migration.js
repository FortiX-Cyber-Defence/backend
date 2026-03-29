// Node.js script to run database migrations
require('dotenv').config()
const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

const colors = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
}

async function runMigrations() {
  console.log(`${colors.cyan}==================================`)
  console.log('FortiX Database Migration Runner')
  console.log(`==================================${colors.reset}\n`)

  // Database configuration
  const config = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'fortix_db',
    multipleStatements: true
  }

  console.log(`${colors.yellow}Database Configuration:${colors.reset}`)
  console.log(`  Host: ${config.host}`)
  console.log(`  User: ${config.user}`)
  console.log(`  Database: ${config.database}\n`)

  let connection

  try {
    // Test connection
    console.log(`${colors.yellow}Checking MySQL connection...${colors.reset}`)
    connection = await mysql.createConnection(config)
    console.log(`${colors.green}✓ MySQL connection successful${colors.reset}\n`)

    // Get migration files
    const migrationsDir = path.join(__dirname, 'migrations')
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()

    if (files.length === 0) {
      console.log(`${colors.yellow}No migration files found${colors.reset}`)
      return
    }

    console.log(`${colors.yellow}Running migrations...${colors.reset}\n`)

    // Run each migration
    for (const file of files) {
      console.log(`${colors.cyan}  → Running: ${file}${colors.reset}`)
      
      const filePath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(filePath, 'utf8')

      try {
        await connection.query(sql)
        console.log(`${colors.green}    ✓ Success${colors.reset}`)
      } catch (error) {
        console.log(`${colors.red}    ✗ Failed${colors.reset}`)
        console.log(`${colors.red}    Error: ${error.message}${colors.reset}`)
        
        // Continue with other migrations even if one fails
        if (error.code === 'ER_TABLE_EXISTS_ALREADY') {
          console.log(`${colors.yellow}    (Table already exists - skipping)${colors.reset}`)
        }
      }
    }

    console.log(`\n${colors.cyan}==================================`)
    console.log(`${colors.green}Migration Complete!${colors.reset}`)
    console.log(`${colors.cyan}==================================${colors.reset}\n`)

    console.log(`${colors.yellow}Next steps:${colors.reset}`)
    console.log('  1. Start the server: npm run dev')
    console.log('  2. Test the API endpoints')
    console.log('  3. Check email configuration\n')

  } catch (error) {
    console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}\n`)
    
    if (error.code === 'ECONNREFUSED') {
      console.log(`${colors.yellow}Troubleshooting:${colors.reset}`)
      console.log('  1. Make sure MySQL is running')
      console.log('  2. Check MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD in .env')
      console.log('  3. Verify MySQL is listening on port 3306\n')
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log(`${colors.yellow}Troubleshooting:${colors.reset}`)
      console.log('  1. Check MYSQL_USER and MYSQL_PASSWORD in .env')
      console.log('  2. Verify user has access to the database\n')
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log(`${colors.yellow}Troubleshooting:${colors.reset}`)
      console.log('  1. Database does not exist')
      console.log('  2. Create it manually or update MYSQL_DATABASE in .env\n')
    }
    
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// Run migrations
runMigrations().catch(error => {
  console.error(`${colors.red}Unexpected error:${colors.reset}`, error)
  process.exit(1)
})
