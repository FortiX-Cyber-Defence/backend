require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const { sequelize } = require('../config/database')

async function run() {
  try {
    await sequelize.authenticate()

    // Check what columns exist
    const [rows] = await sequelize.query('DESCRIBE job_applications')
    const positionCol = rows.find(r => r.Field === 'position')

    if (!positionCol) {
      console.log('ℹ️  No position column found — nothing to fix')
      return
    }

    console.log('Found position column:', positionCol)

    // Make it nullable so inserts without it don't fail
    await sequelize.query(
      'ALTER TABLE job_applications MODIFY COLUMN position VARCHAR(255) NULL DEFAULT NULL'
    )
    console.log('✅ position column is now nullable')
  } catch (err) {
    console.error('❌ Error:', err.message)
  } finally {
    await sequelize.close()
  }
}

run()
