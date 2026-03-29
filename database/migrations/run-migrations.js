/**
 * Migration Runner
 * Runs all pending migrations in order
 */

const { sequelize } = require('./config/database')
const fs = require('fs')
const path = require('path')

const migrationsDir = path.join(__dirname, 'migrations')

// Create migrations tracking table
async function createMigrationsTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

// Get executed migrations
async function getExecutedMigrations() {
  const [results] = await sequelize.query('SELECT name FROM migrations')
  return results.map(r => r.name)
}

// Mark migration as executed
async function markMigrationExecuted(name) {
  await sequelize.query('INSERT INTO migrations (name) VALUES (?)', {
    replacements: [name]
  })
}

// Run migrations
async function runMigrations() {
  try {
    console.log('🔄 Starting migrations...\n')
    
    // Connect to database
    await sequelize.authenticate()
    console.log('✅ Database connected\n')
    
    // Create migrations table
    await createMigrationsTable()
    
    // Get executed migrations
    const executedMigrations = await getExecutedMigrations()
    console.log(`📊 Executed migrations: ${executedMigrations.length}\n`)
    
    // Get all migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.js'))
      .sort()
    
    console.log(`📁 Found ${migrationFiles.length} migration files\n`)
    
    // Run pending migrations
    let executed = 0
    for (const file of migrationFiles) {
      const migrationName = file.replace('.js', '')
      
      if (executedMigrations.includes(migrationName)) {
        console.log(`⏭️  Skipping ${migrationName} (already executed)`)
        continue
      }
      
      console.log(`▶️  Running ${migrationName}...`)
      
      const migration = require(path.join(migrationsDir, file))
      await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize)
      await markMigrationExecuted(migrationName)
      
      console.log(`✅ ${migrationName} completed\n`)
      executed++
    }
    
    if (executed === 0) {
      console.log('✨ No pending migrations\n')
    } else {
      console.log(`\n🎉 Successfully executed ${executed} migration(s)\n`)
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await sequelize.close()
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations()
}

module.exports = { runMigrations }
