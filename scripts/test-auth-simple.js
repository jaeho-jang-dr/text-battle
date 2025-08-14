const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3009';

async function testAuth() {
  console.log('=== Simple Auth Test ===\n');
  
  try {
    // Test 1: Login as guest using NextAuth
    console.log('1. Testing guest login...');
    const csrfResponse = await fetch(`${BASE_URL}/api/auth/csrf`);
    const { csrfToken } = await csrfResponse.json();
    
    const guestResponse = await fetch(`${BASE_URL}/api/auth/callback/guest`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': csrfResponse.headers.get('set-cookie') || ''
      },
      body: JSON.stringify({ 
        username: 'TestGuest',
        csrfToken 
      })
    });
    
    if (guestResponse.ok || guestResponse.status === 302) {
      console.log('✓ Guest login initiated');
    } else {
      console.log('✗ Guest login failed:', guestResponse.status, await guestResponse.text());
    }
    
    // Test 2: Login as admin
    console.log('\n2. Testing admin login...');
    const adminResponse = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '1234' })
    });
    
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('✓ Admin login successful');
    } else {
      console.log('✗ Admin login failed:', await adminResponse.text());
    }
    
    // Test 3: Check auth session
    console.log('\n3. Testing auth session check...');
    const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`);
    
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      console.log('✓ Auth session check successful:', sessionData);
    } else {
      console.log('✗ Auth session check failed:', await sessionResponse.text());
    }
    
    console.log('\n✅ Auth tests completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuth();