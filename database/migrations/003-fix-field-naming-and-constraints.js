/**
 * Migration: Fix Field Naming and Add Foreign Key Constraints
 * Date: 2026-03-10
 * Description: 
 * - Removes duplicate 'position' field (use 'jobTitle' instead)
 * - Adds proper ON DELETE/ON UPDATE behavior to foreign keys
 * - Ensures data integrity
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Copy any data from 'position' to 'jobTitle' if jobTitle is empty
    await queryInterface.sequelize.query(`
      UPDATE job_applications 
      SET jobTitle = position 
      WHERE (jobTitle IS NULL OR jobTitle = '') AND position IS NOT NULL
    `)
    
    // 2. Check if position column exists before dropping
    const tableDescription = await queryInterface.describeTable('job_applications')
    if (tableDescription.position) {
      await queryInterface.removeColumn('job_applications', 'position')
      console.log('✅ Removed duplicate position column')
    } else {
      console.log('ℹ️  position column does not exist, skipping')
    }

    // 3. Add proper foreign key constraints with ON DELETE/ON UPDATE
    
    // Drop existing foreign keys if they exist (without constraints)
    try {
      await queryInterface.removeConstraint('job_applications', 'job_applications_ibfk_1')
    } catch (err) {
      // Constraint might not exist
    }

    try {
      await queryInterface.removeConstraint('demo_requests', 'demo_requests_ibfk_1')
    } catch (err) {
      // Constraint might not exist
    }

    // Add foreign key with proper constraints for job_applications.reviewedBy
    await queryInterface.addConstraint('job_applications', {
      fields: ['reviewedBy'],
      type: 'foreign key',
      name: 'fk_job_applications_reviewed_by',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    })

    // Add foreign key with proper constraints for demo_requests.contactedBy
    await queryInterface.addConstraint('demo_requests', {
      fields: ['contactedBy'],
      type: 'foreign key',
      name: 'fk_demo_requests_contacted_by',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    })

    console.log('✅ Foreign key constraints added with proper ON DELETE/ON UPDATE behavior')
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Re-add position column
    await queryInterface.addColumn('job_applications', 'position', {
      type: Sequelize.STRING(100),
      allowNull: true
    })

    // Copy jobTitle back to position
    await queryInterface.sequelize.query(`
      UPDATE job_applications 
      SET position = jobTitle
    `)

    // 2. Remove the new foreign key constraints
    await queryInterface.removeConstraint('job_applications', 'fk_job_applications_reviewed_by')
    await queryInterface.removeConstraint('demo_requests', 'fk_demo_requests_contacted_by')

    console.log('✅ Rollback completed')
  }
}
