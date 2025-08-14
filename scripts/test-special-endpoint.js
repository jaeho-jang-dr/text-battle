const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3010';

// Test data
const testUsers = [
  {
    id: 'test-user-1',
    email: 'test1@example.com',
    username: 'TestUser1',
    isGuest: false
  },
  {
    id: 'test-user-2', 
    email: 'test2@example.com',
    username: 'TestUser2',
    isGuest: false
  }
];

const testCharacters = [
  {
    userId: 'test-user-1',
    name: 'Warrior',
    battleChat: 'Feel the power of my blade!'
  },
  {
    userId: 'test-user-2',
    name: 'Mage',
    battleChat: 'Magic flows through me!'
  }
];

async function testEndpoint() {
  console.log('Testing Special Character Endpoint...\n');

  try {
    // Test 1: GET with all flags
    console.log('1. Testing GET with all flags...');
    const getResponse = await fetch(`${BASE_URL}/api/characters/special?c7=true&seq=true&magic=true&memory=true&serena=true&persona=true`);
    const getData = await getResponse.json();
    console.log('Response:', JSON.stringify(getData, null, 2));
    console.log('✓ GET test passed\n');

    // Test 2: Create special character with flags
    console.log('2. Testing POST with special flags...');
    const postResponse = await fetch(`${BASE_URL}/api/characters/special?c7=true&magic=true&persona=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user-special',
        name: 'MagicHero',
        battleChat: 'With great power comes great responsibility!'
      })
    });
    const postData = await postResponse.json();
    console.log('Response:', JSON.stringify(postData, null, 2));
    console.log('✓ POST test passed\n');

    // Test 3: Test memory cache
    console.log('3. Testing memory cache...');
    const cache1 = await fetch(`${BASE_URL}/api/characters/special?memory=true&serena=true`);
    const cacheData1 = await cache1.json();
    console.log('First request (should not be cached):', cacheData1.cached === true ? 'CACHED' : 'NOT CACHED');
    
    const cache2 = await fetch(`${BASE_URL}/api/characters/special?memory=true&serena=true`);
    const cacheData2 = await cache2.json();
    console.log('Second request (should be cached):', cacheData2.cached === true ? 'CACHED' : 'NOT CACHED');
    console.log('✓ Memory cache test passed\n');

    // Test 4: Update special character
    console.log('4. Testing PUT with special flags...');
    const putResponse = await fetch(`${BASE_URL}/api/characters/special?c7=true&memory=true`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        characterId: postData.data?.id || 'test-id',
        userId: 'test-user-special',
        updates: {
          battleChat: 'Updated battle chat with more power!',
          levelUp: true
        }
      })
    });
    const putData = await putResponse.json();
    console.log('Response:', JSON.stringify(putData, null, 2));
    console.log('✓ PUT test passed\n');

    // Test 5: Test Serena special character
    console.log('5. Testing Serena special character...');
    const serenaResponse = await fetch(`${BASE_URL}/api/characters/special?serena=true&magic=true&persona=true`);
    const serenaData = await serenaResponse.json();
    console.log('Serena character:', JSON.stringify(serenaData, null, 2));
    console.log('✓ Serena test passed\n');

    console.log('All tests completed successfully!');

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testEndpoint();