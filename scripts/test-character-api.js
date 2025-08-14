// Test character API endpoints
async function testCharacterAPI() {
  try {
    console.log('Testing character API endpoints...\n');
    
    // First, get all characters to find valid IDs
    const allCharsResponse = await fetch('http://localhost:3009/api/characters');
    const allCharsData = await allCharsResponse.json();
    
    console.log('All characters response:', allCharsResponse.status);
    console.log('Total characters:', allCharsData.data?.length || 0);
    
    if (allCharsData.data && allCharsData.data.length > 0) {
      // Test getting individual characters
      const testCharId = allCharsData.data[0].id;
      console.log('\nTesting individual character fetch...');
      console.log('Character ID:', testCharId);
      
      const charResponse = await fetch(`http://localhost:3009/api/characters/${testCharId}`);
      console.log('Individual character response status:', charResponse.status);
      
      const charData = await charResponse.json();
      console.log('Character data:', charData);
      
      if (charData.data) {
        console.log('\nCharacter details:');
        console.log('- Name:', charData.data.name);
        console.log('- ELO:', charData.data.eloScore || charData.data.elo);
        console.log('- Is NPC:', charData.data.isNPC);
      }
    }
    
  } catch (error) {
    console.error('Error testing character API:', error);
  }
}

// Run the test
testCharacterAPI();