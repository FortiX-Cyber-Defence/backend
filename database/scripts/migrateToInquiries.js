/**
 * Migration: Merge client_access_requests, contacts, demo_requests, service_requests
 *            into a single `inquiries` table.
 *
 * Run: node scripts/migrateToInquiries.js
 */
require('dotenv').config()
const { sequelize } = require('../config/database')
const Inquiry = require('../models/Inquiry')

async function migrate() {
  try {
    await sequelize.authenticate()
    console.log('✅ DB connected')

    // Create the inquiries table (safe - won't drop existing)
    await Inquiry.sync({ alter: false, force: false })
    // Use raw query to create if not exists with full schema
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        type         ENUM('contact','demo_request','client_access','service_request') NOT NULL,
        name         VARCHAR(100) NOT NULL,
        email        VARCHAR(100) NOT NULL,
        phone        VARCHAR(20),
        company      VARCHAR(100),
        jobTitle     VARCHAR(100),
        subject      VARCHAR(200),
        message      TEXT,
        status       ENUM('pending','in_progress','completed','cancelled','approved','rejected') NOT NULL DEFAULT 'pending',
        priority     ENUM('low','medium','high','urgent') DEFAULT 'medium',
        assignedTo   INT,
        assignedAt   DATETIME,
        response     TEXT,
        adminNotes   TEXT,
        respondedBy  INT,
        respondedAt  DATETIME,
        completedAt  DATETIME,
        userId       INT,
        serviceId    INT,
        requestType  VARCHAR(50),
        createdAt    DATETIME NOT NULL,
        updatedAt    DATETIME NOT NULL,
        INDEX idx_email     (email),
        INDEX idx_type      (type),
        INDEX idx_status    (status),
        INDEX idx_userId    (userId),
        INDEX idx_createdAt (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    console.log('✅ inquiries table ready')

    // ── Migrate contacts ──────────────────────────────────────────────────────
    const [contacts] = await sequelize.query('SELECT * FROM contacts')
    if (contacts.length) {
      for (const c of contacts) {
        await sequelize.query(`
          INSERT IGNORE INTO inquiries
            (id, type, name, email, phone, company, subject, message, status, assignedTo, response, respondedBy, respondedAt, createdAt, updatedAt)
          VALUES (?, 'contact', ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?)
        `, { replacements: [
          c.id + 10000, c.name, c.email, c.phone, c.company,
          c.subject, c.message,
          c.status === 'new' ? 'pending' : c.status === 'read' ? 'in_progress' : c.status === 'replied' ? 'completed' : 'cancelled',
          c.assignedTo, c.response, c.respondedBy, c.respondedAt,
          c.createdAt, c.updatedAt
        ]})
      }
      console.log(`✅ Migrated ${contacts.length} contacts`)
    }

    // ── Migrate client_access_requests ────────────────────────────────────────
    const [cars] = await sequelize.query('SELECT * FROM client_access_requests')
    if (cars.length) {
      for (const r of cars) {
        await sequelize.query(`
          INSERT IGNORE INTO inquiries
            (id, type, name, email, phone, company, subject, message, status, adminNotes, respondedBy, respondedAt, userId, createdAt, updatedAt)
          VALUES (?, 'client_access', ?, ?, ?, ?, 'Client Access Request', ?, ?,
            ?, ?, ?, ?, ?, ?)
        `, { replacements: [
          r.id + 20000, r.contactPerson, r.email, r.phone, r.companyName,
          r.requirements,
          r.status === 'under_review' ? 'in_progress' : r.status,
          r.adminNotes, r.reviewedBy, r.reviewedAt, r.userId,
          r.createdAt, r.updatedAt
        ]})
      }
      console.log(`✅ Migrated ${cars.length} client_access_requests`)
    }

    // ── Migrate demo_requests ─────────────────────────────────────────────────
    const [demos] = await sequelize.query('SELECT * FROM demo_requests')
    if (demos.length) {
      for (const d of demos) {
        await sequelize.query(`
          INSERT IGNORE INTO inquiries
            (id, type, name, email, phone, company, jobTitle, message, status, adminNotes, respondedBy, respondedAt, createdAt, updatedAt)
          VALUES (?, 'demo_request', ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?)
        `, { replacements: [
          d.id + 30000, d.name, d.email, d.phone, d.company, d.jobTitle,
          d.about,
          d.status === 'contacted' ? 'in_progress' : d.status,
          d.notes, d.contactedBy, d.contactedAt,
          d.createdAt, d.updatedAt
        ]})
      }
      console.log(`✅ Migrated ${demos.length} demo_requests`)
    }

    // ── Migrate service_requests ──────────────────────────────────────────────
    const [srs] = await sequelize.query('SELECT * FROM service_requests')
    if (srs.length) {
      for (const s of srs) {
        await sequelize.query(`
          INSERT IGNORE INTO inquiries
            (id, type, name, email, phone, company, subject, message, status, priority,
             assignedTo, assignedAt, response, respondedBy, respondedAt, completedAt,
             userId, serviceId, requestType, createdAt, updatedAt)
          VALUES (?, 'service_request', ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?)
        `, { replacements: [
          s.id + 40000, s.name, s.email, s.phone, s.company,
          s.subject, s.message,
          s.status === 'in-progress' ? 'in_progress' : s.status,
          s.priority,
          s.assignedTo, s.assignedAt, s.response, s.respondedBy, s.respondedAt, s.completedAt,
          s.userId, s.serviceId, s.requestType,
          s.createdAt, s.updatedAt
        ]})
      }
      console.log(`✅ Migrated ${srs.length} service_requests`)
    }

    const [[{ total }]] = await sequelize.query('SELECT COUNT(*) as total FROM inquiries')
    console.log(`\n🎉 Migration complete. Total inquiries: ${total}`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Migration failed:', err.message)
    process.exit(1)
  }
}

migrate()
