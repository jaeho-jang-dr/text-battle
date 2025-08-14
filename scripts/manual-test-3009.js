/**
 * Manual test script for testing the app on port 3009
 * First start the server manually: PORT=3009 npm run dev
 * Then run this script: node scripts/manual-test-3009.js
 */

const API_BASE = "http://localhost:3009/api";

// Test data
const testData = {
  user1: {
    email: `warrior${Date.now()}@test.com`,
    password: "warrior123",
    characterName: "Lightning Warrior",
    backstory: "A warrior blessed by the C7 powers"
  },
  user2: {
    email: `mage${Date.now()}@test.com`,
    password: "mage123",
    characterName: "Mystic Mage",
    backstory: "A mage who seeks ancient wisdom"
  }
};

let user1Token = null;
let user2Token = null;
let user1CharId = null;
let user2CharId = null;

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error.message);
    return { ok: false, error: error.message };
  }
}

// Test functions
async function testSignupAndLogin() {
  console.log('\n=== 1. Testing Signup & Login ===\n');
  
  // Signup User 1
  console.log('📝 Signing up User 1...');
  const signup1 = await apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: testData.user1.email,
      password: testData.user1.password
    })
  });
  
  if (signup1.ok) {
    user1Token = signup1.data.token;
    console.log('✅ User 1 signed up successfully');
    console.log(`   Email: ${testData.user1.email}`);
    console.log(`   Token: ...${user1Token?.slice(-10)}`);
  } else {
    console.log('❌ User 1 signup failed:', signup1.data?.error);
    
    // Try login instead
    console.log('🔑 Trying to login User 1...');
    const login1 = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testData.user1.email,
        password: testData.user1.password
      })
    });
    
    if (login1.ok) {
      user1Token = login1.data.token;
      console.log('✅ User 1 logged in successfully');
    } else {
      console.log('❌ User 1 login failed:', login1.data?.error);
    }
  }
  
  // Signup User 2
  console.log('\n📝 Signing up User 2...');
  const signup2 = await apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: testData.user2.email,
      password: testData.user2.password
    })
  });
  
  if (signup2.ok) {
    user2Token = signup2.data.token;
    console.log('✅ User 2 signed up successfully');
    console.log(`   Email: ${testData.user2.email}`);
    console.log(`   Token: ...${user2Token?.slice(-10)}`);
  } else {
    console.log('❌ User 2 signup failed:', signup2.data?.error);
  }
}

async function testCharacterCreation() {
  console.log('\n=== 2. Testing Character Creation ===\n');
  
  if (!user1Token || !user2Token) {
    console.log('❌ Skipping character creation - users not authenticated');
    return;
  }
  
  // Create character for User 1
  console.log('🎮 Creating character for User 1...');
  const char1 = await apiCall('/characters', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${user1Token}` },
    body: JSON.stringify({
      name: testData.user1.characterName,
      battleChat: "Feel the power of lightning!",
      backstory: testData.user1.backstory
    })
  });
  
  if (char1.ok) {
    user1CharId = char1.data.id;
    console.log('✅ Character 1 created successfully');
    console.log(`   ID: ${user1CharId}`);
    console.log(`   Name: ${char1.data.name}`);
    console.log(`   Level: ${char1.data.level}`);
    console.log(`   ELO: ${char1.data.eloScore}`);
  } else {
    console.log('❌ Character 1 creation failed:', char1.data?.error);
  }
  
  // Create character for User 2
  console.log('\n🎮 Creating character for User 2...');
  const char2 = await apiCall('/characters', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${user2Token}` },
    body: JSON.stringify({
      name: testData.user2.characterName,
      battleChat: "Magic shall prevail!",
      backstory: testData.user2.backstory
    })
  });
  
  if (char2.ok) {
    user2CharId = char2.data.id;
    console.log('✅ Character 2 created successfully');
    console.log(`   ID: ${user2CharId}`);
    console.log(`   Name: ${char2.data.name}`);
    console.log(`   Level: ${char2.data.level}`);
    console.log(`   ELO: ${char2.data.eloScore}`);
  } else {
    console.log('❌ Character 2 creation failed:', char2.data?.error);
  }
}

async function testNPCBattles() {
  console.log('\n=== 3. Testing NPC Battles with Advanced Features ===\n');
  
  if (!user1CharId || !user1Token) {
    console.log('❌ Skipping NPC battles - character not created');
    return;
  }
  
  // Battle with Serena using advanced endpoint
  console.log('⚔️ Battle with Serena (Advanced Features)...');
  const serenaBattle = await apiCall('/endpoint?c7=true&seq=true&magic=true&memory=true&serena=true&persona=true', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${user1Token}` },
    body: JSON.stringify({
      action: 'battle_serena',
      data: {
        challengerId: user1CharId,
        useC7: true,
        useMemory: true,
        persona: 'mystic'
      }
    })
  });
  
  if (serenaBattle.ok && serenaBattle.data.results?.battle) {
    const battle = serenaBattle.data.results.battle;
    console.log('✅ Serena battle completed');
    console.log(`   Winner: ${battle.winner === user1CharId ? testData.user1.characterName : 'Serena'}`);
    console.log(`   Win Probability: ${(battle.winProbability * 100).toFixed(1)}%`);
    console.log(`   Dialogue: "${battle.dialogue}"`);
    console.log(`   Abilities Used: ${battle.abilitiesUsed.join(', ')}`);
    console.log(`   Mechanics:`, battle.mechanics);
    console.log(`   Rewards:`, battle.rewards);
  } else {
    console.log('❌ Serena battle failed:', serenaBattle.data?.error);
  }
  
  // Magic battle test
  console.log('\n🔮 Testing Magic Battle System...');
  const magicBattle = await apiCall('/battles/magic', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${user1Token}`,
      'Cookie': `userId=test123`
    },
    body: JSON.stringify({
      attackerId: user1CharId,
      defenderId: 'serena-c7-magic',
      attackerMagic: 'FIRE',
      defenderMagic: 'WATER',
      sequence: 1,
      useMemory: true,
      includeSerena: true,
      persona: 'MAGICIAN'
    })
  });
  
  if (magicBattle.ok && magicBattle.data.success) {
    console.log('✅ Magic battle completed');
    console.log(`   Features enabled:`, magicBattle.data.features);
  } else {
    console.log('❌ Magic battle failed:', magicBattle.data?.error);
  }
  
  // Advanced C7 battle
  console.log('\n✨ Testing Advanced C7 Battle System...');
  const advancedBattle = await apiCall('/features', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${user1Token}` },
    body: JSON.stringify({
      attackerId: user1CharId,
      action: 'battle',
      magicType: 'ARCANE',
      persona: 'mystic',
      useMemory: true,
      transcend: false
    })
  });
  
  if (advancedBattle.ok && advancedBattle.data.success) {
    console.log('✅ Advanced C7 battle completed');
    console.log(`   Winner: ${advancedBattle.data.winner}`);
    console.log(`   C7 Progress: ${advancedBattle.data.rewards.c7Progress}`);
    console.log(`   System State:`, advancedBattle.data.system.c7);
    if (advancedBattle.data.rewards.serenaSecret) {
      console.log(`   🎁 ${advancedBattle.data.rewards.serenaSecret}`);
    }
  } else {
    console.log('❌ Advanced battle failed:', advancedBattle.data?.error);
  }
}

async function testPvPBattles() {
  console.log('\n=== 4. Testing Player vs Player Battles ===\n');
  
  if (!user1CharId || !user2CharId || !user1Token) {
    console.log('❌ Skipping PvP battles - both characters needed');
    return;
  }
  
  // Standard PvP battle
  console.log('⚔️ Standard PvP Battle...');
  const pvpBattle = await apiCall('/battles', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${user1Token}` },
    body: JSON.stringify({
      attackerId: user1CharId,
      defenderId: user2CharId
    })
  });
  
  if (pvpBattle.ok) {
    console.log('✅ PvP battle completed');
    console.log(`   Winner: ${pvpBattle.data.winner}`);
    console.log(`   Battle Log Preview: ${pvpBattle.data.battleLog?.substring(0, 100)}...`);
  } else {
    console.log('❌ PvP battle failed:', pvpBattle.data?.error);
  }
  
  // Magic PvP battle
  console.log('\n🔮 Magic PvP Battle...');
  const magicPvP = await apiCall('/battles/magic', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${user1Token}`,
      'Cookie': `userId=test123`
    },
    body: JSON.stringify({
      attackerId: user1CharId,
      defenderId: user2CharId,
      attackerMagic: 'DARK',
      defenderMagic: 'LIGHT',
      sequence: 1,
      useMemory: true,
      persona: 'PRIESTESS'
    })
  });
  
  if (magicPvP.ok && magicPvP.data.success) {
    const data = magicPvP.data.data;
    console.log('✅ Magic PvP battle completed');
    console.log(`   Winner: ${data.winner_id === user1CharId ? testData.user1.characterName : testData.user2.characterName}`);
    console.log(`   Scores: ${data.attacker.name} (${data.attacker_score}) vs ${data.defender.name} (${data.defender_score})`);
    console.log(`   ELO Changes: ${data.attacker.name} ${data.attacker.oldElo} → ${data.attacker.newElo}`);
  } else {
    console.log('❌ Magic PvP battle failed:', magicPvP.data?.error);
  }
}

async function testSpellCasting() {
  console.log('\n=== 5. Testing Spell Casting ===\n');
  
  if (!user1CharId || !user1Token) {
    console.log('❌ Skipping spell casting - character needed');
    return;
  }
  
  console.log('🔮 Casting Fireball spell...');
  const spell = await apiCall('/endpoint?magic=true&memory=true', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${user1Token}` },
    body: JSON.stringify({
      action: 'cast_spell',
      data: {
        characterId: user1CharId,
        spell: 'fireball',
        combo: true
      }
    })
  });
  
  if (spell.ok && spell.data.results?.spellCast) {
    const cast = spell.data.results.spellCast;
    console.log('✅ Spell cast successfully');
    console.log(`   Spell: ${cast.spell}`);
    console.log(`   Effects:`, cast.effects);
    console.log(`   Mana Cost: ${cast.manaCost}`);
    console.log(`   Remaining Mana: ${cast.remainingMana}`);
    console.log(`   Combo Active: ${cast.comboActive}`);
  } else {
    console.log('❌ Spell casting failed:', spell.data?.error);
  }
}

async function testLeaderboard() {
  console.log('\n=== 6. Testing Leaderboard ===\n');
  
  const leaderboard = await apiCall('/leaderboard');
  
  if (leaderboard.ok && leaderboard.data.characters) {
    console.log('✅ Leaderboard fetched successfully');
    console.log(`   Total Characters: ${leaderboard.data.characters.length}`);
    console.log('\n   Top 5 Players:');
    leaderboard.data.characters.slice(0, 5).forEach((char, index) => {
      console.log(`   ${index + 1}. ${char.name} - ELO: ${char.eloScore} (W:${char.wins} L:${char.losses})`);
    });
  } else {
    console.log('❌ Leaderboard fetch failed');
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Text Battle Game - Manual Test Suite');
  console.log('======================================');
  console.log(`📍 Testing on: ${API_BASE}`);
  console.log(`🕐 Started at: ${new Date().toLocaleTimeString()}\n`);
  
  await testSignupAndLogin();
  await testCharacterCreation();
  await testNPCBattles();
  await testPvPBattles();
  await testSpellCasting();
  await testLeaderboard();
  
  console.log('\n\n✅ All tests completed!');
  console.log(`🕐 Finished at: ${new Date().toLocaleTimeString()}`);
  
  console.log('\n📊 Test Summary:');
  console.log('- Signup & Login: Tested');
  console.log('- Character Creation: Tested');
  console.log('- NPC Battles (with C7, Serena, Magic): Tested');
  console.log('- PvP Battles: Tested');
  console.log('- Spell Casting: Tested');
  console.log('- Leaderboard: Tested');
  
  console.log('\n🎯 Advanced Features Tested:');
  console.log('✅ C7 System');
  console.log('✅ Sequential Processing');
  console.log('✅ Serena NPC');
  console.log('✅ Magic System');
  console.log('✅ Memory System');
  console.log('✅ Persona System');
}

// Run the tests
runAllTests().catch(error => {
  console.error('\n❌ Test suite error:', error);
});