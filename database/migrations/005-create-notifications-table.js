const { sequelize } = require('../config/database')
const { QueryTypes } = require('sequelize')

async function up() {
  try {
    console.log('Creating notifications table...')

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
        isRead BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_userId (userId),
        INDEX idx_isRead (isRead),
        INDEX idx_createdAt (createdAt),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `, { type: QueryTypes.RAW })

    console.log('✅ Notifications table created successfully')
  } catch (error) {
    console.error('❌ Error creating notifications table:', error)
    throw error
  }
}

async function down() {
  try {
    console.log('Dropping notifications table...')
    await sequelize.query('DROP TABLE IF EXISTS notifications', { type: QueryTypes.RAW })
    console.log('✅ Notifications table dropped successfully')
  } catch (error) {
    console.error('❌ Error dropping notifications table:', error)
    throw error
  }
}

module.exports = { up, down }
