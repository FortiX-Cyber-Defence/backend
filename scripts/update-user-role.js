// Quick script to update a user's role for testing
require('dotenv').config()
const { User } = require('./models')

async function updateUserRole() {
  try {
    const email = process.argv[2]
    const role = process.argv[3]

    if (!email || !role) {
      console.log('Usage: node update-user-role.js <email> <role>')
      console.log('Example: node update-user-role.js user@test.com employee')
      console.log('Available roles: user, client, employee, admin, hr')
      process.exit(1)
    }

    const user = await User.findOne({ where: { email } })

    if (!user) {
      console.log(`❌ User with email ${email} not found`)
      console.log('\nAvailable users:')
      const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role'] })
      console.table(users.map(u => u.toJSON()))
      process.exit(1)
    }

    const oldRole = user.role
    user.role = role
    
    // Set department for employee/hr
    if (role === 'employee') {
      user.department = 'technical'
      user.employeeId = `EMP-${user.id}`
    } else if (role === 'hr') {
      user.department = 'hr'
      user.employeeId = `HR-${user.id}`
    }

    await user.save()

    console.log(`✅ Successfully updated user role`)
    console.log(`   Email: ${email}`)
    console.log(`   Old Role: ${oldRole}`)
    console.log(`   New Role: ${role}`)
    
    if (user.department) {
      console.log(`   Department: ${user.department}`)
      console.log(`   Employee ID: ${user.employeeId}`)
    }

    console.log(`\n🔐 Login credentials:`)
    console.log(`   Email: ${email}`)
    console.log(`   Password: (your existing password)`)
    console.log(`\n🌐 Dashboard URL:`)
    console.log(`   http://localhost:3000/${role}/overview`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    process.exit(0)
  }
}

updateUserRole()
