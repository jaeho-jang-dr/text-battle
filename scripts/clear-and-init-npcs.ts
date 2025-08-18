// Script to clear old NPCs and initialize new ones with weaker stats
import { memoryStore } from "../lib/db/memory-store";
import { npcCharacters } from "../lib/npc-data";

async function clearAndInitNPCs() {
  console.log("Clearing old NPCs and initializing new ones...");
  
  try {
    // Get all existing NPCs
    const existingNPCs = Array.from(memoryStore.characters.values())
      .filter(char => char.isNPC);
    
    console.log(`Found ${existingNPCs.length} existing NPCs to remove`);
    
    // Remove all existing NPCs
    for (const npc of existingNPCs) {
      memoryStore.characters.delete(npc.id);
      console.log(`Removed NPC: ${npc.name}`);
    }
    
    console.log("\nAdding new NPCs with weaker stats...");
    
    // Add new NPCs
    let count = 0;
    for (const npc of npcCharacters) {
      const npcId = `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const wins = Math.floor(Math.random() * 50); // Fewer wins
      const losses = Math.floor(Math.random() * 30); // Fewer losses
      
      const npcData = {
        id: npcId,
        userId: npcId,
        name: npc.name,
        battleChat: npc.battleChat,
        eloScore: npc.eloScore,
        wins: wins,
        losses: losses,
        isNPC: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      memoryStore.characters.set(npcId, npcData);
      count++;
      console.log(`Added NPC: ${npc.name} (ELO: ${npc.eloScore})`);
    }
    
    console.log(`\nSuccessfully initialized ${count} NPCs with weaker stats!`);
    console.log("NPCs are now 20-30% weaker than before.");
    
    // Show all NPCs
    console.log("\nNew NPC list (sorted by ELO):");
    const allNPCs = Array.from(memoryStore.characters.values())
      .filter(char => char.isNPC)
      .sort((a, b) => (a.eloScore || 1000) - (b.eloScore || 1000));
    
    allNPCs.forEach(npc => {
      console.log(`- ${npc.name}: ${npc.eloScore} ELO`);
    });
  } catch (error) {
    console.error("Error clearing and initializing NPCs:", error);
  }
}

// Run the initialization
clearAndInitNPCs();