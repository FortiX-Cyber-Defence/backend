// Test email configuration
require('dotenv').config()
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

console.log('Testing email configuration...')
console.log('Email User:', process.env.EMAIL_USER)
console.log('Email Host:', process.env.EMAIL_HOST)
console.log('Email Port:', process.env.EMAIL_PORT)
console.log('')

// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration error:')
    console.log(error.message)
    console.log('')
    console.log('Troubleshooting:')
    console.log('1. Make sure EMAIL_USER and EMAIL_PASS are set in .env')
    console.log('2. For Gmail, use App Password (not regular password)')
    console.log('3. Enable 2FA and generate App Password at:')
    console.log('   https://myaccount.google.com/apppasswords')
  } else {
    console.log('✅ Email server is ready to send messages!')
    console.log('')
    
    // Send test email
    console.log('Sending test email...')
    transporter.sendMail({
      from: `"FortiX Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Test Email - FortiX System',
      html: `
        <h2>Email Configuration Test</h2>
        <p>If you're reading this, your email configuration is working correctly!</p>
        <p><strong>Configuration:</strong></p>
        <ul>
          <li>Host: ${process.env.EMAIL_HOST}</li>
          <li>Port: ${process.env.EMAIL_PORT}</li>
          <li>User: ${process.env.EMAIL_USER}</li>
        </ul>
        <p>You can now use the email service for:</p>
        <ul>
          <li>Demo request confirmations</li>
          <li>Client access confirmations</li>
          <li>Job application confirmations</li>
          <li>Status update notifications</li>
        </ul>
      `
    }, (err, info) => {
      if (err) {
        console.log('❌ Failed to send test email:')
        console.log(err.message)
      } else {
        console.log('✅ Test email sent successfully!')
        console.log('Message ID:', info.messageId)
        console.log('')
        console.log('Check your inbox:', process.env.EMAIL_USER)
      }
      process.exit(err ? 1 : 0)
    })
  }
})
