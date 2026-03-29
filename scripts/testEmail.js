/**
 * Email Service Test Script
 * Tests the email configuration and sends a test email
 */

require('dotenv').config()
const nodemailer = require('nodemailer')

// Create transporter with your config
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

async function testEmailConnection() {
  console.log('🔍 Testing email configuration...\n')
  
  console.log('Configuration:')
  console.log(`  Host: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}`)
  console.log(`  Port: ${process.env.EMAIL_PORT || 587}`)
  console.log(`  User: ${process.env.EMAIL_USER}`)
  console.log(`  Pass: ${process.env.EMAIL_PASS ? '***configured***' : '❌ NOT SET'}`)
  console.log(`  Admin Email: ${process.env.ADMIN_EMAIL}`)
  console.log(`  HR Email: ${process.env.HR_EMAIL}\n`)

  try {
    // Test connection
    console.log('📡 Testing SMTP connection...')
    await transporter.verify()
    console.log('✅ SMTP connection successful!\n')

    // Send test email
    console.log('📧 Sending test email...')
    const info = await transporter.sendMail({
      from: `"FortiX Cyber Defence Test" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: '✅ Test Email - FortiX Email Service',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { 
              background: #f9f9f9; 
              padding: 30px; 
              border-radius: 0 0 10px 10px; 
            }
            .success-box {
              background: #d4edda;
              border: 1px solid #c3e6cb;
              color: #155724;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .info-row {
              background: white;
              padding: 10px;
              margin: 10px 0;
              border-radius: 5px;
              border-left: 4px solid #667eea;
            }
            .footer { 
              text-align: center; 
              margin-top: 20px; 
              color: #666; 
              font-size: 12px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Email Service Test</h1>
              <p>FortiX Cyber Defence</p>
            </div>
            <div class="content">
              <div class="success-box">
                <strong>🎉 Success!</strong><br>
                Your email service is configured correctly and working properly.
              </div>
              
              <h3>Test Details:</h3>
              
              <div class="info-row">
                <strong>Sent At:</strong> ${new Date().toLocaleString()}
              </div>
              
              <div class="info-row">
                <strong>From:</strong> ${process.env.EMAIL_USER}
              </div>
              
              <div class="info-row">
                <strong>SMTP Host:</strong> ${process.env.EMAIL_HOST || 'smtp.gmail.com'}
              </div>
              
              <div class="info-row">
                <strong>Port:</strong> ${process.env.EMAIL_PORT || 587}
              </div>
              
              <h3>What's Working:</h3>
              <ul>
                <li>✅ SMTP connection established</li>
                <li>✅ Authentication successful</li>
                <li>✅ Email delivery working</li>
                <li>✅ HTML formatting supported</li>
              </ul>
              
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>All email functions are ready to use</li>
                <li>Demo requests will send notifications</li>
                <li>Job applications will trigger emails</li>
                <li>Client access requests will be notified</li>
              </ul>
              
              <p style="margin-top: 20px; color: #666; font-size: 14px;">
                This is an automated test email from your FortiX Cyber Defence application.
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} FortiX Cyber Defence. All rights reserved.</p>
              <p>Email Service Test - ${new Date().toISOString()}</p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    console.log('✅ Test email sent successfully!')
    console.log(`📬 Message ID: ${info.messageId}`)
    console.log(`📧 Sent to: ${process.env.ADMIN_EMAIL || process.env.EMAIL_USER}`)
    console.log('\n🎉 Email service is working correctly!')
    
  } catch (error) {
    console.error('\n❌ Email test failed!')
    console.error('Error:', error.message)
    
    if (error.code === 'EAUTH') {
      console.error('\n💡 Authentication failed. Please check:')
      console.error('  1. EMAIL_USER is correct')
      console.error('  2. EMAIL_PASS is correct (use App Password for Gmail)')
      console.error('  3. For Gmail: Enable 2FA and generate an App Password')
      console.error('     https://myaccount.google.com/apppasswords')
    } else if (error.code === 'ECONNECTION') {
      console.error('\n💡 Connection failed. Please check:')
      console.error('  1. EMAIL_HOST is correct')
      console.error('  2. EMAIL_PORT is correct')
      console.error('  3. Your internet connection')
      console.error('  4. Firewall settings')
    }
    
    process.exit(1)
  }
}

// Run the test
testEmailConnection()
