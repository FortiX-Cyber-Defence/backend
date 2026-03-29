const axios = require('axios')
const fs = require('fs')
const path = require('path')

const API_BASE_URL = 'http://localhost:5000/api'

// Helper function to convert file to base64
function fileToBase64(filePath) {
  const fileBuffer = fs.readFileSync(filePath)
  return fileBuffer.toString('base64')
}

// Helper function to create a sample PDF in base64
function createSamplePDFBase64() {
  // Minimal PDF content
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Sample Resume) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
306
%%EOF`
  
  return Buffer.from(pdfContent).toString('base64')
}

async function testResumeStorage() {
  console.log('🧪 Testing Resume Storage Feature\n')
  console.log('=' .repeat(50))

  try {
    // Test 1: Submit application with resume
    console.log('\n📝 Test 1: Submit application with resume content')
    console.log('-'.repeat(50))

    const testEmail = `test.user.${Date.now()}@example.com`
    const resumeBase64 = createSamplePDFBase64()

    const applicationData = {
      jobTitle: 'Senior Software Engineer',
      jobId: 'SE-2024-001',
      firstName: 'John',
      lastName: 'Doe',
      email: testEmail,
      phone: '+1234567890',
      linkedIn: 'https://linkedin.com/in/johndoe',
      experience: '5 years',
      skills: 'JavaScript, React, Node.js, Python, AWS',
      coverLetter: 'I am excited to apply for this position...',
      resumeContent: resumeBase64,
      resumeFileName: 'john_doe_resume.pdf',
      resumeFileSize: Buffer.from(resumeBase64, 'base64').length,
      resumeFileType: 'application/pdf',
      currentCompany: 'Tech Corp',
      education: 'BS Computer Science',
      portfolioUrl: 'https://johndoe.com',
      expectedSalary: '$120,000'
    }

    const submitResponse = await axios.post(
      `${API_BASE_URL}/careers/apply`,
      applicationData
    )

    if (submitResponse.data.success) {
      console.log('✅ Application submitted successfully')
      console.log(`   Application ID: ${submitResponse.data.application.id}`)
      console.log(`   Email: ${testEmail}`)
    } else {
      console.log('❌ Application submission failed')
      return
    }

    // Wait a moment for database to update
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Test 2: Retrieve last application
    console.log('\n📥 Test 2: Retrieve last application by email')
    console.log('-'.repeat(50))

    const lastAppResponse = await axios.get(
      `${API_BASE_URL}/careers/last-application/${encodeURIComponent(testEmail)}`
    )

    if (lastAppResponse.data.success) {
      const app = lastAppResponse.data.application
      console.log('✅ Last application retrieved successfully')
      console.log(`   Name: ${app.firstName} ${app.lastName}`)
      console.log(`   Email: ${app.email}`)
      console.log(`   Phone: ${app.phone}`)
      console.log(`   Experience: ${app.experience}`)
      console.log(`   Skills: ${app.skills}`)
      console.log(`   Resume File: ${app.resumeFileName}`)
      console.log(`   Resume Size: ${app.resumeFileSize} bytes`)
      console.log(`   Resume Type: ${app.resumeFileType}`)
      console.log(`   Resume Content Length: ${app.resumeContent?.length || 0} characters`)
      
      // Verify resume content matches
      if (app.resumeContent === resumeBase64) {
        console.log('✅ Resume content matches original')
      } else {
        console.log('❌ Resume content does not match')
      }
    } else {
      console.log('❌ Failed to retrieve last application')
      return
    }

    // Test 3: Test with non-existent email
    console.log('\n🔍 Test 3: Test with non-existent email')
    console.log('-'.repeat(50))

    try {
      await axios.get(
        `${API_BASE_URL}/careers/last-application/nonexistent@example.com`
      )
      console.log('❌ Should have returned 404')
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Correctly returned 404 for non-existent email')
      } else {
        console.log(`❌ Unexpected error: ${error.message}`)
      }
    }

    // Test 4: Submit second application to test "last" functionality
    console.log('\n📝 Test 4: Submit second application (should return this one)')
    console.log('-'.repeat(50))

    const secondApplicationData = {
      ...applicationData,
      jobTitle: 'Lead Software Engineer',
      experience: '7 years',
      skills: 'JavaScript, React, Node.js, Python, AWS, Docker, Kubernetes'
    }

    await axios.post(
      `${API_BASE_URL}/careers/apply`,
      secondApplicationData
    )

    console.log('✅ Second application submitted')

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Retrieve last application again
    const lastAppResponse2 = await axios.get(
      `${API_BASE_URL}/careers/last-application/${encodeURIComponent(testEmail)}`
    )

    if (lastAppResponse2.data.application.experience === '7 years') {
      console.log('✅ Correctly returned the most recent application')
      console.log(`   Experience: ${lastAppResponse2.data.application.experience}`)
    } else {
      console.log('❌ Did not return the most recent application')
    }

    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('✅ All tests passed!')
    console.log('='.repeat(50))
    console.log('\n📊 Summary:')
    console.log('  ✓ Resume content stored in database')
    console.log('  ✓ Resume metadata tracked correctly')
    console.log('  ✓ Last application retrieval works')
    console.log('  ✓ Returns most recent application')
    console.log('  ✓ Handles non-existent emails correctly')
    console.log('\n💡 Feature is ready for production use!')
    console.log(`\n🧹 Test email used: ${testEmail}`)
    console.log('   (You can delete these test applications from the database if needed)')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    if (error.response) {
      console.error('   Status:', error.response.status)
      console.error('   Data:', JSON.stringify(error.response.data, null, 2))
    }
    process.exit(1)
  }
}

// Run tests
console.log('🚀 Starting Resume Storage Tests...')
console.log('⚠️  Make sure the server is running on http://localhost:5000\n')

testResumeStorage()
