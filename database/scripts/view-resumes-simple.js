const mysql = require('mysql2/promise')
require('dotenv').config()

async function viewResumes() {
  let connection

  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root',
      database: process.env.MYSQL_DATABASE || 'fortix_db'
    })

    console.log('📊 Connected to database:', process.env.MYSQL_DATABASE)
    console.log('')

    // Get table structure first
    const [columns] = await connection.query('DESCRIBE job_applications')
    
    console.log('📋 Table Columns:')
    columns.forEach(col => {
      if (col.Field.toLowerCase().includes('resume')) {
        console.log(`  ✓ ${col.Field} (${col.Type})`)
      }
    })
    console.log('')

    // Count applications
    const [count] = await connection.query('SELECT COUNT(*) as total FROM job_applications')
    console.log(`📊 Total Applications: ${count[0].total}`)
    console.log('')

    // Count with resumes
    const [resumeCount] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN resume_content IS NOT NULL THEN 1 ELSE 0 END) as with_resume
      FROM job_applications
    `)
    
    console.log(`📄 Applications with Resume Content: ${resumeCount[0].with_resume} / ${resumeCount[0].total}`)
    console.log('')

    // Show recent applications
    const [apps] = await connection.query(`
      SELECT 
        id,
        firstName,
        lastName,
        email,
        resumeFileName,
        resume_file_size,
        resume_file_type,
        CASE WHEN resume_content IS NOT NULL THEN 'YES' ELSE 'NO' END as has_content,
        createdAt
      FROM job_applications
      ORDER BY createdAt DESC
      LIMIT 10
    `)

    console.log('📋 Recent Applications:')
    console.log('-'.repeat(80))
    apps.forEach((app, i) => {
      console.log(`${i + 1}. ${app.firstName} ${app.lastName} (${app.email})`)
      console.log(`   Resume: ${app.resumeFileName || 'N/A'}`)
      console.log(`   Type: ${app.resume_file_type || 'N/A'}`)
      console.log(`   Size: ${app.resume_file_size ? (app.resume_file_size / 1024).toFixed(2) + ' KB' : 'N/A'}`)
      console.log(`   Has Content: ${app.has_content}`)
      console.log(`   Date: ${app.createdAt}`)
      console.log('')
    })

    console.log('✅ Done!')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    if (connection) await connection.end()
  }
}

viewResumes()
