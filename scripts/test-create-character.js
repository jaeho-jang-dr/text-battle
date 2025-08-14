// Test character creation
const testCreateCharacter = async () => {
  const baseUrl = "http://localhost:3009";
  
  console.log("=== Testing Character Creation ===\n");
  
  // First, sign up a new user
  console.log("1. Creating test user...");
  
  try {
    // Note: This would need to be done through the browser since NextAuth requires CSRF tokens
    // For now, we'll test with an existing user ID
    
    // Test character creation directly
    console.log("2. Creating character...");
    
    const charResponse = await fetch(`${baseUrl}/api/characters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "test_user_123",
        name: "TestMan",
        battleChat: "테스트 전사가 전투를 시작합니다!"
      }),
    });
    
    const charData = await charResponse.json();
    console.log("Character creation response:", charData);
    
    if (charResponse.ok) {
      console.log("✅ Character created successfully!");
    } else {
      console.log("❌ Character creation failed:", charData.error);
    }
    
    // Check all characters
    console.log("\n3. Fetching all characters...");
    const allCharsResponse = await fetch(`${baseUrl}/api/characters`);
    const allCharsData = await allCharsResponse.json();
    
    console.log("Total characters:", allCharsData.data?.length || 0);
    console.log("First 3 characters:", allCharsData.data?.slice(0, 3).map(c => ({
      name: c.name,
      elo: c.eloScore,
      isNPC: c.isNPC
    })));
    
  } catch (error) {
    console.error("Test failed:", error);
  }
  
  console.log("\n=== Test Complete ===");
};

// Run the test
testCreateCharacter();