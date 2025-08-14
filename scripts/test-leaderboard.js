// Test leaderboard API
async function testLeaderboard() {
  try {
    console.log('Testing leaderboard API...\n');
    
    const response = await fetch('http://localhost:3009/api/leaderboard?limit=50');
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const data = await response.json();
    
    console.log('\nLeaderboard data:');
    console.log('Total characters:', data.total || data.data?.length || 0);
    
    if (data.data && Array.isArray(data.data)) {
      console.log('\nCharacters:');
      data.data.forEach((char, index) => {
        console.log(`${index + 1}. ${char.name} - ELO: ${char.eloScore || char.elo || 'N/A'} (NPC: ${char.isNPC || false})`);
      });
    } else {
      console.log('No character data found');
    }
    
    console.log('\nFull response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error testing leaderboard:', error);
  }
}

// Run the test
testLeaderboard();