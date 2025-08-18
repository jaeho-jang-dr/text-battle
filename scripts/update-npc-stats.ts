// Script to update existing NPCs with new weaker stats
import { memoryStore } from "../lib/db/memory-store";
import { npcCharacters } from "../lib/npc-data";

async function updateNPCStats() {
  console.log("Updating NPC stats to be weaker...");
  
  try {
    // Get all existing NPCs
    const existingNPCs = Array.from(memoryStore.characters.values())
      .filter(char => char.isNPC);
    
    console.log(`Found ${existingNPCs.length} existing NPCs to update`);
    
    // Create a map of NPC names to new ELO scores
    const npcEloMap = new Map(
      npcCharacters.map(npc => [npc.name, npc.eloScore])
    );
    
    let updatedCount = 0;
    
    // Update each existing NPC
    for (const npc of existingNPCs) {
      const newElo = npcEloMap.get(npc.name);
      
      if (newElo !== undefined) {
        const oldElo = npc.eloScore || (npc as any).elo || 1000;
        npc.eloScore = newElo;
        
        // Also update elo field for compatibility
        if ((npc as any).elo !== undefined) {
          (npc as any).elo = newElo;
        }
        
        // Update in memory store
        memoryStore.characters.set(npc.id, npc);
        
        console.log(`Updated ${npc.name}: ${oldElo} → ${newElo} ELO (reduced by ${oldElo - newElo})`);
        updatedCount++;
      } else {
        console.log(`Warning: NPC ${npc.name} not found in new data`);
      }
    }
    
    // Save to disk
    memoryStore.saveToDisk();
    
    console.log(`\nSuccessfully updated ${updatedCount} NPCs!`);
    console.log("NPCs are now 20-30% weaker than before.");
    
    // Show all NPCs with their new stats
    console.log("\nUpdated NPC list:");
    const allNPCs = Array.from(memoryStore.characters.values())
      .filter(char => char.isNPC)
      .sort((a, b) => (a.eloScore || 1000) - (b.eloScore || 1000));
    
    allNPCs.forEach(npc => {
      console.log(`- ${npc.name}: ${npc.eloScore || (npc as any).elo || 1000} ELO`);
    });
  } catch (error) {
    console.error("Error updating NPC stats:", error);
  }
}

// Run the update
updateNPCStats();