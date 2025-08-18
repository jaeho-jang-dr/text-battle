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
          health: 70 + Math.floor(Math.random() * 35),  // Reduced from 100-150 to 70-105
          attack: 14 + Math.floor(Math.random() * 7),   // Reduced from 20-30 to 14-21
          defense: 10 + Math.floor(Math.random() * 7),  // Reduced from 15-25 to 10-17
          speed: 10 + Math.floor(Math.random() * 7),    // Reduced from 15-25 to 10-17
          magic: 7 + Math.floor(Math.random() * 7),     // Reduced from 10-20 to 7-14
          critical: 7 + Math.floor(Math.random() * 3),  // Reduced from 10-15 to 7-10
          evasion: 3 + Math.floor(Math.random() * 3)    // Reduced from 5-10 to 3-6
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