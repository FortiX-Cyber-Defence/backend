const nodemailer = require('nodemailer')
require('dotenv').config()

console.log('🧪 Testing Nodemailer Configuration\n')
console.log('=' .repeat(60))

// Display configuration
console.log('📧 Email Configuration:')
console.log(`   Host: ${process.env.EMAIL_HOST}`)
console.log(`   Port: ${process.env.EMAIL_PORT}`)
console.log(`   User: ${process.env.EMAIL_USER}`)
console.log(`   Pass: ${process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'NOT SET'}`)
console.log(`   Admin Email: ${process.env.ADMIN_EMAIL}`)
console.log('')

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

async function testEmail() {
  try {
    console.log('🔍 Step 1: Verifying SMTP connection...')
    
    // Verify connection
    await transporter.verify()
    console.log('✅ SMTP connection verified successfully!')
    console.log('')

    console.log('📨 Step 2: Sending test email...')
    
    // Send test email
    const info = await transporter.sendMail({
      from: `"FortiX Cyber Defence Test" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: '✅ Nodemailer Test - FortiX Cyber Defence',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
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
            .info-item {
              margin: 10px 0;
              padding: 10px;
              background: white;
              border-radius: 5px;
            }
            .label {
              font-weight: bold;
              color: #667eea;
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
          <div class="header">
            <h1>✅ Nodemailer Test Successful!</h1>
          </div>
          <div class="content">
            <div class="success-box">
              <strong>🎉 Great News!</strong><br>
              Your nodemailer configuration is working perfectly!
            </div>
            
            <h2>Configuration Details:</h2>
            
            <div class="info-item">
              <span class="label">SMTP Host:</span> ${process.env.EMAIL_HOST}
            </div>
            
            <div class="info-item">
              <span class="label">SMTP Port:</span> ${process.env.EMAIL_PORT}
            </div>
            
            <div class="info-item">
              <span class="label">From Email:</span> ${process.env.EMAIL_USER}
            </div>
            
            <div class="info-item">
              <span class="label">Test Time:</span> ${new Date().toLocaleString()}
            </div>
            
            <h2>What This Means:</h2>
            <ul>
              <li>✅ SMTP connection is working</li>
              <li>✅ Authentication is successful</li>
              <li>✅ Emails can be sent from your application</li>
              <li>✅ All email features are operational</li>
            </ul>
            
            <h2>Email Features Available:</h2>
            <ul>
              <li>📧 Demo request confirmations</li>
              <li>📧 Job application confirmations</li>
              <li>📧 Client access request notifications</li>
              <li>📧 Application status updates</li>
              <li>📧 HR notifications</li>
            </ul>
            
            <p style="margin-top: 20px;">
              <strong>Note:</strong> This is an automated test email from your FortiX Cyber Defence application.
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} FortiX Cyber Defence. All rights reserved.</p>
            <p>This is a test email - no action required.</p>
          </div>
        </body>
        </html>
      `
    })

    console.log('✅ Test email sent successfully!')
    console.log('')
    console.log('📬 Email Details:')
    console.log(`   Message ID: ${info.messageId}`)
    console.log(`   Response: ${info.response}`)
    console.log(`   Accepted: ${info.accepted.join(', ')}`)
    if (info.rejected.length > 0) {
      console.log(`   Rejected: ${info.rejected.join(', ')}`)
    }
    console.log('')
    console.log('=' .repeat(60))
    console.log('✅ All tests passed!')
    console.log('=' .repeat(60))
    console.log('')
    console.log('💡 Next Steps:')
    console.log('   1. Check your inbox: ' + process.env.ADMIN_EMAIL)
    console.log('   2. Look for the test email (check spam folder too)')
    console.log('   3. If received, nodemailer is fully functional!')
    console.log('')

  } catch (error) {
    console.error('')
    console.error('=' .repeat(60))
    console.error('❌ Test Failed!')
    console.error('=' .repeat(60))
    console.error('')
    console.error('Error Details:')
    console.error(`   Type: ${error.name}`)
    console.error(`   Message: ${error.message}`)
    console.error(`   Code: ${error.code || 'N/A'}`)
    console.error('')
    
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication Error - Possible Solutions:')
      console.error('   1. Check if EMAIL_USER and EMAIL_PASS are correct in .env')
      console.error('   2. For Gmail: Enable "Less secure app access" or use App Password')
      console.error('   3. Visit: https://myaccount.google.com/apppasswords')
      console.error('   4. Generate an App Password and use it in EMAIL_PASS')
      console.error('')
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('🌐 Connection Error - Possible Solutions:')
      console.error('   1. Check your internet connection')
      console.error('   2. Verify SMTP host and port are correct')
      console.error('   3. Check if firewall is blocking port 587')
      console.error('   4. Try using port 465 with secure: true')
      console.error('')
    } else {
      console.error('💡 Troubleshooting Tips:')
      console.error('   1. Verify all email settings in .env file')
      console.error('   2. Check Gmail security settings')
      console.error('   3. Ensure 2-Step Verification is enabled for App Passwords')
      console.error('   4. Try generating a new App Password')
      console.error('')
    }
    
    process.exit(1)
  }
}

// Run the test
console.log('🚀 Starting nodemailer test...')
console.log('')
testEmail()
