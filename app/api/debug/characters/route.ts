import { memoryStore } from "@/lib/db/memory-store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get all characters from memory store
    const characters = Array.from(memoryStore.characters.values()).map(char => ({
      id: char.id,
      userId: char.userId,
      name: char.name,
      isNPC: char.isNPC,
      eloScore: char.eloScore,
      wins: char.wins,
      losses: char.losses
    }));

    // Find specific character if name provided
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name");
    
    if (name) {
      const foundChar = characters.find(c => c.name === name);
      return NextResponse.json({
        success: true,
        found: !!foundChar,
        character: foundChar,
        message: foundChar ? `Found character: ${name}` : `Character not found: ${name}`
      });
    }

    return NextResponse.json({
      success: true,
      characters,
      count: characters.length,
      npcs: characters.filter(c => c.isNPC).length,
      players: characters.filter(c => !c.isNPC).length,
      message: "Debug endpoint - showing all characters in memory store"
    });
  } catch (error: any) {
    console.error("Error fetching characters:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}