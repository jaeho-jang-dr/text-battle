import { NextRequest, NextResponse } from "next/server";
import { memoryStore } from "@/lib/db/memory-store";

// Mock data for development
const mockCharacters = [
  {
    id: "char_1",
    name: "Thunder Knight",
    userId: "user_1",
    backstory: "A legendary warrior with lightning powers",
    level: 10,
    experience: 5000,
    stats: {
      power: 200,
      speed: 180,
      defense: 150,
      hp: 2000,
      maxHp: 2000
    },
    wins: 50,
    losses: 10,
    elo: 1800,
    isNPC: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "char_2",
    name: "Shadow Assassin",
    userId: "user_2",
    backstory: "A mysterious figure from the shadows",
    level: 9,
    experience: 4500,
    stats: {
      power: 250,
      speed: 220,
      defense: 100,
      hp: 1500,
      maxHp: 1500
    },
    wins: 45,
    losses: 15,
    elo: 1750,
    isNPC: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "npc_1",
    name: "Dragon Lord",
    backstory: "The ultimate boss NPC",
    level: 15,
    experience: 10000,
    stats: {
      power: 300,
      speed: 150,
      defense: 250,
      hp: 5000,
      maxHp: 5000
    },
    wins: 100,
    losses: 5,
    elo: 2000,
    isNPC: true,
    personality: "Arrogant and powerful",
    difficultyLevel: "hard",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get all characters from memory store
    const allCharacters = Array.from(memoryStore.characters.values());
    
    // Sort by ELO score (descending)
    const sortedCharacters = allCharacters.sort((a, b) => {
      const aElo = a.eloScore || 1000;
      const bElo = b.eloScore || 1000;
      return bElo - aElo;
    });
    
    // Apply pagination
    const paginatedCharacters = sortedCharacters.slice(offset, offset + limit);
    
    // Ensure field consistency
    const characters = paginatedCharacters.map(char => ({
      ...char,
      elo: char.eloScore || 1000,
      eloScore: char.eloScore || 1000,
    }));
    
    return NextResponse.json({ 
      data: characters,
      total: sortedCharacters.length 
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    
    // Return mock data on error as fallback
    return NextResponse.json({ 
      data: mockCharacters.slice(0, 10),
      total: mockCharacters.length 
    });
  }
}