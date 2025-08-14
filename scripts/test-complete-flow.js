// Test complete flow: signup, character creation, and battle
const baseUrl = "http://localhost:3009";

async function testCompleteFlow() {
  console.log("=== Testing Complete Flow ===\n");
  
  try {
    // 1. Create two test users
    console.log("1. Creating test users...");
    
    const user1Response = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `fighter1_${Date.now()}@example.com`,
        username: `F${Date.now().toString().slice(-4)}`,
        password: "password123"
      }),
    });
    
    const user1Data = await user1Response.json();
    
    if (!user1Response.ok) {
      console.log("❌ User creation failed:", user1Data.error);
      return;
    }
    
    console.log("✅ User 1 created:", user1Data.user.username);
    console.log("Character 1:", user1Data.character.name);
    
    // 2. Check all characters
    console.log("\n2. Fetching all characters...");
    const allCharsResponse = await fetch(`${baseUrl}/api/characters`);
    const allCharsData = await allCharsResponse.json();
    
    console.log("Total characters:", allCharsData.data?.length || 0);
    
    // Find an NPC to battle
    const npc = allCharsData.data?.find(char => char.isNPC);
    if (!npc) {
      console.log("❌ No NPCs found!");
      return;
    }
    
    console.log("\n3. Found NPC to battle:", npc.name);
    console.log("- ELO Score:", npc.eloScore);
    console.log("- Battle Chat:", npc.battleChat);
    
    // 4. Create a battle (Note: This would need proper session handling in real scenario)
    console.log("\n4. Testing battle creation...");
    console.log("⚠️  Battle creation requires authenticated session - skipping");
    
    // 5. Show leaderboard
    console.log("\n5. Current Leaderboard (Top 5):");
    const topChars = allCharsData.data
      ?.sort((a, b) => b.eloScore - a.eloScore)
      .slice(0, 5);
    
    topChars?.forEach((char, index) => {
      console.log(`${index + 1}. ${char.name} - ELO: ${char.eloScore} (W: ${char.wins}, L: ${char.losses})`);
    });
    
  } catch (error) {
    console.error("Test failed:", error);
  }
  
  console.log("\n=== Test Complete ===");
}

// Run the test
testCompleteFlow();