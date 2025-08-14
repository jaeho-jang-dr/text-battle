import { NextRequest, NextResponse } from "next/server";
import { getCharacterById, updateCharacter, deleteCharacter } from "@/lib/character-server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-simple";

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

// PATCH /api/characters/[characterId] - Update character details
export async function PATCH(
  request: NextRequest,
  { params }: { params: { characterId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const characterId = params.characterId;
    const updates = await request.json();
    
    // First, get the character to verify ownership
    const { data: character, error: getError } = await getCharacterById(characterId);
    
    if (getError || !character) {
      return NextResponse.json(
        { error: getError || "Character not found" },
        { status: 404 }
      );
    }
    
    // Verify that the user owns this character
    if (character.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only update your own character" },
        { status: 403 }
      );
    }
    
    // Update the character
    const { data, error } = await updateCharacter(characterId, updates);
    
    if (error) {
      return NextResponse.json(
        { error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Update character error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/characters/[characterId] - Update character (alias for PATCH)
export async function PUT(
  request: NextRequest,
  params: { params: { characterId: string } }
) {
  return PATCH(request, params);
}

// DELETE /api/characters/[characterId] - Delete character
export async function DELETE(
  request: NextRequest,
  { params }: { params: { characterId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const characterId = params.characterId;
    
    if (!characterId) {
      return NextResponse.json(
        { error: "Character ID is required" },
        { status: 400 }
      );
    }
    
    const { success, error } = await deleteCharacter(characterId, session.user.id);
    
    if (!success) {
      return NextResponse.json(
        { error: error || "Failed to delete character" },
        { status: error === "Unauthorized" ? 403 : 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete character error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}