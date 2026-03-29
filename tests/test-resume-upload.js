const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const axios = require('axios')

const API_URL = process.env.API_URL || 'http://localhost:5000'

async function testResumeUpload() {
  console.log('🧪 Testing Resume Upload System...\n')

  try {
    // Create a test PDF file
    const testResumePath = path.join(__dirname, 'test-resume.pdf')
    const testContent = '%PDF-1.4\nTest Resume Content\n%%EOF'
    fs.writeFileSync(testResumePath, testContent)
    console.log('✅ Created test resume file')

    // Prepare form data
    const form = new FormData()
    form.append('jobTitle', 'Cyber Security Analyst')
    form.append('firstName', 'Test')
    form.append('lastName', 'Candidate')
    form.append('email', `test${Date.now()}@example.com`)
    form.append('phone', '+1234567890')
    form.append('experience', '2-3')
    form.append('skills', 'Python, Security, Networking')
    form.append('coverLetter', 'I am very interested in this position.')
    form.append('linkedIn', 'https://linkedin.com/in/testcandidate')
    form.append('resume', fs.createReadStream(testResumePath), {
      filename: 'test-resume.pdf',
      contentType: 'application/pdf'
    })

    console.log('\n📤 Submitting application with resume...')

    // Submit application
    const response = await axios.post(`${API_URL}/api/careers/apply`, form, {
      headers: {
        ...form.getHeaders()
      }
    })

    console.log('\n✅ Application submitted successfully!')
    console.log('Response:', JSON.stringify(response.data, null, 2))

    // Check if resume was uploaded
    const applicationId = response.data.application.id
    const uploadsDir = path.join(__dirname, 'uploads/resumes')
    
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir)
      console.log(`\n📁 Files in uploads/resumes: ${files.length}`)
      if (files.length > 0) {
        console.log('Latest file:', files[files.length - 1])
      }
    }

    // Cleanup test file
    fs.unlinkSync(testResumePath)
    console.log('\n🧹 Cleaned up test file')

    console.log('\n✅ All tests passed!')
    console.log('\n📋 Summary:')
    console.log('   - Application created with ID:', applicationId)
    console.log('   - Resume uploaded:', response.data.application.resumeUploaded)
    console.log('   - Status:', response.data.application.status)
    console.log('\n💡 Check your email for:')
    console.log('   - Candidate confirmation email')
    console.log('   - HR notification email with resume attachment')

  } catch (error) {
    console.error('\n❌ Test failed!')
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', error.response.data)
    } else {
      console.error('Error:', error.message)
    }
    process.exit(1)
  }
}

// Run test
testResumeUpload()
