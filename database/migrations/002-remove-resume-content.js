/**
 * Migration: Remove Resume Content Column
 * Date: 2026-03-10
 * Description: Removes resumeContent column to save database space
 * Resumes are now stored only on disk
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if column exists before removing
    const tableDescription = await queryInterface.describeTable('job_applications')
    
    if (tableDescription.resumeContent) {
      await queryInterface.removeColumn('job_applications', 'resumeContent')
      console.log('✅ resumeContent column removed successfully')
    } else {
      console.log('ℹ️  resumeContent column does not exist, skipping')
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Add column back if needed
    await queryInterface.addColumn('job_applications', 'resumeContent', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      comment: 'Base64 encoded resume file content'
    })
    
    console.log('✅ resumeContent column restored')
  }
}
