import { NextRequest, NextResponse } from "next/server";
import { getAllCharacters, getCharacterByUserId, createCharacter } from "@/lib/character-server";

// GET /api/characters - Get all characters or by userId
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    
    // If userId is provided, get character for that user
    if (userId) {
      const { data, error } = await getCharacterByUserId(userId);
      
      if (error) {
        return NextResponse.json(
          { error: error },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ data });
    }
    
    // Otherwise, get all characters
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    
    const { data, error } = await getAllCharacters(limit, offset);
    
    if (error) {
      return NextResponse.json(
        { error: error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ characters: data });
  } catch (error) {
    console.error("Get characters error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/characters - Create a new character
export async function POST(request: NextRequest) {
  try {
    const { userId, name, battleChat } = await request.json();
    
    if (!userId || !name || !battleChat) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const { data, error } = await createCharacter(userId, name, battleChat);
    
    if (error) {
      return NextResponse.json(
        { error: error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error("Create character error:", error);
    console.error("Error details:", error.message);
    console.error("Stack:", error.stack);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}