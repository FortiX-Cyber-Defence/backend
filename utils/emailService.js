const nodemailer = require("nodemailer")
const fs = require("fs")
const path = require("path")

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "mail.fortixcyberdefence.in",
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || "host@fortixcyberdefence.in",
    pass: process.env.EMAIL_PASS || "FortiXHost@2025"
  }
})

const SENDER_EMAIL = process.env.EMAIL_USER || "host@fortixcyberdefence.in"

function loadTemplate(templateName, data) {
  let template = fs.readFileSync(
    path.join(__dirname, "../templates", templateName),
    "utf8"
  )

  Object.keys(data).forEach(key => {
    template = template.replace(
      new RegExp(`{{${key}}}`, "g"),
      data[key]
    )
  })

  return template
}

const COMPANY_NAME = "FortiX Cyber Defence"

// ================= ADMIN NOTIFICATION =================
const sendAdminNotification = async (demoRequest) => {
  try {
    await transporter.sendMail({
      from: `"FortiX Cyber Defence" <${SENDER_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "New Demo Request – FortiX Cyber Defence",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 5px; }
            .label { font-weight: bold; color: #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 New Demo Request</h1>
            </div>
            <div class="content">
              <h2>Request Details</h2>
              <div class="info-row"><span class="label">Name:</span> ${demoRequest.name}</div>
              <div class="info-row"><span class="label">Email:</span> ${demoRequest.email}</div>
              ${demoRequest.phone ? `<div class="info-row"><span class="label">Phone:</span> ${demoRequest.phone}</div>` : ''}
              ${demoRequest.company ? `<div class="info-row"><span class="label">Company:</span> ${demoRequest.company}</div>` : ''}
              ${demoRequest.jobTitle ? `<div class="info-row"><span class="label">Job Title:</span> ${demoRequest.jobTitle}</div>` : ''}
              <div class="info-row"><span class="label">About / Message:</span><br><p style="margin-top:8px;white-space:pre-wrap;">${demoRequest.about || demoRequest.message || 'N/A'}</p></div>
              <div class="info-row"><span class="label">Submitted At:</span> ${new Date().toLocaleString()}</div>
              <p style="margin-top: 20px;"><strong>Action Required:</strong> Please review this demo request in the Admin Dashboard.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    return { success: true }
  } catch (error) {
    console.error("Admin email error:", error.message)
    return { success: false, error: error.message }
  }
}

// ================= CLIENT CONFIRMATION =================
const sendClientConfirmation = async (demoRequest) => {
  try {
    const html = loadTemplate("demoRequestClient.html", {
      name: demoRequest.name
    })

    await transporter.sendMail({
      from: `"${COMPANY_NAME} IT Team" <${SENDER_EMAIL}>`,
      to: demoRequest.email,
      subject: `Demo Request Received – ${COMPANY_NAME}`,
      html
    })

    return { success: true }
  } catch (error) {
    console.error("Client email error:", error.message)
    return { success: false, error: error.message }
  }
}

// ================= CLIENT ACCESS REQUEST CONFIRMATION =================
const sendClientAccessConfirmation = async (accessRequest) => {
  try {
    const html = loadTemplate("clientAccessRequest.html", {
      name: accessRequest.contactPerson
    })

    await transporter.sendMail({
      from: `"${COMPANY_NAME} IT Team" <${SENDER_EMAIL}>`,
      to: accessRequest.email,
      subject: `Client Access Request Received – ${COMPANY_NAME}`,
      html
    })

    return { success: true }
  } catch (error) {
    console.error("Client access email error:", error.message)
    return { success: false, error: error.message }
  }
}

// ================= JOB APPLICATION CONFIRMATION =================
const sendJobApplicationConfirmation = async (application) => {
  try {
    const html = loadTemplate("jobApplicationReceived.html", {
      name: `${application.firstName} ${application.lastName}`,
      jobRole: application.jobTitle
    })

    await transporter.sendMail({
      from: `"${COMPANY_NAME} HR Team" <${SENDER_EMAIL}>`,
      to: application.email,
      subject: `Application Received – Thank You for Applying`,
      html
    })

    return { success: true }
  } catch (error) {
    console.error("Job application email error:", error.message)
    return { success: false, error: error.message }
  }
}

// ================= HR NOTIFICATION FOR NEW APPLICATION =================
const sendHRNotification = async (application, resumePath) => {
  try {
    const hrEmail = process.env.HR_EMAIL || process.env.ADMIN_EMAIL

    const attachments = []
    if (resumePath && fs.existsSync(resumePath)) {
      attachments.push({
        filename: path.basename(resumePath),
        path: resumePath
      })
    }

    await transporter.sendMail({
      from: `"${COMPANY_NAME} System" <${SENDER_EMAIL}>`,
      to: hrEmail,
      subject: `New Job Application – ${application.jobTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 5px; }
            .label { font-weight: bold; color: #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 New Job Application Received</h1>
            </div>
            <div class="content">
              <h2>Candidate Details</h2>
              
              <div class="info-row">
                <span class="label">Name:</span> ${application.firstName} ${application.lastName}
              </div>
              
              <div class="info-row">
                <span class="label">Position Applied:</span> ${application.jobTitle}
              </div>
              
              <div class="info-row">
                <span class="label">Email:</span> ${application.email}
              </div>
              
              <div class="info-row">
                <span class="label">Phone:</span> ${application.phone}
              </div>
              
              ${application.experience ? `
              <div class="info-row">
                <span class="label">Experience:</span> ${application.experience}
              </div>
              ` : ''}
              
              ${application.linkedinUrl ? `
              <div class="info-row">
                <span class="label">LinkedIn:</span> <a href="${application.linkedinUrl}">${application.linkedinUrl}</a>
              </div>
              ` : ''}
              
              ${application.skills ? `
              <div class="info-row">
                <span class="label">Skills:</span> ${application.skills}
              </div>
              ` : ''}
              
              ${application.coverLetter ? `
              <div class="info-row">
                <span class="label">Cover Letter:</span><br>
                <p style="margin-top: 10px; white-space: pre-wrap;">${application.coverLetter}</p>
              </div>
              ` : ''}
              
              <div class="info-row">
                <span class="label">Applied At:</span> ${new Date(application.appliedAt).toLocaleString()}
              </div>
              
              ${resumePath ? `
              <div class="info-row">
                <span class="label">Resume:</span> Attached to this email
              </div>
              ` : ''}
              
              <p style="margin-top: 20px;">
                <strong>Action Required:</strong> Please review this application in the HR Dashboard.
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments
    })

    return { success: true }
  } catch (error) {
    console.error("HR notification email error:", error.message)
    return { success: false, error: error.message }
  }
}

// ================= JOB APPLICATION STATUS UPDATE =================
const sendJobApplicationStatusUpdate = async (application, oldStatus) => {
  try {
    let subject = ''
    let message = ''
    
    switch (application.status) {
      case 'shortlisted':
        const html = loadTemplate("shortlistedEmail.html", {
          name: `${application.firstName} ${application.lastName}`,
          jobRole: application.jobTitle
        })

        await transporter.sendMail({
          from: `"${COMPANY_NAME} HR Team" <${SENDER_EMAIL}>`,
          to: application.email,
          subject: 'You Have Been Shortlisted – FortiX Cyber Defence',
          html
        })

        return { success: true }
      
      case 'interview_scheduled':
        subject = 'Interview Scheduled'
        message = `
          <p>Great news!</p>
          <p>Your interview for the <strong>${application.jobTitle}</strong> position has been scheduled.</p>
          ${application.interviewDate ? `<p><strong>Interview Date:</strong> ${new Date(application.interviewDate).toLocaleString()}</p>` : ''}
          <p>Our HR team will contact you with further details.</p>
        `
        break
      
      case 'hired':
        subject = 'Congratulations – You\'re Hired!'
        message = `
          <p>Congratulations!</p>
          <p>We are pleased to inform you that you have been selected for the <strong>${application.jobTitle}</strong> position at ${COMPANY_NAME}.</p>
          <p>Our HR team will reach out to you shortly with the next steps and onboarding details.</p>
          <p>Welcome to the team!</p>
        `
        break
      
      case 'rejected':
        subject = 'Application Status Update'
        message = `
          <p>Thank you for your interest in the <strong>${application.jobTitle}</strong> position at ${COMPANY_NAME}.</p>
          <p>After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.</p>
          <p>We appreciate the time you invested in the application process and encourage you to apply for future opportunities that match your skills and experience.</p>
          <p>We wish you all the best in your career endeavors.</p>
        `
        break
      
      default:
        return { success: false, error: 'No email template for this status' }
    }

    await transporter.sendMail({
      from: `"${COMPANY_NAME} HR Team" <${SENDER_EMAIL}>`,
      to: application.email,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${subject}</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${application.firstName} ${application.lastName}</strong>,</p>
              
              ${message}
              
              <p>Best wishes,<br>
              <strong>HR Team ${COMPANY_NAME}</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    return { success: true }
  } catch (error) {
    console.error("Status update email error:", error.message)
    return { success: false, error: error.message }
  }
}

// ================= CLIENT WELCOME EMAIL WITH CREDENTIALS =================
const sendClientWelcomeEmail = async (user, tempPassword, accessRequest) => {
  try {
    await transporter.sendMail({
      from: `"${COMPANY_NAME} IT Team" <${SENDER_EMAIL}>`,
      to: user.email,
      subject: `Welcome to ${COMPANY_NAME} - Your Account is Ready`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to ${COMPANY_NAME}!</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${user.name}</strong>,</p>
              
              <p>Your client access request has been approved! We're excited to have you on board.</p>
              
              <div class="credentials">
                <h3>🔐 Your Login Credentials</h3>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px; font-size: 14px;">${tempPassword}</code></p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong>
                <ul style="margin: 10px 0;">
                  <li>Please change your password immediately after your first login</li>
                  <li>Do not share your credentials with anyone</li>
                  <li>This temporary password will expire in 7 days</li>
                </ul>
              </div>
              
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">
                  Login to Your Account
                </a>
              </p>
              
              <h3>What's Next?</h3>
              <ul>
                <li>Log in to your client portal</li>
                <li>Complete your profile setup</li>
                <li>Explore our cybersecurity services</li>
                <li>Access your security dashboard</li>
              </ul>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              
              <p>Best regards,<br>
              <strong>IT Team<br>${COMPANY_NAME}</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    return { success: true }
  } catch (error) {
    console.error("Client welcome email error:", error.message)
    return { success: false, error: error.message }
  }
}

// ================= CLIENT ACCESS REJECTION EMAIL =================
const sendClientAccessRejectionEmail = async (request, reason) => {
  try {
    await transporter.sendMail({
      from: `"${COMPANY_NAME} IT Team" <${SENDER_EMAIL}>`,
      to: request.email,
      subject: `Client Access Request Update - ${COMPANY_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Client Access Request Update</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${request.name}</strong>,</p>
              
              <p>Thank you for your interest in ${COMPANY_NAME} services.</p>
              
              <p>After careful review, we are unable to approve your client access request at this time.</p>
              
              ${reason ? `
              <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
                <strong>Reason:</strong><br>
                ${reason}
              </div>
              ` : ''}
              
              <p>If you have any questions or would like to discuss this further, please feel free to contact us.</p>
              
              <p>We appreciate your understanding and wish you the best.</p>
              
              <p>Best regards,<br>
              <strong>IT Team<br>${COMPANY_NAME}</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    return { success: true }
  } catch (error) {
    console.error("Rejection email error:", error.message)
    return { success: false, error: error.message }
  }
}

// ================= CLIENT ACCESS REQUEST NOTIFICATION TO IT TEAM =================
const sendClientAccessRequestNotification = async (request) => {
  try {
    await transporter.sendMail({
      from: `"${COMPANY_NAME} System" <${SENDER_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Client Access Request - ${request.company}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 5px; }
            .label { font-weight: bold; color: #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 New Client Access Request</h1>
            </div>
            <div class="content">
              <h2>Request Details</h2>
              
              <div class="info-row">
                <span class="label">Name:</span> ${request.name}
              </div>
              
              <div class="info-row">
                <span class="label">Email:</span> ${request.email}
              </div>
              
              <div class="info-row">
                <span class="label">Company:</span> ${request.company}
              </div>
              
              <div class="info-row">
                <span class="label">Phone:</span> ${request.phone}
              </div>
              
              <div class="info-row">
                <span class="label">Message:</span><br>
                <p style="margin-top: 10px; white-space: pre-wrap;">${request.message}</p>
              </div>
              
              <div class="info-row">
                <span class="label">Submitted At:</span> ${new Date(request.createdAt).toLocaleString()}
              </div>
              
              <p style="margin-top: 20px;">
                <strong>Action Required:</strong> Please review this request in the Admin Dashboard.
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    return { success: true }
  } catch (error) {
    console.error("IT notification email error:", error.message)
    return { success: false, error: error.message }
  }
}

// ================= CONTACT FORM NOTIFICATION TO ADMIN =================
const sendContactNotificationToAdmin = async (contact) => {
  try {
    await transporter.sendMail({
      from: `"${COMPANY_NAME} System" <${SENDER_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Submission - ${contact.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 5px; }
            .label { font-weight: bold; color: #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 New Contact Form Submission</h1>
            </div>
            <div class="content">
              <h2>Contact Details</h2>
              
              <div class="info-row">
                <span class="label">Name:</span> ${contact.name}
              </div>
              
              <div class="info-row">
                <span class="label">Email:</span> ${contact.email}
              </div>
              
              ${contact.company ? `
              <div class="info-row">
                <span class="label">Company:</span> ${contact.company}
              </div>
              ` : ''}
              
              ${contact.phone ? `
              <div class="info-row">
                <span class="label">Phone:</span> ${contact.phone}
              </div>
              ` : ''}
              
              <div class="info-row">
                <span class="label">Subject:</span> ${contact.subject}
              </div>
              
              <div class="info-row">
                <span class="label">Message:</span><br>
                <p style="margin-top: 10px; white-space: pre-wrap;">${contact.message}</p>
              </div>
              
              <div class="info-row">
                <span class="label">Submitted At:</span> ${new Date(contact.createdAt).toLocaleString()}
              </div>
              
              <p style="margin-top: 20px;">
                <strong>Action Required:</strong> Please respond to this inquiry in the Admin Dashboard.
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    return { success: true }
  } catch (error) {
    console.error("Contact notification email error:", error.message)
    return { success: false, error: error.message }
  }
}

// ================= USER REGISTRATION WELCOME EMAIL =================
const sendWelcomeEmail = async (user) => {
  try {
    await transporter.sendMail({
      from: `"${COMPANY_NAME}" <${SENDER_EMAIL}>`,
      to: user.email,
      subject: `Welcome to ${COMPANY_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${COMPANY_NAME}!</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${user.name}</strong>,</p>
              <p>Thank you for registering with <strong>${COMPANY_NAME}</strong>. Your account has been successfully created.</p>
              <p>We're glad to have you with us. You can now log in and explore our cybersecurity services.</p>
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">
                  Go to Login
                </a>
              </p>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Best regards,<br><strong>${COMPANY_NAME} Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })
    return { success: true }
  } catch (error) {
    console.error("Welcome email error:", error.message)
    return { success: false, error: error.message }
  }
}

// ================= CLIENT ISSUE – USER CONFIRMATION =================
const sendClientIssueConfirmation = async ({ user, serviceName, issueType, description, requestId }) => {
  try {
    await transporter.sendMail({
      from: `"FortiX Cyber Defence" <${SENDER_EMAIL}>`,
      to: user.email,
      replyTo: 'info@fortixcyberdefence.in',
      subject: `Issue Received – ${serviceName || 'Your Service'} | Ticket #${requestId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
          <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#1E3A8A 0%,#0EA5E9 100%);padding:36px 32px;text-align:center;">
              <h1 style="color:white;margin:0;font-size:22px;">FortiX Cyber Defence</h1>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Support Ticket Received</p>
            </div>
            <div style="padding:36px 32px;">
              <p style="font-size:16px;color:#111827;margin:0 0 16px;">Hi <strong>${user.name}</strong>,</p>
              <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">
                We've received your issue report and our IT team has been notified. You can expect a response within <strong>4–8 business hours</strong>.
              </p>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:24px;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:8px 0;color:#64748b;font-size:13px;width:140px;">Ticket ID</td>
                    <td style="padding:8px 0;font-weight:700;color:#1E3A8A;font-size:13px;">#${requestId}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#64748b;font-size:13px;">Service</td>
                    <td style="padding:8px 0;font-size:13px;">${serviceName || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#64748b;font-size:13px;">Issue Type</td>
                    <td style="padding:8px 0;font-size:13px;">${issueType}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#64748b;font-size:13px;vertical-align:top;">Description</td>
                    <td style="padding:8px 0;font-size:13px;line-height:1.6;">${description}</td>
                  </tr>
                </table>
              </div>
              <div style="background:#f0f9ff;border-left:4px solid #0EA5E9;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
                <p style="margin:0;color:#0369a1;font-size:14px;">
                  📧 For urgent escalation, contact us at
                  <a href="mailto:info@fortixcyberdefence.in" style="color:#0EA5E9;text-decoration:none;font-weight:600;">info@fortixcyberdefence.in</a>
                </p>
              </div>
            </div>
            <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} FortiX Cyber Defence. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })
  } catch (error) {
    console.error('Client issue confirmation email error:', error.message)
  }
}

// ================= CLIENT ISSUE – IT TEAM ALERT =================
const sendClientIssueToITTeam = async ({ user, serviceName, issueType, description, priority, requestId }) => {
  try {
    const priorityColor = { urgent: '#dc2626', high: '#ea580c', medium: '#d97706', low: '#16a34a' }
    const pColor = priorityColor[priority] || '#d97706'

    await transporter.sendMail({
      from: `"FortiX Chatbot" <${SENDER_EMAIL}>`,
      to: 'itteam@fortixcyberdefence.in',
      replyTo: user.email,
      subject: `[Support #${requestId}] ${serviceName} – ${issueType} (${(priority || 'medium').toUpperCase()})`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:linear-gradient(135deg,#1E3A8A,#0EA5E9);color:white;padding:24px;border-radius:8px 8px 0 0;">
            <h2 style="margin:0;">Client Support Issue</h2>
            <p style="margin:6px 0 0;opacity:0.85;font-size:14px;">Ticket #${requestId} · Submitted via Chatbot</p>
          </div>
          <div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;">
            <div style="display:inline-block;background:${pColor};color:white;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;margin-bottom:20px;text-transform:uppercase;">
              ${priority || 'medium'} priority
            </div>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#6b7280;width:140px;font-size:14px;">Client Name</td><td style="padding:8px 0;font-weight:600;font-size:14px;">${user.name}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Email</td><td style="padding:8px 0;font-size:14px;"><a href="mailto:${user.email}" style="color:#1E3A8A;">${user.email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Company</td><td style="padding:8px 0;font-size:14px;">${user.company || 'N/A'}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Service</td><td style="padding:8px 0;font-size:14px;">${serviceName || 'N/A'}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Issue Type</td><td style="padding:8px 0;font-size:14px;">${issueType}</td></tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;font-size:14px;vertical-align:top;">Description</td>
                <td style="padding:8px 0;font-size:14px;line-height:1.6;">${description}</td>
              </tr>
            </table>
            <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">Submitted: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
            </div>
          </div>
        </div>
      `
    })
  } catch (error) {
    console.error('Client issue IT team email error:', error.message)
  }
}
const sendChatLeadNotification = async ({ userType, name, email, phone, requirement, jobRole }) => {
  try {
    const typeLabel = userType === 'client' ? 'Client Inquiry' : userType === 'applicant' ? 'Job Applicant' : 'Visitor'
    await transporter.sendMail({
      from: `"FortiX Chatbot" <${SENDER_EMAIL}>`,
      to: process.env.ADMIN_EMAIL || 'info@fortixcyberdefence.in',
      subject: `New Chatbot Lead – ${typeLabel}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:linear-gradient(135deg,#1E3A8A,#0EA5E9);color:white;padding:24px;border-radius:8px 8px 0 0;">
            <h2 style="margin:0;">New Chatbot Lead</h2>
            <p style="margin:4px 0 0;opacity:0.85;">${typeLabel}</p>
          </div>
          <div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#6b7280;width:140px;">Name</td><td style="padding:8px 0;font-weight:600;">${name || 'N/A'}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Email</td><td style="padding:8px 0;">${email || 'N/A'}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Phone</td><td style="padding:8px 0;">${phone || 'N/A'}</td></tr>
              ${requirement ? `<tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">Requirement</td><td style="padding:8px 0;">${requirement}</td></tr>` : ''}
              ${jobRole ? `<tr><td style="padding:8px 0;color:#6b7280;">Job Role</td><td style="padding:8px 0;">${jobRole}</td></tr>` : ''}
            </table>
            <p style="margin-top:20px;font-size:12px;color:#9ca3af;">Submitted via FortiX AI Chatbot</p>
          </div>
        </div>
      `
    })
  } catch (error) {
    console.error('Chat lead notification email error:', error.message)
  }
}

// ================= CHATBOT USER CONFIRMATION =================
const sendChatUserConfirmation = async ({ email, name, userType }) => {
  if (!email) return
  try {
    const isApplicant = userType === 'applicant'
    const greeting = name ? `Hi ${name},` : 'Hi there,'
    const bodyText = isApplicant
      ? `Thank you for your interest in joining FortiX Cyber Defence! Our HR team has received your details and will review your profile shortly. We'll be in touch soon.`
      : `Thank you for reaching out to FortiX Cyber Defence! Our team has received your inquiry and will get back to you within 24 hours with a tailored response.`
    const ctaText = isApplicant ? 'View Open Positions' : 'Explore Our Services'
    const ctaLink = isApplicant
      ? 'https://fortixcyberdefence.in/careers'
      : 'https://fortixcyberdefence.in/services'

    await transporter.sendMail({
      from: `"FortiX Cyber Defence" <${SENDER_EMAIL}>`,
      to: email,
      replyTo: 'info@fortixcyberdefence.in',
      subject: isApplicant
        ? 'We received your application – FortiX Cyber Defence'
        : 'We received your inquiry – FortiX Cyber Defence',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
          <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#1E3A8A 0%,#0EA5E9 100%);padding:36px 32px;text-align:center;">
              <h1 style="color:white;margin:0;font-size:22px;letter-spacing:0.5px;">FortiX Cyber Defence</h1>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Your trusted cybersecurity partner</p>
            </div>
            <div style="padding:36px 32px;">
              <p style="font-size:16px;color:#111827;margin:0 0 16px;">${greeting}</p>
              <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">${bodyText}</p>
              <div style="background:#f0f9ff;border-left:4px solid #0EA5E9;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
                <p style="margin:0;color:#0369a1;font-size:14px;">
                  📧 For urgent matters, reply to this email or contact us directly at
                  <a href="mailto:info@fortixcyberdefence.in" style="color:#0EA5E9;text-decoration:none;font-weight:600;">info@fortixcyberdefence.in</a>
                </p>
              </div>
              <div style="text-align:center;">
                <a href="${ctaLink}" style="display:inline-block;background:linear-gradient(135deg,#1E3A8A,#0EA5E9);color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">${ctaText}</a>
              </div>
            </div>
            <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} FortiX Cyber Defence. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })
  } catch (error) {
    console.error('Chat user confirmation email error:', error.message)
  }
}

module.exports = {
  sendAdminNotification,
  sendClientConfirmation,
  sendClientAccessConfirmation,
  sendJobApplicationConfirmation,
  sendJobApplicationStatusUpdate,
  sendHRNotification,
  sendClientWelcomeEmail,
  sendClientAccessRejectionEmail,
  sendClientAccessRequestNotification,
  sendContactNotificationToAdmin,
  sendWelcomeEmail,
  sendChatLeadNotification,
  sendChatUserConfirmation,
  sendClientIssueConfirmation,
  sendClientIssueToITTeam
}
