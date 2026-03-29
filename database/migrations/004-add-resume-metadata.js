/**
 * Migration: Add Resume Metadata Columns
 * Date: 2026-03-11
 * Description: Adds resumeFileSize and resumeFileType columns for better file tracking
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('job_applications')
    
    // Add resumeFileSize if it doesn't exist
    if (!tableDescription.resumeFileSize) {
      await queryInterface.addColumn('job_applications', 'resumeFileSize', {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Resume file size in bytes'
      })
      console.log('✅ resumeFileSize column added successfully')
    } else {
      console.log('ℹ️  resumeFileSize column already exists, skipping')
    }
    
    // Add resumeFileType if it doesn't exist
    if (!tableDescription.resumeFileType) {
      await queryInterface.addColumn('job_applications', 'resumeFileType', {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Resume MIME type (application/pdf, etc.)'
      })
      console.log('✅ resumeFileType column added successfully')
    } else {
      console.log('ℹ️  resumeFileType column already exists, skipping')
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove columns if rolling back
    const tableDescription = await queryInterface.describeTable('job_applications')
    
    if (tableDescription.resumeFileSize) {
      await queryInterface.removeColumn('job_applications', 'resumeFileSize')
      console.log('✅ resumeFileSize column removed')
    }
    
    if (tableDescription.resumeFileType) {
      await queryInterface.removeColumn('job_applications', 'resumeFileType')
      console.log('✅ resumeFileType column removed')
    }
  }
}
