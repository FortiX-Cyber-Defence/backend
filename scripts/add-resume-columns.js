require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const { sequelize } = require('../config/database')

async function run() {
  try {
    await sequelize.authenticate()
    await sequelize.query(`
      ALTER TABLE job_applications 
        ADD COLUMN resumeFileSize INT NULL,
        ADD COLUMN resumeFileType VARCHAR(100) NULL
    `)
    console.log('✅ Columns resumeFileSize and resumeFileType added successfully')
  } catch (err) {
    if (err.message.includes('Duplicate column')) {
      console.log('ℹ️  Columns already exist, nothing to do')
    } else {
      console.error('❌ Error:', err.message)
    }
  } finally {
    await sequelize.close()
  }
}

run()
