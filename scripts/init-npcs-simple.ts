// Simple NPC initialization script
import { memoryStore } from "../lib/db/memory-store";
import { npcCharacters } from "../lib/npc-data";

async function initNPCs() {
  console.log("Initializing NPCs...");
  
  try {
    // Check current NPCs
    const existingNPCs = Array.from(memoryStore.characters.values())
      .filter(char => char.isNPC);
    
    console.log(`Found ${existingNPCs.length} existing NPCs`);
    
    if (existingNPCs.length > 0) {
      console.log("NPCs already exist:");
      existingNPCs.forEach(npc => {
        console.log(`- ${npc.name} (ELO: ${npc.eloScore || npc.elo || 1000})`);
      });
      return;
    }
    
    // Add new NPCs
    let count = 0;
    for (const npc of npcCharacters) {
      const npcId = `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const wins = Math.floor(Math.random() * 100);
      const losses = Math.floor(Math.random() * 50);
      
      const npcData = {
        id: npcId,
        userId: npcId,
        name: npc.name,
        battleChat: npc.battleChat,
        eloScore: npc.eloScore,
        elo: npc.eloScore, // Add for compatibility
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
    
    console.log(`\nSuccessfully initialized ${count} NPCs!`);
    
    // Show all characters
    console.log("\nAll characters in memory store:");
    Array.from(memoryStore.characters.values()).forEach(char => {
      console.log(`- ${char.name} (ELO: ${char.eloScore || char.elo || 1000}, NPC: ${char.isNPC || false})`);
    });
  } catch (error) {
    console.error("Error initializing NPCs:", error);
  }
}

// Run the initialization
initNPCs();