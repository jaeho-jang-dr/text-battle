const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123!';

async function testAdminAPIs() {
  console.log('Testing Admin API Endpoints...\n');

  try {
    // First, we need to login as admin via NextAuth
    console.log('Note: Admin authentication requires logging in via NextAuth with admin@example.com');
    console.log('The admin APIs check for session.user.email === "admin@example.com"\n');

    // Test each endpoint (these will fail without proper auth session)
    const endpoints = [
      { name: 'Users', url: '/api/admin/users', method: 'GET' },
      { name: 'Characters', url: '/api/admin/characters', method: 'GET' },
      { name: 'Battles', url: '/api/admin/battles', method: 'GET' },
      { name: 'Settings', url: '/api/admin/settings', method: 'GET' },
      { name: 'Stats', url: '/api/admin/stats', method: 'GET' }
    ];

    for (const endpoint of endpoints) {
      console.log(`Testing ${endpoint.name} endpoint...`);
      try {
        const response = await fetch(`${BASE_URL}${endpoint.url}`, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        
        if (response.status === 401) {
          console.log(`✓ ${endpoint.name}: Correctly returns 401 (Unauthorized) without admin session`);
        } else {
          console.log(`✗ ${endpoint.name}: Unexpected status ${response.status}`);
          console.log('Response:', data);
        }
      } catch (error) {
        console.error(`✗ ${endpoint.name}: Error - ${error.message}`);
      }
      console.log('');
    }

    console.log('\nTo properly test admin APIs:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Login via browser at http://localhost:3000 with admin@example.com');
    console.log('3. Access the admin panel at http://localhost:3000/admin');
    console.log('\nAdmin user is pre-created in memoryStore with:');
    console.log('- Email: admin@example.com');
    console.log('- Password: admin123!');

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAdminAPIs();