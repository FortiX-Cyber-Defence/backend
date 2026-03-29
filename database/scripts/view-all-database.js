const mysql = require('mysql2/promise')
require('dotenv').config()

async function viewAllDatabase() {
  let connection

  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root',
      database: process.env.MYSQL_DATABASE || 'fortix_db'
    })

    console.log('=' .repeat(80))
    console.log('📊 FORTIX DATABASE VIEWER')
    console.log('=' .repeat(80))
    console.log(`Database: ${process.env.MYSQL_DATABASE}`)
    console.log(`Host: ${process.env.MYSQL_HOST}`)
    console.log(`Connected at: ${new Date().toLocaleString()}`)
    console.log('=' .repeat(80))
    console.log('')

    // Get all tables
    const [tables] = await connection.query('SHOW TABLES')
    const tableNames = tables.map(t => Object.values(t)[0])

    console.log(`📋 Total Tables: ${tableNames.length}`)
    console.log('')

    // View each table
    for (const tableName of tableNames) {
      console.log('─'.repeat(80))
      console.log(`📊 TABLE: ${tableName}`)
      console.log('─'.repeat(80))

      // Get table structure
      const [columns] = await connection.query(`DESCRIBE ${tableName}`)
      
      // Get row count
      const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`)
      const rowCount = countResult[0].count

      console.log(`Columns: ${columns.length} | Rows: ${rowCount}`)
      console.log('')

      if (rowCount > 0) {
        // Get all data (limit to 100 rows for large tables)
        const limit = rowCount > 100 ? 100 : rowCount
        const [rows] = await connection.query(`SELECT * FROM ${tableName} LIMIT ${limit}`)

        // Display data
        if (rows.length > 0) {
          rows.forEach((row, index) => {
            console.log(`\n[Row ${index + 1}/${rowCount}]`)
            Object.entries(row).forEach(([key, value]) => {
              // Handle different data types
              let displayValue = value
              
              if (value === null) {
                displayValue = 'NULL'
              } else if (typeof value === 'object' && value instanceof Date) {
                displayValue = value.toLocaleString()
              } else if (typeof value === 'string' && value.length > 100) {
                displayValue = value.substring(0, 100) + '... (truncated)'
              } else if (key.toLowerCase().includes('password') || key.toLowerCase().includes('pass')) {
                displayValue = '****** (hidden)'
              }
              
              console.log(`  ${key}: ${displayValue}`)
            })
          })

          if (rowCount > limit) {
            console.log(`\n... and ${rowCount - limit} more rows`)
          }
        }
      } else {
        console.log('  (No data)')
      }

      console.log('')
    }

    // Summary statistics
    console.log('=' .repeat(80))
    console.log('📊 DATABASE SUMMARY')
    console.log('=' .repeat(80))
    console.log('')

    for (const tableName of tableNames) {
      const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`)
      const count = countResult[0].count
      console.log(`  ${tableName.padEnd(30)} : ${count} rows`)
    }

    console.log('')
    console.log('=' .repeat(80))
    console.log('✅ Database view complete!')
    console.log('=' .repeat(80))
    console.log('')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log('🔌 Database connection closed\n')
    }
  }
}

viewAllDatabase()
