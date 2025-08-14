import { NextRequest, NextResponse } from "next/server";
import { adminOnly } from "@/lib/admin-auth-nextauth";
import { memoryStore } from "@/lib/db/memory-store";
import { npcCharacters } from "@/lib/npc-data";

// POST /api/admin/npcs/init - Initialize NPC characters
export const POST = adminOnly(async (req: NextRequest) => {
  try {
    // Check if NPCs already exist
    const existingNPCs = Array.from(memoryStore.characters.values())
      .filter(char => char.isNPC);
    
    if (existingNPCs.length > 0) {
      return NextResponse.json({
        message: `NPCs already initialized. Found ${existingNPCs.length} NPCs.`,
        count: existingNPCs.length,
        npcs: existingNPCs.map(npc => ({
          id: npc.id,
          name: npc.name,
          eloScore: npc.eloScore
        }))
      });
    }

    // Create NPCs
    const createdNPCs: any[] = [];
    
    for (const npc of npcCharacters) {
      const npcId = `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const wins = Math.floor(Math.random() * 100);
      const losses = Math.floor(Math.random() * 50);
      const totalBattles = wins + losses;
      
      const npcData = {
        id: npcId,
        userId: npcId,
        name: npc.name,
        type: 'warrior',
        level: Math.floor(npc.eloScore / 100),
        experience: 0,
        experienceToNext: 100,
        stats: {
          health: 100 + Math.floor(Math.random() * 50),
          attack: 20 + Math.floor(Math.random() * 10),
          defense: 15 + Math.floor(Math.random() * 10),
          speed: 15 + Math.floor(Math.random() * 10),
          magic: 10 + Math.floor(Math.random() * 10),
          critical: 10 + Math.floor(Math.random() * 5),
          evasion: 5 + Math.floor(Math.random() * 5)
        },
        battleChat: npc.battleChat,
        eloScore: npc.eloScore,
        rating: npc.eloScore,
        wins: wins,
        losses: losses,
        totalBattles: totalBattles,
        winRate: totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0,
        dailyBattlesCount: 0,
        lastBattleTime: null,
        isNPC: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      memoryStore.characters.set(npcId, npcData);
      createdNPCs.push({
        id: npcId,
        name: npc.name,
        eloScore: npc.eloScore
      });
    }
    
    // Log admin action
    await memoryStore.createAdminLog({
      adminId: "admin@example.com",
      action: "npcs_initialized",
      details: {
        count: createdNPCs.length,
        npcIds: createdNPCs.map(npc => npc.id)
      }
    });
    
    return NextResponse.json({
      message: "NPCs initialized successfully",
      count: createdNPCs.length,
      npcs: createdNPCs
    });

  } catch (error) {
    console.error("Error initializing NPCs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});