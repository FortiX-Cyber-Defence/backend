/**
 * ATS Scoring and Matching System
 * Provides resume scoring, keyword matching, and candidate ranking
 */

/**
 * Calculate years of experience from work history
 */
function calculateYearsOfExperience(experiences) {
  let totalMonths = 0

  experiences.forEach(exp => {
    const months = parseDuration(exp.duration)
    totalMonths += months
  })

  return Math.round((totalMonths / 12) * 10) / 10 // Round to 1 decimal
}

/**
 * Parse duration string to months
 */
function parseDuration(durationStr) {
  if (!durationStr) return 0

  // Extract years
  const yearMatches = durationStr.match(/(\d{4})/g)
  if (!yearMatches || yearMatches.length < 1) return 0

  const startYear = parseInt(yearMatches[0])
  const endYear = yearMatches[1] ? parseInt(yearMatches[1]) : new Date().getFullYear()

  // Extract months
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
  const monthMatches = durationStr.toLowerCase().match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*/g)

  let startMonth = 0
  let endMonth = 11

  if (monthMatches && monthMatches.length > 0) {
    startMonth = monthNames.findIndex(m => monthMatches[0].startsWith(m))
    if (monthMatches.length > 1) {
      endMonth = monthNames.findIndex(m => monthMatches[1].startsWith(m))
    }
  }

  // Check for "Present" or "Current"
  if (/present|current/i.test(durationStr)) {
    const now = new Date()
    return (now.getFullYear() - startYear) * 12 + (now.getMonth() - startMonth)
  }

  return (endYear - startYear) * 12 + (endMonth - startMonth)
}

/**
 * Match keywords in resume
 */
function matchKeywords(parsedData, keywords) {
  if (!keywords || keywords.length === 0) {
    return { matched: [], matchRate: 0, details: {} }
  }

  const allText = [
    parsedData.professional_summary || '',
    parsedData.work_experience?.map(e => e.description).join(' ') || '',
    parsedData.key_skills?.join(' ') || '',
    parsedData.projects?.map(p => p.description + ' ' + p.technologies).join(' ') || ''
  ].join(' ').toLowerCase()

  const matched = []
  const details = {}

  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase()
    const regex = new RegExp(`\\b${keywordLower}\\b`, 'gi')
    const matches = allText.match(regex)
    const count = matches ? matches.length : 0

    if (count > 0) {
      matched.push(keyword)
      details[keyword] = count
    }
  })

  return {
    matched,
    matchRate: Math.round((matched.length / keywords.length) * 100),
    details
  }
}

/**
 * Check if candidate has required degree
 */
function hasRequiredDegree(education, requiredDegree) {
  if (!requiredDegree || !education || education.length === 0) return false

  const degreeMap = {
    'high school': ['high school', 'diploma'],
    'associate': ['associate', 'a.s.', 'a.a.'],
    'bachelor': ['bachelor', 'b.s.', 'b.a.', 'b.tech', 'b.e.'],
    'master': ['master', 'm.s.', 'm.a.', 'm.tech', 'm.e.', 'mba'],
    'phd': ['ph.d.', 'phd', 'doctorate']
  }

  const requiredLevel = requiredDegree.toLowerCase()
  const requiredPatterns = degreeMap[requiredLevel] || [requiredLevel]

  return education.some(edu => {
    const degreeLower = edu.degree.toLowerCase()
    return requiredPatterns.some(pattern => degreeLower.includes(pattern))
  })
}

/**
 * Score resume against job requirements
 */
function scoreResume(parsedData, jobRequirements) {
  const scores = {
    skills: 0,
    experience: 0,
    education: 0,
    keywords: 0,
    completeness: 0
  }

  const weights = {
    skills: 30,
    experience: 25,
    education: 15,
    keywords: 20,
    completeness: 10
  }

  // 1. Skills matching (30 points)
  if (jobRequirements.skills && jobRequirements.skills.length > 0) {
    const candidateSkills = (parsedData.key_skills || []).map(s => s.toLowerCase())
    const matchedSkills = jobRequirements.skills.filter(skill =>
      candidateSkills.some(cs => cs.includes(skill.toLowerCase()))
    )
    scores.skills = (matchedSkills.length / jobRequirements.skills.length) * weights.skills
  }

  // 2. Experience matching (25 points)
  if (jobRequirements.minYears) {
    const yearsExp = calculateYearsOfExperience(parsedData.work_experience || [])
    if (yearsExp >= jobRequirements.minYears) {
      scores.experience = weights.experience
    } else {
      scores.experience = (yearsExp / jobRequirements.minYears) * weights.experience
    }
  }

  // 3. Education matching (15 points)
  if (jobRequirements.degree) {
    if (hasRequiredDegree(parsedData.education || [], jobRequirements.degree)) {
      scores.education = weights.education
    }
  }

  // 4. Keyword matching (20 points)
  if (jobRequirements.keywords && jobRequirements.keywords.length > 0) {
    const keywordMatch = matchKeywords(parsedData, jobRequirements.keywords)
    scores.keywords = (keywordMatch.matchRate / 100) * weights.keywords
  }

  // 5. Resume completeness (10 points)
  const completenessChecks = {
    hasName: !!parsedData.full_name,
    hasEmail: !!parsedData.email,
    hasPhone: !!parsedData.phone,
    hasSummary: (parsedData.professional_summary || '').length > 50,
    hasExperience: (parsedData.work_experience || []).length > 0,
    hasEducation: (parsedData.education || []).length > 0,
    hasSkills: (parsedData.key_skills || []).length >= 3
  }
  const completenessScore = Object.values(completenessChecks).filter(Boolean).length
  scores.completeness = (completenessScore / Object.keys(completenessChecks).length) * weights.completeness

  // Calculate total score
  const totalScore = Math.round(
    scores.skills + scores.experience + scores.education + scores.keywords + scores.completeness
  )

  return {
    totalScore,
    breakdown: scores,
    weights,
    details: {
      yearsOfExperience: calculateYearsOfExperience(parsedData.work_experience || []),
      skillsMatched: jobRequirements.skills ? 
        jobRequirements.skills.filter(skill =>
          (parsedData.key_skills || []).some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
        ) : [],
      hasRequiredEducation: jobRequirements.degree ? 
        hasRequiredDegree(parsedData.education || [], jobRequirements.degree) : null,
      keywordMatches: jobRequirements.keywords ? 
        matchKeywords(parsedData, jobRequirements.keywords) : null
    }
  }
}

/**
 * Assess resume quality
 */
function assessResumeQuality(parsedData) {
  const checks = {
    hasName: !!parsedData.full_name,
    hasEmail: !!parsedData.email,
    hasPhone: !!parsedData.phone,
    hasLinkedIn: !!parsedData.linkedin,
    hasSummary: (parsedData.professional_summary || '').length > 50,
    hasExperience: (parsedData.work_experience || []).length > 0,
    hasEducation: (parsedData.education || []).length > 0,
    hasSkills: (parsedData.key_skills || []).length >= 5,
    hasProjects: (parsedData.projects || []).length > 0,
    hasDetailedExperience: (parsedData.work_experience || []).some(exp => 
      exp.description && exp.description.length > 100
    )
  }

  const score = Object.values(checks).filter(Boolean).length
  const maxScore = Object.keys(checks).length
  const percentage = Math.round((score / maxScore) * 100)

  const recommendations = []
  if (!checks.hasName) recommendations.push('Add your full name at the top')
  if (!checks.hasEmail) recommendations.push('Include a professional email address')
  if (!checks.hasPhone) recommendations.push('Add a contact phone number')
  if (!checks.hasLinkedIn) recommendations.push('Include your LinkedIn profile')
  if (!checks.hasSummary) recommendations.push('Add a professional summary (50+ words)')
  if (!checks.hasExperience) recommendations.push('Include work experience')
  if (!checks.hasEducation) recommendations.push('Add your education background')
  if (!checks.hasSkills) recommendations.push('List at least 5 relevant skills')
  if (!checks.hasProjects) recommendations.push('Consider adding notable projects')
  if (!checks.hasDetailedExperience) recommendations.push('Provide more details in experience descriptions')

  let rating = 'Poor'
  if (percentage >= 90) rating = 'Excellent'
  else if (percentage >= 75) rating = 'Good'
  else if (percentage >= 60) rating = 'Fair'

  return {
    score: percentage,
    rating,
    checks,
    recommendations,
    passedChecks: score,
    totalChecks: maxScore
  }
}

/**
 * Categorize skills by type
 */
function categorizeSkills(skills) {
  const categories = {
    programming: [],
    frameworks: [],
    databases: [],
    cloud: [],
    tools: [],
    soft: [],
    other: []
  }

  const patterns = {
    programming: /\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|Ruby|PHP|Swift|Kotlin|Go|Rust|Scala|R|MATLAB|Perl|HTML|CSS)\b/i,
    frameworks: /\b(React|Angular|Vue|Node\.?js|Express|Django|Flask|Spring|Laravel|Rails|\.NET|ASP\.NET|Next\.?js|Nuxt)\b/i,
    databases: /\b(MySQL|PostgreSQL|MongoDB|Redis|Oracle|SQL\s*Server|SQLite|Cassandra|DynamoDB|Firebase|MariaDB)\b/i,
    cloud: /\b(AWS|Azure|GCP|Google\s*Cloud|Heroku|DigitalOcean|Kubernetes|Docker|Jenkins|CI\/CD|Terraform)\b/i,
    tools: /\b(Git|GitHub|GitLab|Jira|Confluence|Slack|VS\s*Code|IntelliJ|Eclipse|Postman|Figma|Adobe|Photoshop)\b/i,
    soft: /\b(Leadership|Communication|Teamwork|Problem\s*Solving|Agile|Scrum|Project\s*Management)\b/i
  }

  skills.forEach(skill => {
    let categorized = false
    for (const [category, pattern] of Object.entries(patterns)) {
      if (pattern.test(skill)) {
        categories[category].push(skill)
        categorized = true
        break
      }
    }
    if (!categorized) {
      categories.other.push(skill)
    }
  })

  return categories
}

/**
 * Detect duplicate applications
 */
function detectDuplicateApplications(newResume, existingResumes) {
  const duplicates = []

  existingResumes.forEach(existing => {
    const reasons = []

    // Email match (exact)
    if (existing.email && newResume.email && 
        existing.email.toLowerCase() === newResume.email.toLowerCase()) {
      reasons.push('email')
    }

    // Phone match (last 10 digits)
    if (existing.phone && newResume.phone) {
      const existingPhone = existing.phone.replace(/\D/g, '').slice(-10)
      const newPhone = newResume.phone.replace(/\D/g, '').slice(-10)
      if (existingPhone === newPhone) {
        reasons.push('phone')
      }
    }

    // Name similarity (Levenshtein distance)
    if (existing.full_name && newResume.full_name) {
      const similarity = calculateStringSimilarity(
        existing.full_name.toLowerCase(),
        newResume.full_name.toLowerCase()
      )
      if (similarity > 0.85) {
        reasons.push('name')
      }
    }

    if (reasons.length > 0) {
      duplicates.push({
        existingId: existing.id,
        reasons,
        confidence: reasons.length >= 2 ? 'high' : 'medium'
      })
    }
  })

  return duplicates
}

/**
 * Calculate string similarity (Levenshtein distance)
 */
function calculateStringSimilarity(str1, str2) {
  const len1 = str1.length
  const len2 = str2.length
  const matrix = []

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  const distance = matrix[len1][len2]
  const maxLen = Math.max(len1, len2)
  return 1 - (distance / maxLen)
}

module.exports = {
  scoreResume,
  calculateYearsOfExperience,
  matchKeywords,
  hasRequiredDegree,
  assessResumeQuality,
  categorizeSkills,
  detectDuplicateApplications,
  calculateStringSimilarity
}
