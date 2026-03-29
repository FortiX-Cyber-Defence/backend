const { Sequelize } = require('sequelize')

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'fortix_db',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || 'root',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 2, // Keep minimum 2 connections alive
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  }
)

// Test connection with retry logic
const connectDB = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate()
      console.log('✅ MySQL Database connected successfully')
      
      // Sync models in development (creates tables if they don't exist)
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: false }) // Set to true to auto-update tables
        console.log('✅ Database models synchronized')
      }
      
      return // Success, exit function
    } catch (error) {
      console.error(`❌ Database connection attempt ${i + 1}/${retries} failed:`, error.message)
      
      if (i === retries - 1) {
        console.error('❌ Unable to connect to MySQL database after multiple attempts')
        console.error('Please check:')
        console.error('  1. MySQL server is running')
        console.error('  2. Database credentials are correct')
        console.error('  3. Database exists or can be created')
        process.exit(1)
      }
      
      console.log(`⏳ Retrying in ${delay / 1000} seconds...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

module.exports = { sequelize, connectDB }