const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false
});

// Import User model
const UserModel = require('../models-sqlite/User');
const User = UserModel(sequelize);

// Helper function to format table output
function formatTable(data, columns) {
  if (!data || data.length === 0) {
    return 'No data found';
  }

  // Calculate column widths
  const widths = {};
  columns.forEach(col => {
    widths[col] = Math.max(
      col.length,
      ...data.map(row => String(row[col] || '').length)
    );
  });

  // Create separator line
  const separator = '+' + columns.map(col => '-'.repeat(widths[col] + 2)).join('+') + '+';

  // Create header
  const header = '|' + columns.map(col => ` ${col.padEnd(widths[col])} `).join('|') + '|';

  // Create rows
  const rows = data.map(row => 
    '|' + columns.map(col => ` ${String(row[col] || '').padEnd(widths[col])} `).join('|') + '|'
  );

  return [separator, header, separator, ...rows, separator].join('\n');
}

// Main function to display all data
async function viewAllData() {
  try {
    console.log('\n========================================');
    console.log('   FORTIX CYBER DEFENCE DATABASE');
    console.log('========================================\n');

    // Test connection
    await sequelize.authenticate();
    console.log('✓ Database connection established\n');

    // Get all users
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'company', 'phone', 'isActive', 'createdAt', 'updatedAt'],
      raw: true
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  USERS TABLE (${users.length} records)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (users.length > 0) {
      // Format dates for better readability
      const formattedUsers = users.map(user => ({
        ...user,
        createdAt: new Date(user.createdAt).toLocaleString(),
        updatedAt: new Date(user.updatedAt).toLocaleString(),
        isActive: user.isActive ? 'Yes' : 'No'
      }));

      console.log(formatTable(formattedUsers, [
        'id', 'name', 'email', 'role', 'company', 'phone', 'isActive', 'createdAt', 'updatedAt'
      ]));
    } else {
      console.log('  No users found in database');
    }

    console.log('\n');

    // Get database statistics
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  DATABASE STATISTICS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const stats = {
      'Total Users': users.length,
      'Admin Users': users.filter(u => u.role === 'admin').length,
      'Client Users': users.filter(u => u.role === 'client').length,
      'Active Users': users.filter(u => u.isActive).length,
      'Inactive Users': users.filter(u => !u.isActive).length
    };

    Object.entries(stats).forEach(([key, value]) => {
      console.log(`  ${key.padEnd(20)}: ${value}`);
    });

    console.log('\n========================================\n');

  } catch (error) {
    console.error('Error viewing database data:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
viewAllData();
