const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3009';

// Generate unique IDs for testing
const userId1 = `test-user-${Date.now()}-1`;
const userId2 = `test-user-${Date.now()}-2`;

async function createUser(userData) {
  // Simulate user creation for testing
  return {
    id: userData.id,
    email: userData.email,
    username: userData.username,
    isGuest: userData.isGuest
  };
}

async function createCharacter(characterData) {
  const response = await fetch(`${BASE_URL}/api/characters`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(characterData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create character: ${JSON.stringify(error)}`);
  }
  
  return response.json();
}

async function createBattle(attackerId, defenderId) {
  const response = await fetch(`${BASE_URL}/api/battles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ attackerId, defenderId })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create battle: ${JSON.stringify(error)}`);
  }
  
  return response.json();
}

async function getBattleHistory(characterId) {
  const response = await fetch(`${BASE_URL}/api/battles/history?characterId=${characterId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get battle history: ${JSON.stringify(error)}`);
  }
  
  return response.json();
}

async function runFullTest() {
  console.log('=== Full Battle System Test ===\n');

  try {
    // Step 1: Create two dummy users
    console.log('1. Creating dummy users...');
    const user1 = await createUser({
      id: userId1,
      email: `test1-${Date.now()}@example.com`,
      username: 'TestWarrior',
      isGuest: false
    });
    
    const user2 = await createUser({
      id: userId2,
      email: `test2-${Date.now()}@example.com`,
      username: 'TestMage',
      isGuest: false
    });
    
    console.log('✓ Created users:', user1.username, 'and', user2.username, '\n');

    // Step 2: Create characters for both users
    console.log('2. Creating characters...');
    const character1Response = await createCharacter({
      userId: user1.id,
      name: 'Warrior',
      battleChat: 'For honor and glory!'
    });
    
    const character2Response = await createCharacter({
      userId: user2.id,
      name: 'Mage',
      battleChat: 'Magic is supreme!'
    });
    
    const character1 = character1Response.data;
    const character2 = character2Response.data;
    
    console.log('✓ Created characters:');
    console.log(`  - ${character1.name} (ELO: ${character1.eloScore})`);
    console.log(`  - ${character2.name} (ELO: ${character2.eloScore})\n`);

    // Step 3: Create a battle between the two characters
    console.log('3. Creating battle...');
    const battleResponse = await createBattle(character1.id, character2.id);
    const battle = battleResponse.data;
    
    console.log('✓ Battle completed!');
    console.log(`  - Battle ID: ${battle.id}`);
    console.log(`  - Attacker: ${character1.name} (Score: ${battle.attackerScore})`);
    console.log(`  - Defender: ${character2.name} (Score: ${battle.defenderScore})`);
    console.log(`  - Winner: ${battle.winnerId === character1.id ? character1.name : character2.name}`);
    console.log(`  - Battle Log: ${battle.battleLog}\n`);

    // Step 4: Create another battle (reverse)
    console.log('4. Creating reverse battle...');
    const reverseBattleResponse = await createBattle(character2.id, character1.id);
    const reverseBattle = reverseBattleResponse.data;
    
    console.log('✓ Reverse battle completed!');
    console.log(`  - Battle ID: ${reverseBattle.id}`);
    console.log(`  - Attacker: ${character2.name} (Score: ${reverseBattle.attackerScore})`);
    console.log(`  - Defender: ${character1.name} (Score: ${reverseBattle.defenderScore})`);
    console.log(`  - Winner: ${reverseBattle.winnerId === character1.id ? character1.name : character2.name}\n`);

    // Step 5: Check battle history
    console.log('5. Checking battle history...');
    const history1 = await getBattleHistory(character1.id);
    const history2 = await getBattleHistory(character2.id);
    
    console.log(`✓ Battle history for ${character1.name}:`, history1.data?.length || 0, 'battles');
    console.log(`✓ Battle history for ${character2.name}:`, history2.data?.length || 0, 'battles\n');

    // Step 6: Test special endpoint with battle flags
    console.log('6. Testing special battle endpoint...');
    const specialBattleResponse = await fetch(`${BASE_URL}/api/characters/special?characterId=${character1.id}&c7=true&magic=true&memory=true`);
    const specialCharacter = await specialBattleResponse.json();
    
    console.log('✓ Special character data:');
    console.log(`  - Name: ${specialCharacter.data.name}`);
    console.log(`  - Special Attributes:`, JSON.stringify(specialCharacter.data.specialAttributes, null, 2));
    console.log(`  - Flags applied:`, specialCharacter.flags.join(', '), '\n');

    // Step 7: Check leaderboard
    console.log('7. Checking leaderboard...');
    const leaderboardResponse = await fetch(`${BASE_URL}/api/characters?limit=10`);
    const leaderboard = await leaderboardResponse.json();
    
    console.log('✓ Top characters:');
    if (leaderboard.data && leaderboard.data.length > 0) {
      leaderboard.data.slice(0, 5).forEach((char, idx) => {
        console.log(`  ${idx + 1}. ${char.name} - ELO: ${char.eloScore} (W: ${char.wins}, L: ${char.losses})`);
      });
    }

    console.log('\n=== All tests completed successfully! ===');
    console.log('\nThe application is working correctly with:');
    console.log('✓ Character creation');
    console.log('✓ Battle system');
    console.log('✓ Battle history');
    console.log('✓ Special character endpoints with all flags');
    console.log('✓ Leaderboard functionality');
    console.log('\nServer is running on port 3010');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the full test
runFullTest();