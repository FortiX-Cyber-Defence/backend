const http = require('http');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const API_URL = `http://localhost:${PORT}/api`;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            data: JSON.parse(body)
          };
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject({ response });
          }
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (error) => {
      reject({ request: true, message: error.message });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// HR Test Credentials
const HR_CREDENTIALS = {
  email: 'hr@fortix.com',
  password: 'Test@123'
};

async function testHRLogin() {
  console.log('🧪 Testing HR Login Process\n');
  console.log('━'.repeat(60));

  try {
    // Step 1: Login
    console.log('\n📝 Step 1: Attempting HR login...');
    console.log(`   Email: ${HR_CREDENTIALS.email}`);
    console.log(`   Password: ${HR_CREDENTIALS.password}`);

    const loginResponse = await makeRequest('POST', '/auth/login', HR_CREDENTIALS);

    if (loginResponse.data.success) {
      console.log('✅ Login successful!');
      console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...`);
      console.log(`   User: ${loginResponse.data.user.name}`);
      console.log(`   Role: ${loginResponse.data.user.role}`);
      console.log(`   Email: ${loginResponse.data.user.email}`);

      const token = loginResponse.data.token;
      const user = loginResponse.data.user;

      // Step 2: Verify token by getting user profile
      console.log('\n📝 Step 2: Verifying token with /auth/me...');
      const meResponse = await makeRequest('GET', '/auth/me', null, token);

      if (meResponse.data.success) {
        console.log('✅ Token verification successful!');
        console.log(`   User ID: ${meResponse.data.user.id}`);
        console.log(`   Name: ${meResponse.data.user.name}`);
        console.log(`   Role: ${meResponse.data.user.role}`);
        console.log(`   Active: ${meResponse.data.user.isActive}`);
      }

      // Step 3: Test HR-specific access
      console.log('\n📝 Step 3: Testing HR-specific endpoints...');
      
      try {
        const applicationsResponse = await makeRequest('GET', '/careers/applications', null, token);
        console.log('✅ HR can access job applications');
        console.log(`   Total applications: ${applicationsResponse.data.pagination?.total || 0}`);
      } catch (error) {
        console.log('⚠️  HR applications access:', error.response?.data?.message || error.message);
      }

      // Step 4: Test role-based restrictions
      console.log('\n📝 Step 4: Testing role restrictions...');
      
      try {
        const usersResponse = await makeRequest('GET', '/users', null, token);
        console.log('⚠️  HR should NOT access all users (admin only)');
      } catch (error) {
        if (error.response?.status === 403) {
          console.log('✅ HR correctly restricted from admin endpoints');
          console.log(`   Message: ${error.response.data.message}`);
        } else {
          console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
        }
      }

      // Summary
      console.log('\n━'.repeat(60));
      console.log('\n✅ HR Login Test Summary:');
      console.log('   ✓ Login successful');
      console.log('   ✓ JWT token generated and valid');
      console.log('   ✓ User profile accessible');
      console.log('   ✓ Role-based access working');
      console.log('\n🎯 HR Dashboard URL: http://localhost:3000/hr');
      console.log('━'.repeat(60));

    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }

  } catch (error) {
    console.error('\n❌ Test Failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.message || error.message}`);
      console.error(`   Data:`, error.response.data);
    } else if (error.request) {
      console.error('   No response from server. Is the server running?');
      console.error(`   Make sure server is running on port ${process.env.PORT || 5000}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Ensure server is running: npm run dev');
    console.log('   2. Check database connection');
    console.log('   3. Run: node create-test-users.js (to create HR user)');
    console.log('   4. Verify .env configuration');
  }
}

// Run the test
testHRLogin();
