const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3009';

async function testBattle() {
  console.log('=== Simple Battle Test ===\n');
  
  try {
    // Test 1: Create test characters
    console.log('1. Creating test characters...');
    
    // Create character 1
    const timestamp = Date.now();
    const userId1 = `test-user-${timestamp}-1`;
    const char1Response = await fetch(`${BASE_URL}/api/characters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId1,
        name: 'Knight',
        battleChat: 'For honor!'
      })
    });
    
    if (!char1Response.ok) {
      console.log('Character 1 creation failed:', await char1Response.text());
      return;
    }
    
    const { character: char1 } = await char1Response.json();
    console.log('✓ Created character 1:', char1.name);
    
    // Create character 2
    const userId2 = `test-user-${timestamp}-2`;
    const char2Response = await fetch(`${BASE_URL}/api/characters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId2,
        name: 'Wizard',
        battleChat: 'Magic!'
      })
    });
    
    if (!char2Response.ok) {
      console.log('Character 2 creation failed:', await char2Response.text());
      return;
    }
    
    const { character: char2 } = await char2Response.json();
    console.log('✓ Created character 2:', char2.name);
    
    // Test 2: Start a battle
    console.log('\n2. Starting battle...');
    // Set a mock cookie for authentication
    const battleResponse = await fetch(`${BASE_URL}/api/battles`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': `userId=${userId1}` 
      },
      body: JSON.stringify({
        attackerId: char1.id,
        defenderId: char2.id
      })
    });
    
    if (!battleResponse.ok) {
      console.log('Battle creation failed:', await battleResponse.text());
      return;
    }
    
    const { battle } = await battleResponse.json();
    console.log('✓ Battle created successfully');
    console.log('  - Winner:', battle.winnerId === char1.id ? char1.name : char2.name);
    console.log('  - Attacker damage:', battle.attackerDamage);
    console.log('  - Defender damage:', battle.defenderDamage);
    
    // Test 3: Get battle history
    console.log('\n3. Getting battle history...');
    const historyResponse = await fetch(`${BASE_URL}/api/battles/history?characterId=${char1.id}`);
    
    if (!historyResponse.ok) {
      console.log('History fetch failed:', await historyResponse.text());
      return;
    }
    
    const { battles } = await historyResponse.json();
    console.log('✓ Battle history retrieved:', battles.length, 'battles');
    
    // Test 4: Get updated character stats
    console.log('\n4. Getting updated character stats...');
    const statsResponse = await fetch(`${BASE_URL}/api/characters/my?userId=${userId1}`);
    
    if (!statsResponse.ok) {
      console.log('Stats fetch failed:', await statsResponse.text());
      return;
    }
    
    const { character: updatedChar } = await statsResponse.json();
    console.log('✓ Updated character stats:');
    console.log('  - ELO Score:', updatedChar.eloScore);
    console.log('  - Wins:', updatedChar.wins);
    console.log('  - Losses:', updatedChar.losses);
    
    console.log('\n✅ Battle tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testBattle();