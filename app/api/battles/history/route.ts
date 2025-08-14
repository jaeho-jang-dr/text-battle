import { NextRequest, NextResponse } from "next/server";
import { memoryStore } from "@/lib/db/memory-store";

// GET /api/battles/history - Get battle history for a character
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const characterId = searchParams.get("characterId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    
    if (!characterId) {
      return NextResponse.json(
        { error: "Character ID is required" },
        { status: 400 }
      );
    }
    
    // Get battle history from memory store
    const battles = Array.from(memoryStore.battles.values())
      .filter(battle => 
        battle.player1Id === characterId || battle.player2Id === characterId
      )
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(offset, offset + limit);
    
    return NextResponse.json({ data: battles });
  } catch (error) {
    console.error("Get battle history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}