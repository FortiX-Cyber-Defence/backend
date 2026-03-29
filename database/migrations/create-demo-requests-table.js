/**
 * Migration: Create Demo Requests Table
 * Date: 2026-03-10
 * Description: Creates the demo_requests table with all required fields
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists
    const tables = await queryInterface.showAllTables()
    if (tables.includes('demo_requests')) {
      console.log('ℹ️  demo_requests table already exists, skipping')
      return
    }

    await queryInterface.createTable('demo_requests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      about: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'contacted', 'completed', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      contactedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      contactedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    })

    console.log('✅ demo_requests table created successfully')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('demo_requests')
    console.log('✅ demo_requests table dropped successfully')
  }
}
