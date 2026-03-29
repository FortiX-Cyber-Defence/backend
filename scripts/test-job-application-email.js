/**
 * Test script: sends a "Job Application Received" email
 * From: host@fortixcyberdefence.in
 * To:   srinagadhanyata06@gmail.com
 *
 * Run: node backend/scripts/test-job-application-email.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") })
const { sendJobApplicationConfirmation } = require("../utils/emailService")

const testApplication = {
  firstName: "Sri Naga",
  lastName: "Dhanyata",
  email: "srinagadhanyata06@gmail.com",
  jobTitle: "Cybersecurity Analyst"
}

console.log("Sending test job application email...")
console.log(`  From : ${process.env.EMAIL_USER}`)
console.log(`  To   : ${testApplication.email}`)
console.log(`  Host : ${process.env.EMAIL_HOST}`)
console.log("")

sendJobApplicationConfirmation(testApplication)
  .then(result => {
    if (result.success) {
      console.log("✅ Email sent successfully! Check your inbox.")
    } else {
      console.error("❌ Failed to send email:", result.error)
    }
  })
  .catch(err => console.error("❌ Unexpected error:", err.message))
