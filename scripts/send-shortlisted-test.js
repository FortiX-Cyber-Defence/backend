require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const { sendJobApplicationStatusUpdate } = require('../utils/emailService')

const application = {
  firstName: 'Candidate',
  lastName: '',
  email: '23b01a12b6@svecw.edu.in',
  jobTitle: 'Cybersecurity Analyst',
  status: 'shortlisted'
}

sendJobApplicationStatusUpdate(application, null)
  .then(result => {
    if (result.success) {
      console.log('Shortlisted email sent successfully to', application.email)
    } else {
      console.error('Failed to send email:', result.error)
    }
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err.message)
    process.exit(1)
  })
