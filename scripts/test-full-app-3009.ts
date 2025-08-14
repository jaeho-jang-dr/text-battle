/**
 * Comprehensive app test for port 3009
 * Tests: Signup, Login, Character Creation, NPC Battles, PvP Battles
 * Features: C7, Sequential, Serena, Magic, Memory, Persona
 * 
 * Run with: npx ts-node scripts/test-full-app-3009.ts
 */

const API_BASE = "http://localhost:3009/api";
const APP_BASE = "http://localhost:3009";

interface TestUser {
  email: string;
  password: string;
  token?: string;
  characterId?: string;
}

interface TestResult {
  step: string;
  success: boolean;
  details?: any;
  error?: string;
}

const results: TestResult[] = [];

// Test users
const testUser1: TestUser = {
  email: `test.user1.${Date.now()}@example.com`,
  password: "password123"
};

const testUser2: TestUser = {
  email: `test.user2.${Date.now()}@example.com`,
  password: "password456"
};

// Helper function to log results
function logResult(step: string, success: boolean, details?: any, error?: string) {
  console.log(`\n${success ? '✅' : '❌'} ${step}`);
  if (details) console.log('📊 Details:', JSON.stringify(details, null, 2));
  if (error) console.log('❗ Error:', error);
  
  results.push({ step, success, details, error });
}

// Helper function to make API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
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
  } catch (error: any) {
    return { ok: false, status: 0, data: null, error: error.message };
  }
}

// Test 1: Signup
async function testSignup(user: TestUser) {
  console.log('\n🔐 Testing Signup...');
  
  const response = await apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: user.email,
      password: user.password
    })
  });
  
  if (response.ok && response.data.token) {
    user.token = response.data.token;
    logResult(`Signup for ${user.email}`, true, { userId: response.data.userId });
    return true;
  } else {
    logResult(`Signup for ${user.email}`, false, null, response.data?.error || 'Signup failed');
    return false;
  }
}

// Test 2: Login
async function testLogin(user: TestUser) {
  console.log('\n🔑 Testing Login...');
  
  const response = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: user.email,
      password: user.password
    })
  });
  
  if (response.ok && response.data.token) {
    user.token = response.data.token;
    logResult(`Login for ${user.email}`, true, { token: '***' + user.token.slice(-4) });
    return true;
  } else {
    logResult(`Login for ${user.email}`, false, null, response.data?.error || 'Login failed');
    return false;
  }
}

// Test 3: Create Character
async function createCharacter(user: TestUser, name: string, backstory: string) {
  console.log('\n🎮 Creating Character...');
  
  const response = await apiCall('/characters', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${user.token}`
    },
    body: JSON.stringify({
      name,
      battleChat: `I am ${name}, ready for battle!`,
      backstory
    })
  });
  
  if (response.ok && response.data.id) {
    user.characterId = response.data.id;
    logResult(`Character creation for ${name}`, true, { 
      id: response.data.id,
      name: response.data.name,
      level: response.data.level
    });
    return true;
  } else {
    logResult(`Character creation for ${name}`, false, null, response.data?.error || 'Character creation failed');
    return false;
  }
}

// Test 4: Battle with NPC using advanced features
async function testNPCBattle(user: TestUser) {
  console.log('\n⚔️ Testing NPC Battle with Advanced Features...');
  
  // First, test with Serena using the endpoint API
  const serenaResponse = await apiCall('/endpoint?c7=true&seq=true&magic=true&memory=true&serena=true&persona=true', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${user.token}`
    },
    body: JSON.stringify({
      action: 'battle_serena',
      data: {
        challengerId: user.characterId,
        useC7: true,
        useMemory: true,
        persona: 'mystic'
      }
    })
  });
  
  if (serenaResponse.ok) {
    logResult('Battle with Serena (Advanced)', true, serenaResponse.data.results?.battle);
  } else {
    logResult('Battle with Serena (Advanced)', false, null, serenaResponse.data?.error);
  }
  
  // Test magic battle endpoint
  const magicBattleResponse = await apiCall('/battles/magic', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${user.token}`,
      'Cookie': `userId=${user.characterId?.split('_')[1] || 'test'}`
    },
    body: JSON.stringify({
      attackerId: user.characterId,
      defenderId: 'serena-c7-magic',
      attackerMagic: 'FIRE',
      defenderMagic: 'WATER',
      sequence: 1,
      useMemory: true,
      includeSerena: true,
      persona: 'MAGICIAN'
    })
  });
  
  if (magicBattleResponse.ok) {
    logResult('Magic Battle with Serena', true, {
      winner: magicBattleResponse.data.data?.winner_id,
      features: magicBattleResponse.data.features
    });
  } else {
    logResult('Magic Battle with Serena', false, null, magicBattleResponse.data?.error);
  }
  
  // Test advanced features endpoint
  const advancedBattleResponse = await apiCall('/features', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${user.token}`
    },
    body: JSON.stringify({
      attackerId: user.characterId,
      action: 'battle',
      magicType: 'ARCANE',
      persona: 'mystic',
      useMemory: true,
      transcend: false
    })
  });
  
  if (advancedBattleResponse.ok) {
    logResult('Advanced C7 Battle', true, {
      winner: advancedBattleResponse.data.winner,
      system: advancedBattleResponse.data.system?.c7,
      rewards: advancedBattleResponse.data.rewards
    });
  } else {
    logResult('Advanced C7 Battle', false, null, advancedBattleResponse.data?.error);
  }
}

// Test 5: Player vs Player Battle
async function testPvPBattle(user1: TestUser, user2: TestUser) {
  console.log('\n⚔️ Testing Player vs Player Battle...');
  
  // Standard battle
  const standardBattleResponse = await apiCall('/battles', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${user1.token}`
    },
    body: JSON.stringify({
      attackerId: user1.characterId,
      defenderId: user2.characterId
    })
  });
  
  if (standardBattleResponse.ok) {
    logResult('Standard PvP Battle', true, {
      winner: standardBattleResponse.data.winner,
      battleLog: standardBattleResponse.data.battleLog?.substring(0, 100) + '...'
    });
  } else {
    logResult('Standard PvP Battle', false, null, standardBattleResponse.data?.error);
  }
  
  // Magic PvP battle with all features
  const magicPvPResponse = await apiCall('/battles/magic', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${user1.token}`,
      'Cookie': `userId=${user1.characterId?.split('_')[1] || 'test'}`
    },
    body: JSON.stringify({
      attackerId: user1.characterId,
      defenderId: user2.characterId,
      attackerMagic: 'DARK',
      defenderMagic: 'LIGHT',
      sequence: 2,
      useMemory: true,
      persona: 'PRIESTESS'
    })
  });
  
  if (magicPvPResponse.ok) {
    logResult('Magic PvP Battle', true, {
      winner: magicPvPResponse.data.data?.winner_id,
      attackerScore: magicPvPResponse.data.data?.attacker_score,
      defenderScore: magicPvPResponse.data.data?.defender_score
    });
  } else {
    logResult('Magic PvP Battle', false, null, magicPvPResponse.data?.error);
  }
}

// Test 6: Test spell casting
async function testSpellCasting(user: TestUser) {
  console.log('\n🔮 Testing Spell Casting...');
  
  const spellResponse = await apiCall('/endpoint?magic=true&memory=true', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${user.token}`
    },
    body: JSON.stringify({
      action: 'cast_spell',
      data: {
        characterId: user.characterId,
        spell: 'fireball',
        combo: true
      }
    })
  });
  
  if (spellResponse.ok) {
    logResult('Spell Casting', true, spellResponse.data.results?.spellCast);
  } else {
    logResult('Spell Casting', false, null, spellResponse.data?.error);
  }
}

// Test 7: Check leaderboard
async function testLeaderboard() {
  console.log('\n🏆 Testing Leaderboard...');
  
  const response = await apiCall('/leaderboard');
  
  if (response.ok && response.data.characters) {
    logResult('Leaderboard', true, {
      totalCharacters: response.data.characters.length,
      topPlayer: response.data.characters[0]?.name
    });
  } else {
    logResult('Leaderboard', false, null, 'Failed to fetch leaderboard');
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Comprehensive App Test on Port 3009');
  console.log('================================================\n');
  
  // Wait a bit for server to be ready
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test signup for both users
  const signup1Success = await testSignup(testUser1);
  const signup2Success = await testSignup(testUser2);
  
  if (!signup1Success || !signup2Success) {
    console.log('\n❌ Signup failed, attempting login with existing users...');
    await testLogin(testUser1);
    await testLogin(testUser2);
  }
  
  // Create characters
  if (testUser1.token) {
    await createCharacter(testUser1, 'Warrior of Light', 'A brave warrior seeking the power of C7 transcendence');
  }
  
  if (testUser2.token) {
    await createCharacter(testUser2, 'Shadow Mage', 'A mysterious mage who masters the dark arts');
  }
  
  // Test NPC battles with advanced features
  if (testUser1.characterId) {
    await testNPCBattle(testUser1);
    await testSpellCasting(testUser1);
  }
  
  // Test PvP battles
  if (testUser1.characterId && testUser2.characterId) {
    await testPvPBattle(testUser1, testUser2);
  }
  
  // Test leaderboard
  await testLeaderboard();
  
  // Summary
  console.log('\n\n📊 TEST SUMMARY');
  console.log('================');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  
  console.log('\n📋 Test Results:');
  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${index + 1}. ${icon} ${result.step}`);
  });
  
  // Feature validation
  console.log('\n🎯 Advanced Features Tested:');
  const features = ['C7', 'Sequential', 'Magic', 'Memory', 'Serena', 'Persona'];
  features.forEach(feature => {
    const tested = results.some(r => 
      r.details?.features?.[feature.toLowerCase()] || 
      r.details?.system?.[feature.toLowerCase()] ||
      r.step.toLowerCase().includes(feature.toLowerCase())
    );
    console.log(`${tested ? '✅' : '❌'} ${feature}`);
  });
  
  console.log('\n✨ Test completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});