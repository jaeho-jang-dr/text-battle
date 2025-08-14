// Test battle API
const baseUrl = "http://localhost:3008";

async function testBattleAPI() {
  console.log("=== Testing Battle API ===\n");
  
  try {
    // 1. Get all characters
    console.log("1. Fetching all characters...");
    const charsResponse = await fetch(`${baseUrl}/api/characters`);
    const charsData = await charsResponse.json();
    
    if (!charsResponse.ok) {
      console.log("❌ Failed to fetch characters:", charsData.error);
      return;
    }
    
    const playerChar = charsData.data.find(char => !char.isNPC);
    const npc = charsData.data.find(char => char.isNPC);
    
    if (!playerChar || !npc) {
      console.log("❌ Need at least one player and one NPC");
      return;
    }
    
    console.log("✅ Found characters:");
    console.log("- Player:", playerChar.name, `(ELO: ${playerChar.eloScore})`);
    console.log("- NPC:", npc.name, `(ELO: ${npc.eloScore})`);
    
    // 2. Create a battle
    console.log("\n2. Creating battle...");
    const battleResponse = await fetch(`${baseUrl}/api/battles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        attackerId: playerChar.id,
        defenderId: npc.id
      }),
    });
    
    const battleData = await battleResponse.json();
    
    if (!battleResponse.ok) {
      console.log("❌ Battle creation failed:", battleData.error);
      return;
    }
    
    console.log("✅ Battle created successfully!");
    console.log("- Battle ID:", battleData.data.id);
    console.log("- Winner:", battleData.data.winnerId === playerChar.id ? playerChar.name : npc.name);
    console.log("- Attacker Score:", battleData.data.attackerScore);
    console.log("- Defender Score:", battleData.data.defenderScore);
    console.log("- Attacker ELO Change:", battleData.data.attackerEloChange);
    console.log("- Defender ELO Change:", battleData.data.defenderEloChange);
    console.log("\nBattle Log:");
    battleData.data.battleLog.forEach(log => console.log(`  ${log}`));
    
  } catch (error) {
    console.error("Test failed:", error);
  }
  
  console.log("\n=== Test Complete ===");
}

// Run the test
testBattleAPI();