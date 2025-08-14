import { NextRequest, NextResponse } from "next/server";
import { adminOnly } from "@/lib/admin-auth-nextauth";
import { memoryStore } from "@/lib/db/memory-store";

export const GET = adminOnly(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageLimit = parseInt(url.searchParams.get("limit") || "50");
    const offset = (page - 1) * pageLimit;
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");
    const characterId = url.searchParams.get("characterId");

    // Get all battles from memory store
    let allBattles = Array.from(memoryStore.battles.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply filters
    if (dateFrom) {
      const dateFromTime = new Date(dateFrom).getTime();
      allBattles = allBattles.filter(battle => battle.createdAt.getTime() >= dateFromTime);
    }

    if (dateTo) {
      const dateToTime = new Date(dateTo).getTime();
      allBattles = allBattles.filter(battle => battle.createdAt.getTime() <= dateToTime);
    }

    if (characterId) {
      allBattles = allBattles.filter(battle => 
        battle.player1Id === characterId || battle.player2Id === characterId
      );
    }

    const totalCount = allBattles.length;
    
    // Paginate results
    const paginatedBattles = allBattles.slice(offset, offset + pageLimit);
    
    // Add character data to each battle
    const battles = paginatedBattles.map(battle => {
      const attacker = memoryStore.characters.get(battle.player1Id);
      const defender = memoryStore.characters.get(battle.player2Id);
      const winner = battle.winnerId ? memoryStore.characters.get(battle.winnerId) : null;
      
      return {
        ...battle,
        attacker: attacker || null,
        defender: defender || null,
        winner: winner || null,
        // Map field names to match frontend expectations
        attacker_id: battle.player1Id,
        defender_id: battle.player2Id,
        winner_id: battle.winnerId,
        created_at: battle.createdAt
      };
    });

    return NextResponse.json({
      battles,
      total: totalCount,
      page,
      limit: pageLimit,
      totalPages: Math.ceil(totalCount / pageLimit),
    });
  } catch (error) {
    console.error("Admin battles fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch battles" },
      { status: 500 }
    );
  }
});