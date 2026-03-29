/**
 * ATS-Style Resume Parser
 * Modular, section-based parsing with accurate field mapping
 */

// ============================================
// SECTION DETECTION
// ============================================

/**
 * Detect section boundaries in resume text
 * Returns an object mapping section names to their line ranges
 */
function detectSections(lines) {
  const sections = {}
  const sectionPatterns = {
    contact: /^(contact|personal\s+information|contact\s+information|details)$/i,
    summary: /^(professional\s+summary|summary|profile|objective|career\s+objective|about\s+me|career\s+summary)$/i,
    experience: /^(work\s+experience|professional\s+experience|experience|employment\s+history|work\s+history|career\s+history)$/i,
    education: /^(education|academic\s+background|qualifications|academic\s+qualifications)$/i,
    skills: /^(skills|technical\s+skills|core\s+competencies|key\s+skills|expertise|technologies)$/i,
    projects: /^(projects|academic\s+projects|personal\s+projects|key\s+projects|notable\s+projects)$/i,
    certifications: /^(certifications|certificates|professional\s+certifications|licenses)$/i,
    languages: /^(languages|language\s+proficiency)$/i,
    interests: /^(interests|hobbies|activities|personal\s+interests)$/i,
    achievements: /^(achievements|accomplishments|awards|honors)$/i,
    publications: /^(publications|research|papers)$/i
  }

  let currentSection = null
  let currentStart = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const lineLower = line.toLowerCase()

    // Check if this line is a section header
    for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(lineLower) && line.length < 60) {
        // Save previous section
        if (currentSection) {
          sections[currentSection] = { start: currentStart, end: i - 1 }
        }
        // Start new section
        currentSection = sectionName
        currentStart = i + 1
        break
      }
    }
  }

  // Save last section
  if (currentSection) {
    sections[currentSection] = { start: currentStart, end: lines.length - 1 }
  }

  return sections
}

/**
 * Extract lines for a specific section
 */
function getSectionLines(lines, sections, sectionName) {
  if (!sections[sectionName]) return []
  const { start, end } = sections[sectionName]
  return lines.slice(start, end + 1).filter(line => line.trim().length > 0)
}

// ============================================
// CONTACT INFORMATION EXTRACTION
// ============================================

/**
 * Extract contact information from resume
 * Searches entire document but prioritizes top section
 */
function extractContactInfo(text, lines) {
  const contact = {
    full_name: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    location: ''
  }

  // Extract email
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
  if (emailMatch) contact.email = emailMatch[0].toLowerCase()

  // Extract phone (multiple formats)
  const phonePatterns = [
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,  // US format
    /(\+?\d{1,3}[-.\s]?)?[6-9]\d{9}/,  // Indian format
    /(\+?\d{1,3}[-.\s]?)?\d{10,}/  // Generic
  ]
  for (const pattern of phonePatterns) {
    const phoneMatch = text.match(pattern)
    if (phoneMatch) {
      contact.phone = phoneMatch[0].replace(/\D/g, '').slice(-10)
      break
    }
  }

  // Extract LinkedIn
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i)
  if (linkedinMatch) {
    contact.linkedin = linkedinMatch[0].replace(/^https?:\/\/(www\.)?/, '')
  }

  // Extract GitHub
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i)
  if (githubMatch) {
    contact.github = githubMatch[0].replace(/^https?:\/\/(www\.)?/, '')
  }

  // Extract name (first non-contact line in top 20 lines)
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i].trim()
    
    // Skip lines with contact info, URLs, or common headers
    if (/@|www\.|http|linkedin|github|gmail|phone|\d{5,}/i.test(line)) continue
    if (/resume|curriculum|vitae|cv$/i.test(line)) continue
    
    // Name should be 2-60 chars, letters/spaces/periods only
    if (line.length >= 2 && line.length <= 60 && /^[A-Za-z.\s']+$/.test(line)) {
      const words = line.split(/\s+/).filter(w => w.length > 0)
      if (words.length >= 1 && words.length <= 5) {
        const allWordsValid = words.every(word => word.length >= 2 && word.length <= 20)
        if (allWordsValid) {
          contact.full_name = line
          break
        }
      }
    }
  }

  // Extract location (city, state, country)
  const locationMatch = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2}|\w+)\b/)
  if (locationMatch) {
    contact.location = locationMatch[0]
  }

  return contact
}

// ============================================
// SKILLS EXTRACTION
// ============================================

/**
 * Extract and categorize skills
 * Returns array of skill objects with categories
 */
function extractSkills(sectionLines, fullText) {
  const skills = []
  const skillCategories = {
    programming: /\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|Ruby|PHP|Swift|Kotlin|Go|Rust|Scala|R|MATLAB|Perl)\b/gi,
    frameworks: /\b(React|Angular|Vue|Node\.?js|Express|Django|Flask|Spring|Laravel|Rails|\.NET|ASP\.NET)\b/gi,
    databases: /\b(MySQL|PostgreSQL|MongoDB|Redis|Oracle|SQL\s*Server|SQLite|Cassandra|DynamoDB|Firebase)\b/gi,
    cloud: /\b(AWS|Azure|GCP|Google\s*Cloud|Heroku|DigitalOcean|Kubernetes|Docker|Jenkins|CI\/CD)\b/gi,
    tools: /\b(Git|GitHub|GitLab|Jira|Confluence|Slack|VS\s*Code|IntelliJ|Eclipse|Postman|Figma|Adobe)\b/gi,
    other: /\b(Agile|Scrum|REST|API|GraphQL|Microservices|DevOps|Machine\s*Learning|AI|Data\s*Science)\b/gi
  }

  // Extract from skills section
  if (sectionLines.length > 0) {
    const skillText = sectionLines.join(' ')
    
    // Split by common delimiters
    const skillItems = skillText.split(/[,;|•\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 50)
      .filter(s => !/^(skills|technical|proficient)/i.test(s))
    
    skills.push(...skillItems)
  }

  // Also extract from full text using patterns
  for (const [category, pattern] of Object.entries(skillCategories)) {
    const matches = fullText.match(pattern)
    if (matches) {
      skills.push(...matches)
    }
  }

  // Remove duplicates (case-insensitive)
  const uniqueSkills = []
  const seen = new Set()
  
  for (const skill of skills) {
    const normalized = skill.toLowerCase().trim()
    if (!seen.has(normalized) && normalized.length > 1) {
      seen.add(normalized)
      uniqueSkills.push(skill.trim())
    }
  }

  return uniqueSkills
}

// ============================================
// EXPERIENCE EXTRACTION
// ============================================

/**
 * Extract work experience entries
 * Returns array of experience objects
 */
function extractExperience(sectionLines) {
  const experiences = []
  let currentExp = null
  let lineIndex = 0

  while (lineIndex < sectionLines.length) {
    const line = sectionLines[lineIndex].trim()
    
    // Skip empty lines
    if (!line) {
      lineIndex++
      continue
    }

    // Detect date pattern
    const datePattern = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b|\b(20\d{2}|19\d{2})\b|\b(Present|Current)\b/i
    const hasDates = datePattern.test(line)

    // Check if this looks like a job title line (no dates, not a bullet)
    const looksLikeTitle = !hasDates && !/^[•\-\*]/.test(line) && line.length < 100

    // If we find a title-like line, check next line for dates
    if (looksLikeTitle && lineIndex + 1 < sectionLines.length) {
      const nextLine = sectionLines[lineIndex + 1].trim()
      const nextHasDates = datePattern.test(nextLine)

      if (nextHasDates) {
        // Save previous experience
        if (currentExp && currentExp.description.length > 0) {
          experiences.push(currentExp)
        }

        // Parse title and company from current line
        const titleParts = line.split(/\s*[-–|@]\s*/)
        const title = titleParts[0].trim()
        const company = titleParts[1] ? titleParts[1].trim() : ''

        // Extract dates from next line
        const dates = nextLine.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b|\b(20\d{2}|19\d{2})\b|\b(Present|Current)\b/gi)
        const location = nextLine.replace(datePattern, '').replace(/\|/g, '').trim()

        currentExp = {
          title: title,
          company: company,
          location: location,
          duration: dates ? dates.join(' - ') : '',
          description: []
        }

        lineIndex += 2  // Skip both title and date lines
        continue
      }
    }

    // Add bullet points to current experience
    if (currentExp && /^[•\-\*]/.test(line)) {
      const cleaned = line.replace(/^[•\-\*]\s*/, '').trim()
      if (cleaned.length > 0 && !datePattern.test(cleaned)) {
        currentExp.description.push(cleaned)
      }
    }

    lineIndex++
  }

  // Add last experience
  if (currentExp && currentExp.description.length > 0) {
    experiences.push(currentExp)
  }

  // Format experiences
  return experiences.map(exp => ({
    title: exp.title,
    company: exp.company,
    location: exp.location || '',
    duration: exp.duration,
    description: exp.description.join(' ').substring(0, 500)
  }))
}

// ============================================
// EDUCATION EXTRACTION
// ============================================

/**
 * Extract education entries
 * Returns array of education objects
 */
function extractEducation(sectionLines) {
  const education = []
  let currentEdu = null

  const degreePatterns = /\b(B\.?S\.?|M\.?S\.?|Ph\.?D\.?|Bachelor|Master|MBA|B\.?Tech|M\.?Tech|B\.?E\.?|M\.?E\.?|Associate|Diploma)\b/i

  for (const line of sectionLines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Check if line contains degree or year
    const hasDegree = degreePatterns.test(trimmed)
    const hasYear = /\b(20\d{2}|19\d{2})\b/.test(trimmed)

    if (hasDegree || hasYear) {
      // Save previous education
      if (currentEdu) {
        education.push(currentEdu)
      }

      // Start new education entry
      currentEdu = {
        degree: '',
        institution: '',
        year: '',
        details: []
      }

      // Extract year
      const yearMatch = trimmed.match(/\b(20\d{2}|19\d{2})\b/)
      if (yearMatch) currentEdu.year = yearMatch[0]

      // Extract degree
      const degreeMatch = trimmed.match(degreePatterns)
      if (degreeMatch) {
        currentEdu.degree = trimmed.split(/[-–|]/)[0].trim()
      }

      // Try to extract institution
      const parts = trimmed.split(/[-–|]/)
      if (parts.length > 1) {
        currentEdu.institution = parts[1].replace(/\b(20\d{2}|19\d{2})\b/g, '').trim()
      }
    } else if (currentEdu) {
      // Add details (GPA, honors, etc.)
      currentEdu.details.push(trimmed)
    }
  }

  // Add last education
  if (currentEdu) {
    education.push(currentEdu)
  }

  return education.map(edu => ({
    degree: edu.degree,
    institution: edu.institution,
    year: edu.year,
    details: edu.details.join(', ')
  }))
}

// ============================================
// PROJECT EXTRACTION
// ============================================

/**
 * Extract project entries
 * Returns array of project objects
 */
function extractProjects(sectionLines) {
  const projects = []
  let currentProject = null
  let lastWasEmpty = false

  for (let i = 0; i < sectionLines.length; i++) {
    const line = sectionLines[i].trim()
    
    if (!line) {
      lastWasEmpty = true
      continue
    }

    // Detect project title:
    // 1. Starts with bullet/number
    // 2. Short line after empty line
    // 3. First line in section
    const startsWithBullet = /^[\d•\-\*]/.test(line)
    const isShortAfterEmpty = lastWasEmpty && line.length < 100 && !/^[•\-\*]/.test(line)
    const isFirstLine = i === 0

    const isTitle = startsWithBullet || isShortAfterEmpty || (isFirstLine && line.length < 100)

    if (isTitle) {
      // Save previous project if it has content
      if (currentProject && (currentProject.description.length > 0 || currentProject.technologies.length > 0)) {
        projects.push(currentProject)
      }

      // Start new project
      currentProject = {
        title: line.replace(/^[\d•\-\*]\s*/, '').trim(),
        description: [],
        technologies: []
      }
    } else if (currentProject) {
      // Add to current project
      const cleaned = line.replace(/^[•\-\*]\s*/, '').trim()
      
      // Check if line contains technologies
      if (/\b(technologies|tech stack|built with|using|tools):/i.test(cleaned)) {
        const techMatch = cleaned.match(/:\s*(.+)/)
        if (techMatch) {
          const techs = techMatch[1].split(/[,;]/).map(t => t.trim()).filter(t => t.length > 0)
          currentProject.technologies.push(...techs)
        }
      } else if (cleaned.length > 0) {
        currentProject.description.push(cleaned)
      }
    }

    lastWasEmpty = false
  }

  // Add last project
  if (currentProject && (currentProject.description.length > 0 || currentProject.technologies.length > 0)) {
    projects.push(currentProject)
  }

  return projects.map(proj => ({
    title: proj.title,
    description: proj.description.join(' ').substring(0, 300),
    technologies: proj.technologies.join(', ')
  }))
}

// ============================================
// TEXT CLEANING
// ============================================

/**
 * Clean and enhance text for ATS readability
 */
function cleanText(text) {
  if (!text) return ''

  // Remove duplicate lines
  const lines = text.split('\n')
  const uniqueLines = [...new Set(lines)]
  
  let cleaned = uniqueLines.join('\n')

  // Remove addresses (street numbers, zip codes)
  cleaned = cleaned.replace(/\b\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b/gi, '')
  cleaned = cleaned.replace(/\b\d{5}(-\d{4})?\b/g, '')  // ZIP codes

  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  return cleaned
}

/**
 * Remove contact info from text sections
 */
function removeContactInfo(text) {
  if (!text) return ''

  let cleaned = text

  // Remove emails
  cleaned = cleaned.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '')
  
  // Remove phone numbers
  cleaned = cleaned.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '')
  cleaned = cleaned.replace(/(\+?\d{1,3}[-.\s]?)?[6-9]\d{9}/g, '')
  
  // Remove URLs
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, '')
  cleaned = cleaned.replace(/www\.[^\s]+/g, '')

  return cleaned.replace(/\s+/g, ' ').trim()
}

// ============================================
// MAIN PARSER FUNCTION
// ============================================

/**
 * Parse resume text and return structured JSON
 * @param {string} text - Raw resume text
 * @returns {object} Structured resume data
 */
function parseResume(text) {
  if (!text || text.trim().length === 0) {
    throw new Error('No text content found in resume')
  }

  // Normalize text
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  
  // Split into lines
  const lines = normalizedText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)

  // Detect sections
  const sections = detectSections(lines)

  // Extract contact information
  const contact = extractContactInfo(normalizedText, lines)

  // Extract sections
  const summaryLines = getSectionLines(lines, sections, 'summary')
  const experienceLines = getSectionLines(lines, sections, 'experience')
  const educationLines = getSectionLines(lines, sections, 'education')
  const skillsLines = getSectionLines(lines, sections, 'skills')
  const projectsLines = getSectionLines(lines, sections, 'projects')
  const certLines = getSectionLines(lines, sections, 'certifications')
  const languageLines = getSectionLines(lines, sections, 'languages')
  const interestLines = getSectionLines(lines, sections, 'interests')

  // Parse sections
  const professional_summary = removeContactInfo(cleanText(summaryLines.join(' ')))
  const work_experience = extractExperience(experienceLines)
  const education = extractEducation(educationLines)
  const key_skills = extractSkills(skillsLines, normalizedText)
  const projects = extractProjects(projectsLines)
  
  const certifications = certLines.map(line => 
    line.replace(/^[•\-\*]\s*/, '').trim()
  ).filter(c => c.length > 0)

  const languages = languageLines.map(line => 
    line.replace(/^[•\-\*]\s*/, '').trim()
  ).filter(l => l.length > 0)

  const interests = interestLines.map(line => 
    line.replace(/^[•\-\*]\s*/, '').trim()
  ).filter(i => i.length > 0)

  // Return structured data
  return {
    full_name: contact.full_name,
    email: contact.email,
    phone: contact.phone,
    linkedin: contact.linkedin,
    github: contact.github,
    location: contact.location,
    professional_summary: professional_summary.substring(0, 1000),
    education: education,
    work_experience: work_experience,
    projects: projects,
    key_skills: key_skills,
    languages: languages,
    certifications: certifications,
    interests: interests,
    // Metadata
    parsed_at: new Date().toISOString(),
    parser_version: '2.0.0'
  }
}

module.exports = {
  parseResume,
  detectSections,
  extractContactInfo,
  extractSkills,
  extractExperience,
  extractEducation,
  extractProjects,
  cleanText,
  removeContactInfo
}
