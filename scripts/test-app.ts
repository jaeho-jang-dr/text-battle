// Test script for Text Battle App
const testApp = async () => {
  const baseUrl = "http://localhost:3008";
  
  console.log("=== Text Battle App Test ===\n");
  
  // 1. Test debug endpoint
  console.log("1. Testing debug endpoint...");
  try {
    const debugResponse = await fetch(`${baseUrl}/api/debug`);
    const debugData = await debugResponse.json();
    console.log("Debug data:", JSON.stringify(debugData, null, 2));
  } catch (error) {
    console.error("Debug endpoint failed:", error);
  }
  
  // 2. Test characters endpoint
  console.log("\n2. Testing characters endpoint...");
  try {
    const charsResponse = await fetch(`${baseUrl}/api/characters`);
    const charsData = await charsResponse.json();
    console.log("Characters count:", charsData.data?.length || 0);
    console.log("First 3 characters:", charsData.data?.slice(0, 3));
  } catch (error) {
    console.error("Characters endpoint failed:", error);
  }
  
  // 3. Test leaderboard
  console.log("\n3. Testing leaderboard endpoint...");
  try {
    const leaderResponse = await fetch(`${baseUrl}/api/leaderboard`);
    const leaderData = await leaderResponse.json();
    console.log("Leaderboard count:", leaderData.data?.length || 0);
    console.log("Top 3:", leaderData.data?.slice(0, 3).map((c: any) => ({
      name: c.name,
      elo: c.eloScore,
      isNPC: c.isNPC
    })));
  } catch (error) {
    console.error("Leaderboard endpoint failed:", error);
  }
  
  // 4. Initialize NPCs if needed
  console.log("\n4. Initializing NPCs...");
  try {
    const initResponse = await fetch(`${baseUrl}/api/admin/npcs/init`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const initData = await initResponse.json();
    console.log("NPC init result:", initData);
  } catch (error) {
    console.error("NPC init failed:", error);
  }
  
  // 5. Test endpoint with features
  console.log("\n5. Testing SuperClaude endpoint...");
  try {
    const endpointResponse = await fetch(
      `${baseUrl}/api/endpoint?c7=true&seq=true&magic=true&memory=true&serena=true&persona=true`
    );
    const endpointData = await endpointResponse.json();
    console.log("Endpoint features:", endpointData.features);
  } catch (error) {
    console.error("Endpoint test failed:", error);
  }
  
  console.log("\n=== Test Complete ===");
};

// Run the test
testApp().catch(console.error);
