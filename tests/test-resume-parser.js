/**
 * Test Resume Parser
 * Run: node test-resume-parser.js
 */

const { parseResume } = require('./utils/resumeParser')

// Sample resume text
const sampleResume = `
JOHN DOE
john.doe@email.com | +1-555-123-4567 | linkedin.com/in/johndoe | github.com/johndoe
San Francisco, CA

PROFESSIONAL SUMMARY
Experienced Full Stack Developer with 5+ years of expertise in building scalable web applications.
Proficient in modern JavaScript frameworks and cloud technologies. Strong problem-solving skills
and passion for clean, maintainable code.

WORK EXPERIENCE

Senior Software Engineer - Tech Corp Inc
San Francisco, CA | Jan 2021 - Present
• Led development of microservices architecture serving 1M+ users
• Implemented CI/CD pipelines reducing deployment time by 60%
• Mentored team of 5 junior developers
• Technologies: React, Node.js, AWS, Docker, Kubernetes

Software Developer - StartupXYZ
Remote | Jun 2018 - Dec 2020
• Built RESTful APIs handling 10K+ requests per day
• Developed responsive web applications using React and Redux
• Collaborated with cross-functional teams in Agile environment
• Reduced page load time by 40% through optimization

EDUCATION

Bachelor of Science in Computer Science
University of California, Berkeley | 2014 - 2018
GPA: 3.8/4.0 | Dean's List

PROJECTS

E-Commerce Platform
• Built full-stack e-commerce application with payment integration
• Technologies: React, Node.js, MongoDB, Stripe API
• Implemented real-time inventory management system

Weather Dashboard
• Created weather forecasting app using OpenWeather API
• Features: Location-based forecasts, 7-day predictions, interactive maps
• Technologies: Vue.js, Express, PostgreSQL

SKILLS
JavaScript, TypeScript, Python, Java
React, Vue, Angular, Node.js, Express
MongoDB, PostgreSQL, MySQL, Redis
AWS, Docker, Kubernetes, Jenkins
Git, Jira, Agile, REST APIs, GraphQL

CERTIFICATIONS
• AWS Certified Solutions Architect - Associate (2022)
• MongoDB Certified Developer (2021)

LANGUAGES
• English (Native)
• Spanish (Professional Working Proficiency)

INTERESTS
Open source contribution, Tech blogging, Hiking, Photography
`

console.log('='.repeat(80))
console.log('TESTING RESUME PARSER')
console.log('='.repeat(80))

try {
  const result = parseResume(sampleResume)
  
  console.log('\n📋 PARSED RESUME DATA:\n')
  console.log(JSON.stringify(result, null, 2))
  
  console.log('\n' + '='.repeat(80))
  console.log('✅ PARSING SUCCESSFUL')
  console.log('='.repeat(80))
  
  // Validation checks
  console.log('\n🔍 VALIDATION CHECKS:\n')
  console.log(`✓ Name extracted: ${result.full_name ? '✅' : '❌'} (${result.full_name})`)
  console.log(`✓ Email extracted: ${result.email ? '✅' : '❌'} (${result.email})`)
  console.log(`✓ Phone extracted: ${result.phone ? '✅' : '❌'} (${result.phone})`)
  console.log(`✓ LinkedIn extracted: ${result.linkedin ? '✅' : '❌'} (${result.linkedin})`)
  console.log(`✓ GitHub extracted: ${result.github ? '✅' : '❌'} (${result.github})`)
  console.log(`✓ Summary extracted: ${result.professional_summary ? '✅' : '❌'} (${result.professional_summary.substring(0, 50)}...)`)
  console.log(`✓ Experience entries: ${result.work_experience.length} found`)
  console.log(`✓ Education entries: ${result.education.length} found`)
  console.log(`✓ Projects: ${result.projects.length} found`)
  console.log(`✓ Skills: ${result.key_skills.length} found`)
  console.log(`✓ Certifications: ${result.certifications.length} found`)
  console.log(`✓ Languages: ${result.languages.length} found`)
  
  // Check for contact info leakage
  console.log('\n🛡️ CONTACT INFO LEAKAGE CHECK:\n')
  const hasEmailInSummary = result.professional_summary.includes('@')
  const hasPhoneInSummary = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(result.professional_summary)
  console.log(`✓ No email in summary: ${!hasEmailInSummary ? '✅' : '❌'}`)
  console.log(`✓ No phone in summary: ${!hasPhoneInSummary ? '✅' : '❌'}`)
  
} catch (error) {
  console.error('\n❌ ERROR:', error.message)
  console.error(error.stack)
}
