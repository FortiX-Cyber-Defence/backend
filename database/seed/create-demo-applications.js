const mysql = require('mysql2/promise');
require('dotenv').config();

const demoApplications = [
  {
    jobTitle: 'Senior Security Analyst',
    jobId: 'SEC-2024-001',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0101',
    position: 'Senior Security Analyst',
    department: 'Security Operations',
    currentCompany: 'CyberTech Solutions',
    experience: '5-7 years',
    education: 'Master in Cybersecurity',
    skills: 'Threat Analysis, SIEM, Incident Response, Python, Security Frameworks',
    coverLetter: 'I am excited to apply for the Senior Security Analyst position. With over 6 years of experience in cybersecurity...',
    linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
    portfolioUrl: 'https://sarahjohnson.dev',
    status: 'under_review',
    expectedSalary: '$95,000 - $110,000',
    availableFrom: new Date('2024-04-01'),
    referralSource: 'LinkedIn',
    appliedAt: new Date('2024-02-15')
  },
  {
    jobTitle: 'Penetration Tester',
    jobId: 'SEC-2024-002',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@email.com',
    phone: '+1-555-0102',
    position: 'Penetration Tester',
    department: 'Security Testing',
    currentCompany: 'SecureNet Inc',
    experience: '3-5 years',
    education: 'Bachelor in Computer Science',
    skills: 'Penetration Testing, Kali Linux, Metasploit, Web Application Security, Network Security',
    coverLetter: 'As a certified ethical hacker with 4 years of experience, I am passionate about identifying vulnerabilities...',
    linkedinUrl: 'https://linkedin.com/in/michaelchen',
    status: 'shortlisted',
    expectedSalary: '$85,000 - $95,000',
    availableFrom: new Date('2024-03-15'),
    referralSource: 'Company Website',
    appliedAt: new Date('2024-02-18')
  },
  {
    jobTitle: 'Security Operations Engineer',
    jobId: 'SEC-2024-003',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '+1-555-0103',
    position: 'Security Operations Engineer',
    department: 'Security Operations',
    currentCompany: 'DataGuard Systems',
    experience: '2-3 years',
    education: 'Bachelor in Information Security',
    skills: 'SOC Operations, Log Analysis, Splunk, IDS/IPS, Firewall Management',
    coverLetter: 'I am writing to express my interest in the Security Operations Engineer role at FortiX...',
    linkedinUrl: 'https://linkedin.com/in/emilyrodriguez',
    status: 'interview_scheduled',
    expectedSalary: '$75,000 - $85,000',
    availableFrom: new Date('2024-03-01'),
    referralSource: 'Employee Referral',
    interviewDate: new Date('2024-03-05 10:00:00'),
    appliedAt: new Date('2024-02-20')
  },
  {
    jobTitle: 'Cybersecurity Consultant',
    jobId: 'SEC-2024-004',
    firstName: 'David',
    lastName: 'Thompson',
    email: 'david.thompson@email.com',
    phone: '+1-555-0104',
    position: 'Cybersecurity Consultant',
    department: 'Consulting',
    currentCompany: 'TechSecure Consulting',
    experience: '7-10 years',
    education: 'Master in Information Systems',
    skills: 'Risk Assessment, Compliance (ISO 27001, NIST), Security Architecture, Client Management',
    coverLetter: 'With over 8 years of experience in cybersecurity consulting, I have helped numerous organizations...',
    linkedinUrl: 'https://linkedin.com/in/davidthompson',
    portfolioUrl: 'https://davidthompson.consulting',
    status: 'submitted',
    expectedSalary: '$110,000 - $130,000',
    availableFrom: new Date('2024-04-15'),
    referralSource: 'Indeed',
    appliedAt: new Date('2024-02-22')
  },
  {
    jobTitle: 'Junior Security Analyst',
    jobId: 'SEC-2024-005',
    firstName: 'Jessica',
    lastName: 'Martinez',
    email: 'jessica.martinez@email.com',
    phone: '+1-555-0105',
    position: 'Junior Security Analyst',
    department: 'Security Operations',
    currentCompany: 'Fresh Graduate',
    experience: '0-1 years',
    education: 'Bachelor in Cybersecurity',
    skills: 'Network Security, Basic Python, Security Fundamentals, Wireshark, CompTIA Security+',
    coverLetter: 'As a recent graduate with a strong passion for cybersecurity, I am eager to start my career...',
    linkedinUrl: 'https://linkedin.com/in/jessicamartinez',
    status: 'under_review',
    expectedSalary: '$55,000 - $65,000',
    availableFrom: new Date('2024-03-01'),
    referralSource: 'University Career Fair',
    appliedAt: new Date('2024-02-25')
  },
  {
    jobTitle: 'Security Architect',
    jobId: 'SEC-2024-006',
    firstName: 'Robert',
    lastName: 'Williams',
    email: 'robert.williams@email.com',
    phone: '+1-555-0106',
    position: 'Security Architect',
    department: 'Architecture',
    currentCompany: 'Enterprise Security Corp',
    experience: '10+ years',
    education: 'Master in Computer Engineering',
    skills: 'Security Architecture, Cloud Security (AWS, Azure), Zero Trust, CISSP, Enterprise Security',
    coverLetter: 'I am excited about the opportunity to bring my 12 years of security architecture experience...',
    linkedinUrl: 'https://linkedin.com/in/robertwilliams',
    portfolioUrl: 'https://robertwilliams.tech',
    status: 'shortlisted',
    expectedSalary: '$140,000 - $160,000',
    availableFrom: new Date('2024-05-01'),
    referralSource: 'LinkedIn',
    appliedAt: new Date('2024-02-10')
  },
  {
    jobTitle: 'Incident Response Specialist',
    jobId: 'SEC-2024-007',
    firstName: 'Amanda',
    lastName: 'Taylor',
    email: 'amanda.taylor@email.com',
    phone: '+1-555-0107',
    position: 'Incident Response Specialist',
    department: 'Incident Response',
    currentCompany: 'RapidResponse Security',
    experience: '4-6 years',
    education: 'Bachelor in Digital Forensics',
    skills: 'Incident Response, Digital Forensics, Malware Analysis, SIEM, Threat Hunting',
    coverLetter: 'With extensive experience in incident response and digital forensics, I am well-prepared...',
    linkedinUrl: 'https://linkedin.com/in/amandataylor',
    status: 'interview_scheduled',
    expectedSalary: '$90,000 - $105,000',
    availableFrom: new Date('2024-03-20'),
    referralSource: 'Company Website',
    interviewDate: new Date('2024-03-08 14:00:00'),
    appliedAt: new Date('2024-02-12')
  },
  {
    jobTitle: 'Security Compliance Analyst',
    jobId: 'SEC-2024-008',
    firstName: 'James',
    lastName: 'Anderson',
    email: 'james.anderson@email.com',
    phone: '+1-555-0108',
    position: 'Security Compliance Analyst',
    department: 'Compliance',
    currentCompany: 'ComplianceFirst Solutions',
    experience: '3-5 years',
    education: 'Bachelor in Business Administration',
    skills: 'GRC, HIPAA, PCI-DSS, SOC 2, Risk Management, Audit Management',
    coverLetter: 'I am writing to apply for the Security Compliance Analyst position. My background in compliance...',
    linkedinUrl: 'https://linkedin.com/in/jamesanderson',
    status: 'rejected',
    expectedSalary: '$80,000 - $90,000',
    availableFrom: new Date('2024-03-01'),
    referralSource: 'Glassdoor',
    reviewNotes: 'Candidate lacks specific industry experience required for this role.',
    appliedAt: new Date('2024-02-08')
  },
  {
    jobTitle: 'Cloud Security Engineer',
    jobId: 'SEC-2024-009',
    firstName: 'Lisa',
    lastName: 'Brown',
    email: 'lisa.brown@email.com',
    phone: '+1-555-0109',
    position: 'Cloud Security Engineer',
    department: 'Cloud Security',
    currentCompany: 'CloudDefense Inc',
    experience: '5-7 years',
    education: 'Master in Cloud Computing',
    skills: 'AWS Security, Azure Security, Kubernetes Security, IAM, Cloud Architecture',
    coverLetter: 'As a cloud security specialist with deep expertise in AWS and Azure, I am excited about...',
    linkedinUrl: 'https://linkedin.com/in/lisabrown',
    portfolioUrl: 'https://lisabrown.cloud',
    status: 'hired',
    expectedSalary: '$105,000 - $120,000',
    availableFrom: new Date('2024-03-15'),
    referralSource: 'Employee Referral',
    reviewNotes: 'Excellent candidate with strong cloud security background. Highly recommended.',
    appliedAt: new Date('2024-02-05')
  },
  {
    jobTitle: 'Threat Intelligence Analyst',
    jobId: 'SEC-2024-010',
    firstName: 'Kevin',
    lastName: 'Lee',
    email: 'kevin.lee@email.com',
    phone: '+1-555-0110',
    position: 'Threat Intelligence Analyst',
    department: 'Threat Intelligence',
    currentCompany: 'ThreatWatch Global',
    experience: '3-5 years',
    education: 'Bachelor in Cybersecurity',
    skills: 'Threat Intelligence, OSINT, Malware Analysis, Threat Hunting, MITRE ATT&CK',
    coverLetter: 'I am passionate about threat intelligence and have spent the last 4 years analyzing emerging threats...',
    linkedinUrl: 'https://linkedin.com/in/kevinlee',
    status: 'under_review',
    expectedSalary: '$85,000 - $100,000',
    availableFrom: new Date('2024-04-01'),
    referralSource: 'LinkedIn',
    appliedAt: new Date('2024-02-28')
  }
];

async function createDemoApplications() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'fortix_db'
    });

    console.log('✅ Connected to database\n');

    // Clear existing demo applications (optional)
    console.log('🗑️  Clearing existing demo applications...');
    await connection.execute(
      `DELETE FROM job_applications WHERE email LIKE '%@email.com'`
    );

    console.log('📝 Creating demo job applications...\n');

    for (const app of demoApplications) {
      await connection.execute(
        `INSERT INTO job_applications (
          jobTitle, jobId, firstName, lastName, email, phone, position, department,
          currentCompany, experience, education, skills, coverLetter, linkedinUrl,
          portfolioUrl, status, expectedSalary, availableFrom, referralSource,
          interviewDate, reviewNotes, appliedAt, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          app.jobTitle, app.jobId, app.firstName, app.lastName, app.email, app.phone,
          app.position, app.department, app.currentCompany, app.experience, app.education,
          app.skills, app.coverLetter, app.linkedinUrl, app.portfolioUrl || null,
          app.status, app.expectedSalary, app.availableFrom, app.referralSource,
          app.interviewDate || null, app.reviewNotes || null, app.appliedAt
        ]
      );

      const statusEmoji = {
        'submitted': '📨',
        'under_review': '👀',
        'shortlisted': '⭐',
        'interview_scheduled': '📅',
        'rejected': '❌',
        'hired': '✅'
      };

      console.log(`${statusEmoji[app.status]} ${app.firstName} ${app.lastName} - ${app.position} (${app.status})`);
    }

    console.log('\n📊 Application Statistics:');
    console.log('━'.repeat(60));
    
    const [stats] = await connection.execute(
      `SELECT 
        status,
        COUNT(*) as count
       FROM job_applications
       WHERE email LIKE '%@email.com'
       GROUP BY status
       ORDER BY FIELD(status, 'submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'rejected', 'hired')`
    );

    stats.forEach(stat => {
      const statusLabels = {
        'submitted': 'Submitted',
        'under_review': 'Under Review',
        'shortlisted': 'Shortlisted',
        'interview_scheduled': 'Interview Scheduled',
        'rejected': 'Rejected',
        'hired': 'Hired'
      };
      console.log(`  ${statusLabels[stat.status]}: ${stat.count}`);
    });

    console.log('\n━'.repeat(60));
    console.log('\n✅ Demo applications created successfully!');
    console.log('\n🎯 Next Steps:');
    console.log('1. Login as HR user: hr@fortix.com / Test@123');
    console.log('2. Navigate to HR Dashboard → Applications');
    console.log('3. View and manage the demo applications\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createDemoApplications();
