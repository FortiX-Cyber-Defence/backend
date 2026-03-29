// Sync database using Sequelize models
require('dotenv').config()
const { sequelize } = require('./models')

const colors = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
}

async function syncDatabase() {
  console.log(`${colors.cyan}==================================`)
  console.log('FortiX Database Sync')
  console.log(`==================================${colors.reset}\n`)

  try {
    // Test connection
    console.log(`${colors.yellow}Testing database connection...${colors.reset}`)
    await sequelize.authenticate()
    console.log(`${colors.green}✓ Database connection successful${colors.reset}\n`)

    // Sync all models
    console.log(`${colors.yellow}Syncing database models...${colors.reset}`)
    console.log(`${colors.yellow}(This will create missing tables without dropping existing ones)${colors.reset}\n`)
    
    // Use alter: true to update tables without dropping them
    await sequelize.sync({ alter: true })
    
    console.log(`${colors.green}✓ Database sync complete!${colors.reset}\n`)

    console.log(`${colors.cyan}Tables created/updated:${colors.reset}`)
    const models = Object.keys(sequelize.models)
    models.forEach(model => {
      console.log(`  - ${model}`)
    })

    console.log(`\n${colors.cyan}==================================`)
    console.log(`${colors.green}Sync Complete!${colors.reset}`)
    console.log(`${colors.cyan}==================================${colors.reset}\n`)

    console.log(`${colors.yellow}Next steps:${colors.reset}`)
    console.log('  1. Start the server: npm run dev')
    console.log('  2. Test the API endpoints')
    console.log('  3. Check email configuration\n')

  } catch (error) {
    console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}\n`)
    
    if (error.name === 'SequelizeConnectionRefusedError') {
      console.log(`${colors.yellow}Troubleshooting:${colors.reset}`)
      console.log('  1. Make sure MySQL is running')
      console.log('  2. Check MYSQL_HOST in .env (should be localhost)')
      console.log('  3. Verify MySQL is listening on port 3306\n')
    } else if (error.name === 'SequelizeAccessDeniedError') {
      console.log(`${colors.yellow}Troubleshooting:${colors.reset}`)
      console.log('  1. Check MYSQL_USER and MYSQL_PASSWORD in .env')
      console.log('  2. Verify user has access to the database')
      console.log('  3. Try: mysql -u root -p (to test credentials)\n')
    } else if (error.name === 'SequelizeHostNotFoundError') {
      console.log(`${colors.yellow}Troubleshooting:${colors.reset}`)
      console.log('  1. Check MYSQL_HOST in .env')
      console.log('  2. Make sure MySQL server is accessible\n')
    }
    
    process.exit(1)
  } finally {
    await sequelize.close()
  }
}

// Run sync
syncDatabase().catch(error => {
  console.error(`${colors.red}Unexpected error:${colors.reset}`, error)
  process.exit(1)
})
