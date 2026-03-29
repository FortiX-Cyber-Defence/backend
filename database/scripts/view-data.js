#!/usr/bin/env node

/**
 * Database Data Viewer
 * View all data in your MySQL database in table format
 */

// Load environment variables manually
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, 'server', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const { sequelize, User, Service, Industry, BlogPost, JobApplication, ServiceRequest, Contact, DemoRequest, ClientAccessRequest, ActivityLog } = require('./server/models-mysql');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function printHeader(title) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${title.toUpperCase()}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
}

function printTable(data, title) {
  printHeader(title);
  
  if (!data || data.length === 0) {
    console.log(`${colors.yellow}No data found${colors.reset}\n`);
    return;
  }

  console.table(data.map(item => item.toJSON()));
  console.log(`${colors.green}Total Records: ${data.length}${colors.reset}\n`);
}

async function viewAllData() {
  try {
    console.log(`${colors.bright}${colors.blue}Connecting to MySQL database...${colors.reset}`);
    await sequelize.authenticate();
    console.log(`${colors.green}✓ Connected successfully!${colors.reset}\n`);

    // Get counts for all tables
    printHeader('Database Summary');
    const counts = await Promise.all([
      User.count(),
      Service.count(),
      Industry.count(),
      BlogPost.count(),
      JobApplication.count(),
      ServiceRequest.count(),
      Contact.count(),
      DemoRequest.count(),
      ClientAccessRequest.count(),
      ActivityLog.count()
    ]);

    const summary = [
      { Table: 'Users', Records: counts[0] },
      { Table: 'Services', Records: counts[1] },
      { Table: 'Industries', Records: counts[2] },
      { Table: 'Blog Posts', Records: counts[3] },
      { Table: 'Job Applications', Records: counts[4] },
      { Table: 'Service Requests', Records: counts[5] },
      { Table: 'Contacts', Records: counts[6] },
      { Table: 'Demo Requests', Records: counts[7] },
      { Table: 'Client Access Requests', Records: counts[8] },
      { Table: 'Activity Logs', Records: counts[9] }
    ];

    console.table(summary);
    console.log(`${colors.green}Total Tables: 10${colors.reset}\n`);

    // View Users
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    printTable(users, 'Users (Latest 20)');

    // View Services
    const services = await Service.findAll({
      attributes: ['id', 'title', 'slug', 'category', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    printTable(services, 'Services (Latest 20)');

    // View Industries
    const industries = await Industry.findAll({
      attributes: ['id', 'name', 'slug', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    printTable(industries, 'Industries (Latest 20)');

    // View Blog Posts
    const blogPosts = await BlogPost.findAll({
      attributes: ['id', 'title', 'slug', 'category', 'isPublished', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    printTable(blogPosts, 'Blog Posts (Latest 20)');

    // View Demo Requests
    const demoRequests = await DemoRequest.findAll({
      attributes: ['id', 'name', 'email', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    printTable(demoRequests, 'Demo Requests (Latest 20)');

    // View Client Access Requests
    const clientAccessRequests = await ClientAccessRequest.findAll({
      attributes: ['id', 'companyName', 'contactPerson', 'email', 'phone', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    printTable(clientAccessRequests, 'Client Access Requests (Latest 20)');

    // View Contacts
    const contacts = await Contact.findAll({
      attributes: ['id', 'name', 'email', 'subject', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    printTable(contacts, 'Contacts (Latest 20)');

    // View Job Applications
    const jobApplications = await JobApplication.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'position', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    printTable(jobApplications, 'Job Applications (Latest 20)');

    // View Service Requests
    const serviceRequests = await ServiceRequest.findAll({
      attributes: ['id', 'userId', 'serviceId', 'status', 'priority', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    printTable(serviceRequests, 'Service Requests (Latest 20)');

    // View Activity Logs
    const activityLogs = await ActivityLog.findAll({
      attributes: ['id', 'userId', 'action', 'actionType', 'resource', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    printTable(activityLogs, 'Activity Logs (Latest 20)');

    console.log(`${colors.bright}${colors.green}✓ Data retrieval complete!${colors.reset}\n`);

  } catch (error) {
    console.error(`${colors.bright}\x1b[31m✗ Error:${colors.reset}`, error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Ensure MySQL is running');
    console.error('2. Check credentials in server/.env');
    console.error('3. Verify database "fortix_db" exists');
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the viewer
console.log(`${colors.bright}${colors.magenta}`);
console.log('╔════════════════════════════════════════════════════════════════════════════╗');
console.log('║                   FortiX Cyber Defence - Database Viewer                   ║');
console.log('╚════════════════════════════════════════════════════════════════════════════╝');
console.log(colors.reset);

viewAllData();
