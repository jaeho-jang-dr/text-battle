const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3009';

async function testSimple() {
  console.log('=== Debug Test ===\n');
  
  try {
    // Test 1: Simple POST request
    console.log('1. Testing simple character creation...');
    const response = await fetch(`${BASE_URL}/api/characters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: `test-${Date.now()}`,
        name: 'Test',
        battleChat: 'Hi'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('Response body:', text);
    
    if (text) {
      try {
        const data = JSON.parse(text);
        console.log('Parsed data:', data);
      } catch (e) {
        console.log('Failed to parse as JSON');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testSimple();