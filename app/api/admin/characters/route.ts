import { NextRequest, NextResponse } from "next/server";
import { adminOnly } from "@/lib/admin-auth-nextauth";
import { memoryStore } from "@/lib/db/memory-store";

export const GET = adminOnly(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageLimit = parseInt(url.searchParams.get("limit") || "20");
    const offset = (page - 1) * pageLimit;

    // Get all characters from memory store
    const allCharacters = Array.from(memoryStore.characters.values())
      .sort((a, b) => (b.eloScore || 1000) - (a.eloScore || 1000));
    
    let filteredCharacters = allCharacters;
    
    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCharacters = allCharacters.filter(char => 
        char.name.toLowerCase().includes(searchLower)
      );
    }
    
    const totalCount = filteredCharacters.length;
    
    // Paginate results
    const paginatedCharacters = filteredCharacters.slice(offset, offset + pageLimit);
    
    // Add user data to each character
    const characters = paginatedCharacters.map(character => {
      const user = character.userId ? memoryStore.users.get(character.userId) : null;
      return {
        ...character,
        users: user || null
      };
    });

    return NextResponse.json({
      characters,
      total: totalCount,
      page,
      limit: pageLimit,
      totalPages: Math.ceil(totalCount / pageLimit),
    });
  } catch (error) {
    console.error("Admin characters fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch characters" },
      { status: 500 }
    );
  }
});

export const PATCH = adminOnly(async (request: NextRequest) => {
  try {
    const { characterId, updates } = await request.json();

    const character = memoryStore.characters.get(characterId);
    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    // Update character
    await memoryStore.updateCharacter(characterId, updates);
    const updatedCharacter = memoryStore.characters.get(characterId);

    // Log admin action
    await memoryStore.createAdminLog({
      adminId: "admin@example.com",
      action: "character_update",
      details: {
        targetId: characterId,
        updates: updates
      }
    });

    return NextResponse.json({ character: updatedCharacter });
  } catch (error) {
    console.error("Admin character update error:", error);
    return NextResponse.json(
      { error: "Failed to update character" },
      { status: 500 }
    );
  }
});

export const DELETE = adminOnly(async (request: NextRequest) => {
  try {
    const { characterId } = await request.json();

    if (!memoryStore.characters.has(characterId)) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    // Delete character
    memoryStore.characters.delete(characterId);

    // Log admin action
    await memoryStore.createAdminLog({
      adminId: "admin@example.com",
      action: "character_delete",
      details: {
        targetId: characterId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin character delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete character" },
      { status: 500 }
    );
  }
});