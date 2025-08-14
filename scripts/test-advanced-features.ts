/**
 * Test script for advanced features: C7, Sequential, Magic, Memory, Serena, Persona
 * Run with: npx ts-node scripts/test-advanced-features.ts
 */

const API_BASE = "http://localhost:3000/api";

interface TestResult {
  testName: string;
  passed: boolean;
  details: any;
  error?: string;
}

const results: TestResult[] = [];

async function testEndpoint(name: string, endpoint: string, options: RequestInit = {}) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`📍 Endpoint: ${endpoint}`);
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
    
    const data = await response.json();
    const passed = response.ok;
    
    results.push({
      testName: name,
      passed,
      details: data,
      error: !passed ? data.error : undefined
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Response:`, JSON.stringify(data, null, 2));
    
    return data;
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
    results.push({
      testName: name,
      passed: false,
      details: null,
      error: error.message
    });
    return null;
  }
}

async function runTests() {
  console.log("🚀 Starting Advanced Features Test Suite\n");
  
  // Test 1: Basic endpoint with all features
  await testEndpoint(
    "Endpoint with all features",
    "/endpoint?c7=true&seq=true&magic=true&memory=true&serena=true&persona=true"
  );
  
  // Test 2: Magic battle endpoint
  await testEndpoint(
    "Magic Battle Creation",
    "/battles/magic",
    {
      method: "POST",
      body: JSON.stringify({
        attackerId: "test-character-1",
        defenderId: "test-character-2",
        attackerMagic: "FIRE",
        defenderMagic: "WATER",
        sequence: 1,
        useMemory: true,
        includeSerena: true,
        persona: "MAGICIAN"
      })
    }
  );
  
  // Test 3: Advanced features endpoint
  await testEndpoint(
    "Advanced Features Status",
    "/features?characterId=test-character-1"
  );
  
  // Test 4: Battle with Serena
  await testEndpoint(
    "Battle Serena with Advanced Features",
    "/endpoint",
    {
      method: "POST",
      body: JSON.stringify({
        action: "battle_serena",
        data: {
          challengerId: "test-character-1",
          useC7: true,
          useMemory: true,
          persona: "mystic"
        }
      })
    }
  );
  
  // Test 5: Cast spell with combo
  await testEndpoint(
    "Cast Spell with Combo",
    "/endpoint",
    {
      method: "POST",
      body: JSON.stringify({
        action: "cast_spell",
        data: {
          characterId: "test-character-1",
          spell: "fireball",
          targetId: "test-character-2",
          combo: true
        }
      })
    }
  );
  
  // Test 6: Sequential processing test
  const seqTest = await testEndpoint(
    "Sequential Processing Order",
    "/endpoint?seq=true&memory=true"
  );
  
  if (seqTest?.sequentialProcessing) {
    console.log("\n📋 Sequential Processing Steps:");
    seqTest.sequentialProcessing.forEach((step: any, index: number) => {
      console.log(`  ${index + 1}. ${step.step}: ${step.success ? "✅" : "❌"}`);
    });
  }
  
  // Test 7: Memory cache stats
  await testEndpoint(
    "Get Memory Cache Stats",
    "/endpoint",
    {
      method: "POST",
      body: JSON.stringify({
        action: "get_cache_stats",
        data: {}
      })
    }
  );
  
  // Test 8: Advanced battle with transcendence
  await testEndpoint(
    "Advanced C7 Battle with Transcendence",
    "/features",
    {
      method: "POST",
      body: JSON.stringify({
        attackerId: "test-character-1",
        action: "battle",
        magicType: "ARCANE",
        persona: "mystic",
        useMemory: true,
        transcend: true
      })
    }
  );
  
  // Test 9: Create character with C7 enhancements
  await testEndpoint(
    "Create C7 Enhanced Character",
    "/endpoint?c7=true&persona=true",
    {
      method: "POST",
      body: JSON.stringify({
        action: "create_character",
        data: {
          name: "C7 Master",
          backstory: "A warrior who seeks the seventh level of consciousness",
          userId: "test-user-1",
          persona: "strategic"
        }
      })
    }
  );
  
  // Test 10: All features combined
  await testEndpoint(
    "All Features Combined",
    "/endpoint?all=true",
    {
      method: "GET"
    }
  );
  
  // Summary
  console.log("\n\n📊 TEST SUMMARY");
  console.log("================");
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  
  console.log("\n📋 Detailed Results:");
  results.forEach((result, index) => {
    const icon = result.passed ? "✅" : "❌";
    console.log(`${index + 1}. ${icon} ${result.testName}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  // Feature validation
  console.log("\n🎯 Feature Validation:");
  const features = ["c7", "seq", "magic", "memory", "serena", "persona"];
  features.forEach(feature => {
    const implemented = results.some(r => 
      r.details?.features?.includes(feature) || 
      r.details?.configuration?.[feature]
    );
    console.log(`${implemented ? "✅" : "❌"} ${feature.toUpperCase()} implementation`);
  });
}

// Run tests
runTests().catch(console.error);