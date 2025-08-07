import { NextRequest, NextResponse } from "next/server";
import { getCharacterById } from "@/lib/character";

// GET /api/characters/[characterId] - Get character details
export async function GET(
  request: NextRequest,
  { params }: { params: { characterId: string } }
) {
  try {
    const characterId = params.characterId;
    
    if (!characterId) {
      return NextResponse.json(
        { error: "Character ID is required" },
        { status: 400 }
      );
    }
    
    const { data, error } = await getCharacterById(characterId);
    
    if (error || !data) {
      return NextResponse.json(
        { error: error || "Character not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Get character error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}