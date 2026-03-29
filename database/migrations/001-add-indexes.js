/**
 * Migration: Add Database Indexes
 * Date: 2026-03-10
 * Description: Adds performance indexes to frequently queried tables
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add indexes to job_applications table
    await queryInterface.addIndex('job_applications', ['jobTitle'], {
      name: 'idx_job_title',
      ifNotExists: true
    })
    
    await queryInterface.addIndex('job_applications', ['appliedAt'], {
      name: 'idx_applied_at',
      ifNotExists: true
    })
    
    await queryInterface.addIndex('job_applications', ['email', 'status'], {
      name: 'idx_email_status',
      ifNotExists: true
    })
    
    await queryInterface.addIndex('job_applications', ['reviewedBy'], {
      name: 'idx_reviewed_by',
      ifNotExists: true
    })
    
    // Add indexes to demo_requests table
    await queryInterface.addIndex('demo_requests', ['email'], {
      name: 'idx_email',
      ifNotExists: true
    })
    
    await queryInterface.addIndex('demo_requests', ['status'], {
      name: 'idx_status',
      ifNotExists: true
    })
    
    await queryInterface.addIndex('demo_requests', ['email', 'status'], {
      name: 'idx_email_status',
      ifNotExists: true
    })
    
    await queryInterface.addIndex('demo_requests', ['createdAt'], {
      name: 'idx_created_at',
      ifNotExists: true
    })
    
    // Add indexes to users table
    await queryInterface.addIndex('users', ['role'], {
      name: 'idx_role',
      ifNotExists: true
    })
    
    await queryInterface.addIndex('users', ['clientStatus'], {
      name: 'idx_client_status',
      ifNotExists: true
    })
    
    await queryInterface.addIndex('users', ['isActive'], {
      name: 'idx_is_active',
      ifNotExists: true
    })
    
    await queryInterface.addIndex('users', ['lastLogin'], {
      name: 'idx_last_login',
      ifNotExists: true
    })
    
    console.log('✅ Indexes added successfully')
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes from job_applications
    await queryInterface.removeIndex('job_applications', 'idx_job_title')
    await queryInterface.removeIndex('job_applications', 'idx_applied_at')
    await queryInterface.removeIndex('job_applications', 'idx_email_status')
    await queryInterface.removeIndex('job_applications', 'idx_reviewed_by')
    
    // Remove indexes from demo_requests
    await queryInterface.removeIndex('demo_requests', 'idx_email')
    await queryInterface.removeIndex('demo_requests', 'idx_status')
    await queryInterface.removeIndex('demo_requests', 'idx_email_status')
    await queryInterface.removeIndex('demo_requests', 'idx_created_at')
    
    // Remove indexes from users
    await queryInterface.removeIndex('users', 'idx_role')
    await queryInterface.removeIndex('users', 'idx_client_status')
    await queryInterface.removeIndex('users', 'idx_is_active')
    await queryInterface.removeIndex('users', 'idx_last_login')
    
    console.log('✅ Indexes removed successfully')
  }
}
