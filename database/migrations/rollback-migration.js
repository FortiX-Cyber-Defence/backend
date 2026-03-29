/**
 * Migration Rollback
 * Rolls back the last executed migration
 */

const { sequelize } = require('./config/database')
const fs = require('fs')
const path = require('path')

const migrationsDir = path.join(__dirname, 'migrations')

// Get last executed migration
async function getLastMigration() {
  const [results] = await sequelize.query(
    'SELECT name FROM migrations ORDER BY executed_at DESC LIMIT 1'
  )
  return results[0]?.name
}

// Remove migration from tracking
async function removeMigration(name) {
  await sequelize.query('DELETE FROM migrations WHERE name = ?', {
    replacements: [name]
  })
}

// Rollback migration
async function rollbackMigration() {
  try {
    console.log('🔄 Starting rollback...\n')
    
    // Connect to database
    await sequelize.authenticate()
    console.log('✅ Database connected\n')
    
    // Get last migration
    const lastMigration = await getLastMigration()
    
    if (!lastMigration) {
      console.log('ℹ️  No migrations to rollback\n')
      return
    }
    
    console.log(`◀️  Rolling back ${lastMigration}...\n`)
    
    // Load and run down migration
    const migrationFile = path.join(migrationsDir, `${lastMigration}.js`)
    
    if (!fs.existsSync(migrationFile)) {
      throw new Error(`Migration file not found: ${migrationFile}`)
    }
    
    const migration = require(migrationFile)
    await migration.down(sequelize.getQueryInterface(), sequelize.Sequelize)
    await removeMigration(lastMigration)
    
    console.log(`✅ ${lastMigration} rolled back successfully\n`)
    
  } catch (error) {
    console.error('\n❌ Rollback failed:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await sequelize.close()
  }
}

// Run if called directly
if (require.main === module) {
  rollbackMigration()
}

module.exports = { rollbackMigration }
