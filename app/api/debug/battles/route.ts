import { memoryStore } from "@/lib/db/memory-store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    
    // Get recent battles from memory store
    const battles = Array.from(memoryStore.battles.values())
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit)
      .map(battle => ({
        id: battle.id,
        player1Id: battle.player1Id,
        player2Id: battle.player2Id,
        winnerId: battle.winnerId,
        player1EloChange: battle.player1EloChange,
        player2EloChange: battle.player2EloChange,
        createdAt: battle.createdAt
      }));
    
    // Get character names for the battles
    const battlesWithNames = battles.map(battle => {
      const player1 = memoryStore.characters.get(battle.player1Id);
      const player2 = memoryStore.characters.get(battle.player2Id);
      
      return {
        ...battle,
        player1Name: player1?.name || `Unknown (${battle.player1Id})`,
        player2Name: player2?.name || `Unknown (${battle.player2Id})`,
        winnerName: battle.winnerId === battle.player1Id ? 
          (player1?.name || 'Unknown') : 
          (player2?.name || 'Unknown')
      };
    });

    return NextResponse.json({
      success: true,
      battles: battlesWithNames,
      count: battles.length,
      totalBattles: memoryStore.battles.size,
      message: "Debug endpoint - showing recent battles"
    });
  } catch (error: any) {
    console.error("Error fetching battles:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}