// Test admin authentication with NextAuth
const API_BASE = 'http://localhost:3009';

async function testAdminAuth() {
  console.log('Testing admin authentication flow...\n');

  // Step 1: Verify admin credentials through admin login endpoint
  console.log('1. Verifying admin credentials...');
  const verifyResponse = await fetch(`${API_BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });

  if (!verifyResponse.ok) {
    console.error('❌ Admin credential verification failed');
    const error = await verifyResponse.json();
    console.error('Error:', error);
    return;
  }

  const verifyData = await verifyResponse.json();
  console.log('✅ Admin credentials verified');
  console.log('Response:', verifyData);

  // Step 2: Sign in with NextAuth using admin@example.com
  console.log('\n2. Signing in with NextAuth...');
  const signInResponse = await fetch(`${API_BASE}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: verifyData.email,
      password: verifyData.password,
      isSignup: 'false'
    })
  });

  if (!signInResponse.ok) {
    console.error('❌ NextAuth sign in failed');
    const error = await signInResponse.text();
    console.error('Error:', error);
    return;
  }

  console.log('✅ Signed in with NextAuth');

  // Step 3: Check admin verification endpoint
  console.log('\n3. Checking admin verification...');
  const checkResponse = await fetch(`${API_BASE}/api/admin/verify`);
  
  if (!checkResponse.ok) {
    console.error('❌ Admin verification failed');
    const error = await checkResponse.json();
    console.error('Error:', error);
    return;
  }

  const checkData = await checkResponse.json();
  console.log('✅ Admin verified successfully');
  console.log('Response:', checkData);

  // Step 4: Try accessing admin users endpoint
  console.log('\n4. Testing admin API access...');
  const usersResponse = await fetch(`${API_BASE}/api/admin/users`);
  
  if (!usersResponse.ok) {
    console.error('❌ Admin API access failed');
    const error = await usersResponse.json();
    console.error('Error:', error);
    return;
  }

  const usersData = await usersResponse.json();
  console.log('✅ Admin API access successful');
  console.log('Total users:', usersData.total);

  console.log('\n✅ All admin authentication tests passed!');
}

// Run the test
testAdminAuth().catch(console.error);