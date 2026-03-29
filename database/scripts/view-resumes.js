const mysql = require('mysql2/promise')
require('dotenv').config()

async function viewResumes() {
  let connection

  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root',
      database: process.env.MYSQL_DATABASE || 'fortix_db'
    })

    console.log('📊 Connected to MySQL database\n')
    console.log('=' .repeat(80))
    console.log('RESUME DATABASE VIEWER')
    console.log('=' .repeat(80))
    console.log('')

    // Query 1: All applications with resume info
    console.log('📋 All Job Applications with Resume Info:')
    console.log('-'.repeat(80))
    
    const [applications] = await connection.query(`
      SELECT 
        id,
        job_title,
        CONCAT(first_name, ' ', last_name) as full_name,
        email,
        resume_file_name,
        resume_file_size,
        resume_file_type,
        CASE 
          WHEN resume_content IS NOT NULL THEN 'YES'
          ELSE 'NO'
        END as has_resume,
        LENGTH(resume_content) as content_bytes,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as submitted_at
      FROM job_applications
      ORDER BY created_at DESC
    `)

    if (applications.length === 0) {
      console.log('No applications found in database.')
    } else {
      applications.forEach((app, index) => {
        console.log(`\n${index + 1}. Application ID: ${app.id}`)
        console.log(`   Name: ${app.full_name}`)
        console.log(`   Email: ${app.email}`)
        console.log(`   Job: ${app.job_title}`)
        console.log(`   Resume File: ${app.resume_file_name || 'N/A'}`)
        console.log(`   Resume Type: ${app.resume_file_type || 'N/A'}`)
        console.log(`   Resume Size: ${app.resume_file_size ? `${(app.resume_file_size / 1024).toFixed(2)} KB` : 'N/A'}`)
        console.log(`   Has Resume Content: ${app.has_resume}`)
        console.log(`   Content Size: ${app.content_bytes ? `${(app.content_bytes / 1024).toFixed(2)} KB` : 'N/A'}`)
        console.log(`   Submitted: ${app.submitted_at}`)
      })
    }

    // Query 2: Statistics
    console.log('\n' + '='.repeat(80))
    console.log('📊 Resume Statistics:')
    console.log('-'.repeat(80))
    
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN resume_content IS NOT NULL THEN 1 ELSE 0 END) as with_resume,
        SUM(CASE WHEN resume_content IS NULL THEN 1 ELSE 0 END) as without_resume,
        ROUND(SUM(CASE WHEN resume_content IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as resume_percentage
      FROM job_applications
    `)

    const stat = stats[0]
    console.log(`\nTotal Applications: ${stat.total_applications}`)
    console.log(`With Resume: ${stat.with_resume} (${stat.resume_percentage}%)`)
    console.log(`Without Resume: ${stat.without_resume}`)

    // Query 3: Resume file types
    console.log('\n' + '='.repeat(80))
    console.log('📄 Resume File Types:')
    console.log('-'.repeat(80))
    
    const [fileTypes] = await connection.query(`
      SELECT 
        resume_file_type,
        COUNT(*) as count,
        ROUND(AVG(resume_file_size), 2) as avg_size_bytes,
        ROUND(AVG(resume_file_size) / 1024, 2) as avg_size_kb
      FROM job_applications
      WHERE resume_content IS NOT NULL
      GROUP BY resume_file_type
      ORDER BY count DESC
    `)

    if (fileTypes.length === 0) {
      console.log('\nNo resume files found.')
    } else {
      fileTypes.forEach(type => {
        console.log(`\n${type.resume_file_type || 'Unknown'}:`)
        console.log(`  Count: ${type.count}`)
        console.log(`  Avg Size: ${type.avg_size_kb} KB`)
      })
    }

    // Query 4: Latest application per user
    console.log('\n' + '='.repeat(80))
    console.log('👥 Latest Application per User:')
    console.log('-'.repeat(80))
    
    const [userStats] = await connection.query(`
      SELECT 
        email,
        DATE_FORMAT(MAX(created_at), '%Y-%m-%d %H:%i:%s') as latest_application,
        COUNT(*) as total_applications,
        SUM(CASE WHEN resume_content IS NOT NULL THEN 1 ELSE 0 END) as with_resume
      FROM job_applications
      GROUP BY email
      ORDER BY MAX(created_at) DESC
    `)

    if (userStats.length === 0) {
      console.log('\nNo users found.')
    } else {
      userStats.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.email}`)
        console.log(`   Latest: ${user.latest_application}`)
        console.log(`   Total Applications: ${user.total_applications}`)
        console.log(`   With Resume: ${user.with_resume}`)
      })
    }

    console.log('\n' + '='.repeat(80))
    console.log('✅ Resume data retrieved successfully!')
    console.log('='.repeat(80))
    console.log('\n💡 Tips:')
    console.log('  - Resumes are stored as base64 in the resume_content column')
    console.log('  - Use the API endpoint to retrieve: GET /api/careers/last-application/:email')
    console.log('  - View SQL queries in: view-resumes.sql')
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

// Run the script
viewResumes()
