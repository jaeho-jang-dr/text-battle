// Manual test for battle creation
const baseUrl = "http://localhost:3008";

console.log("=== Manual Battle Test ===\n");
console.log("Note: This test requires authentication. Use the browser instead.");
console.log("\n1. Login to the app at http://localhost:3008");
console.log("2. Go to Play page");
console.log("3. Click on any NPC to battle");
console.log("\nThe battle should work if:");
console.log("- You see the battle button");
console.log("- Clicking shows a result (win/loss)");
console.log("- Your ELO score updates");

// Quick check if server is running
fetch(baseUrl)
  .then(res => {
    if (res.ok) {
      console.log("\n✅ Server is running on port 3008");
    } else {
      console.log("\n❌ Server returned status:", res.status);
    }
  })
  .catch(err => {
    console.log("\n❌ Server is not running or not accessible:", err.message);
  });