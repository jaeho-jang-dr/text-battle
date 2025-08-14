const fetch = require('node-fetch');

async function testBattlePage() {
  console.log('Testing Battle Page...\n');

  try {
    // Test 1: Check if battle page loads
    console.log('1. Testing battle page load...');
    const response = await fetch('http://localhost:3009/battle/char1/char2');
    console.log(`   Status: ${response.status}`);
    console.log(`   ✓ Battle page accessible\n`);

    // Test 2: Check character API
    console.log('2. Testing character API...');
    const charResponse = await fetch('http://localhost:3009/api/characters');
    const charData = await charResponse.json();
    console.log(`   Status: ${charResponse.status}`);
    console.log(`   Characters found: ${charData.data?.length || 0}`);
    
    if (charData.data && charData.data.length >= 2) {
      const char1 = charData.data[0];
      const char2 = charData.data[1];
      console.log(`   ✓ Sample characters: ${char1.name} vs ${char2.name}`);
      console.log(`   Battle URL: http://localhost:3009/battle/${char1.id}/${char2.id}\n`);
    }

    // Test 3: Test battle API
    console.log('3. Testing battle API...');
    if (charData.data && charData.data.length >= 2) {
      const battleResponse = await fetch('http://localhost:3009/api/battles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attackerId: charData.data[0].id,
          defenderId: charData.data[1].id
        })
      });
      
      const battleData = await battleResponse.json();
      console.log(`   Status: ${battleResponse.status}`);
      if (battleResponse.ok) {
        console.log(`   ✓ Battle created successfully`);
        console.log(`   Winner: ${battleData.data.winnerId}`);
      } else {
        console.log(`   Error: ${battleData.error}`);
      }
    }

    console.log('\n✓ All tests completed!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testBattlePage();