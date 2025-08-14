// Test homepage is working
const baseUrl = "http://localhost:3009";

async function testHomepage() {
  console.log("=== Testing Homepage ===\n");
  
  try {
    console.log(`1. Checking if server is running on port 3009...`);
    const response = await fetch(baseUrl);
    
    if (response.ok) {
      console.log("✅ Server is running!");
      console.log("   Status:", response.status);
      console.log("   URL:", response.url);
      
      // Check if it's HTML
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.log("✅ Homepage is returning HTML");
      }
      
      console.log("\n2. You can now access the homepage at:");
      console.log(`   ${baseUrl}`);
      console.log("\n3. Available pages:");
      console.log(`   - Homepage: ${baseUrl}`);
      console.log(`   - Sign Up: ${baseUrl} (click Sign Up button)`);
      console.log(`   - Login: ${baseUrl} (click Login button)`);
      console.log(`   - Leaderboard: ${baseUrl}/leaderboard`);
      console.log(`   - Play (after login): ${baseUrl}/play`);
      
    } else {
      console.log("❌ Server returned error:", response.status);
    }
  } catch (error) {
    console.error("❌ Failed to connect to server:", error.message);
    console.log("\nPlease make sure the development server is running:");
    console.log("   npm run dev");
  }
  
  console.log("\n=== Test Complete ===");
}

// Run the test
testHomepage();