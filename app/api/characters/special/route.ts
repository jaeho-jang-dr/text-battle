import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Character } from "@/types";

// Configuration for special modes
const SPECIAL_CONFIG = {
  c7: {
    level: 7,
    powerMultiplier: 1.7,
    specialAbilities: ["critical_strike", "dodge", "counter"]
  },
  seq: {
    enabled: true,
    processingOrder: ["validate", "enhance", "battle", "memory"]
  },
  magic: {
    enabled: true,
    spells: ["fireball", "healing", "shield", "teleport"],
    manaPool: 100
  },
  memory: {
    cacheEnabled: true,
    cacheDuration: 3600, // 1 hour in seconds
    maxEntries: 1000
  },
  serena: {
    characterId: "serena-special-npc",
    personalityTraits: ["wise", "mysterious", "powerful"],
    specialDialogue: true
  },
  persona: {
    enabled: true,
    traits: ["aggressive", "defensive", "balanced", "strategic"],
    adaptiveBehavior: true
  }
};

// In-memory cache for the memory flag
const memoryCache = new Map<string, { data: any; timestamp: number }>();

// Transform Firebase document to Character type with special enhancements
function transformSpecialCharacter(doc: any, flags: string[]): Character & { specialAttributes?: any } {
  const data = doc.data ? doc.data() : doc;
  const character: Character = {
    id: doc.id || data.id,
    userId: data.userId,
    name: data.name,
    battleChat: data.battleChat,
    eloScore: data.eloScore,
    wins: data.wins,
    losses: data.losses,
    isNPC: data.isNPC,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date()
  };

  // Apply special attributes based on flags
  const specialAttributes: any = {};

  if (flags.includes("c7")) {
    specialAttributes.level = SPECIAL_CONFIG.c7.level;
    specialAttributes.powerMultiplier = SPECIAL_CONFIG.c7.powerMultiplier;
    specialAttributes.abilities = SPECIAL_CONFIG.c7.specialAbilities;
  }

  if (flags.includes("magic")) {
    specialAttributes.magic = {
      enabled: true,
      spells: SPECIAL_CONFIG.magic.spells,
      currentMana: SPECIAL_CONFIG.magic.manaPool
    };
  }

  if (flags.includes("persona")) {
    specialAttributes.persona = {
      trait: SPECIAL_CONFIG.persona.traits[Math.floor(Math.random() * SPECIAL_CONFIG.persona.traits.length)],
      adaptiveBehavior: SPECIAL_CONFIG.persona.adaptiveBehavior
    };
  }

  return { ...character, specialAttributes };
}

// Parse flags from query string
function parseFlags(searchParams: URLSearchParams): string[] {
  const flags: string[] = [];
  
  if (searchParams.get("c7") === "true") flags.push("c7");
  if (searchParams.get("seq") === "true") flags.push("seq");
  if (searchParams.get("magic") === "true") flags.push("magic");
  if (searchParams.get("memory") === "true") flags.push("memory");
  if (searchParams.get("serena") === "true") flags.push("serena");
  if (searchParams.get("persona") === "true") flags.push("persona");
  
  return flags;
}

// Check memory cache
function checkMemoryCache(key: string): any | null {
  const cached = memoryCache.get(key);
  if (cached) {
    const now = Date.now();
    if (now - cached.timestamp < SPECIAL_CONFIG.memory.cacheDuration * 1000) {
      return cached.data;
    }
    memoryCache.delete(key);
  }
  return null;
}

// Update memory cache
function updateMemoryCache(key: string, data: any) {
  if (memoryCache.size >= SPECIAL_CONFIG.memory.maxEntries) {
    // Remove oldest entry
    const oldestKey = Array.from(memoryCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
    memoryCache.delete(oldestKey);
  }
  memoryCache.set(key, { data, timestamp: Date.now() });
}

// GET /api/characters/special - Get special characters with flags
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const flags = parseFlags(searchParams);
    const characterId = searchParams.get("characterId");
    
    // Check for Serena special request
    if (flags.includes("serena")) {
      // Check memory cache first
      if (flags.includes("memory")) {
        const cached = checkMemoryCache("serena-special");
        if (cached) {
          return NextResponse.json({ 
            data: cached,
            cached: true,
            flags 
          });
        }
      }

      // Create or get Serena special character
      const serenaDoc = await adminDb
        .collection("characters")
        .doc(SPECIAL_CONFIG.serena.characterId)
        .get();

      if (!serenaDoc.exists) {
        // Create Serena if doesn't exist
        const newSerenaData = {
          userId: "system",
          name: "Serena the Mystic",
          battleChat: "The ancient wisdom flows through me...",
          eloScore: 2000,
          wins: 100,
          losses: 10,
          isNPC: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await adminDb
          .collection("characters")
          .doc(SPECIAL_CONFIG.serena.characterId)
          .set(newSerenaData);
        
        const newSerena = { id: SPECIAL_CONFIG.serena.characterId, ...newSerenaData };

        const specialSerena = transformSpecialCharacter(newSerena, flags);
        
        if (flags.includes("memory")) {
          updateMemoryCache("serena-special", specialSerena);
        }

        return NextResponse.json({ 
          data: specialSerena,
          flags,
          created: true 
        });
      }

      const serenaData = { id: serenaDoc.id, ...serenaDoc.data() };
      const specialSerena = transformSpecialCharacter(serenaData, flags);
      
      if (flags.includes("memory")) {
        updateMemoryCache("serena-special", specialSerena);
      }

      return NextResponse.json({ 
        data: specialSerena,
        flags 
      });
    }

    // Handle regular character requests with special flags
    if (characterId) {
      // Check memory cache
      if (flags.includes("memory")) {
        const cacheKey = `character-${characterId}-${flags.join("-")}`;
        const cached = checkMemoryCache(cacheKey);
        if (cached) {
          return NextResponse.json({ 
            data: cached,
            cached: true,
            flags 
          });
        }
      }

      const characterDoc = await adminDb
        .collection("characters")
        .doc(characterId)
        .get();

      if (!characterDoc.exists) {
        return NextResponse.json(
          { error: "Character not found" },
          { status: 404 }
        );
      }
      
      const data = { id: characterDoc.id, ...characterDoc.data() };

      const specialCharacter = transformSpecialCharacter(data, flags);
      
      if (flags.includes("memory")) {
        const cacheKey = `character-${characterId}-${flags.join("-")}`;
        updateMemoryCache(cacheKey, specialCharacter);
      }

      return NextResponse.json({ 
        data: specialCharacter,
        flags 
      });
    }

    // Get all characters with special enhancements
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    const charactersRef = adminDb.collection("characters");
    let q = charactersRef.orderBy("eloScore", "desc").limit(limit);
    
    // Handle pagination with offset
    if (offset > 0) {
      const skipDocs = await charactersRef
        .orderBy("eloScore", "desc")
        .limit(offset)
        .get();
      
      if (!skipDocs.empty) {
        const lastDoc = skipDocs.docs[skipDocs.docs.length - 1];
        q = charactersRef
          .orderBy("eloScore", "desc")
          .startAfter(lastDoc)
          .limit(limit);
      }
    }
    
    const snapshot = await q.get();
    const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    const specialCharacters = data.map((doc: any) => transformSpecialCharacter(doc, flags));

    return NextResponse.json({ 
      data: specialCharacters,
      flags 
    });
  } catch (error) {
    console.error("Special characters endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/characters/special - Create special character with flags
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const flags = parseFlags(searchParams);
    const { userId, name, battleChat } = await request.json();

    if (!userId || !name || !battleChat) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Apply sequential processing if flag is set
    if (flags.includes("seq")) {
      const processingSteps = SPECIAL_CONFIG.seq.processingOrder;
      
      for (const step of processingSteps) {
        switch (step) {
          case "validate":
            // Validation logic already in place
            break;
          case "enhance":
            // Enhancement will be applied after creation
            break;
          case "battle":
            // Battle readiness check
            break;
          case "memory":
            // Memory will be handled after creation
            break;
        }
      }
    }

    // Check if user already has a character
    const existingSnapshot = await adminDb
      .collection("characters")
      .where("userId", "==", userId)
      .where("isNPC", "==", false)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { error: "You already have a character" },
        { status: 400 }
      );
    }

    // Calculate initial stats based on flags
    let initialElo = 1000;
    
    if (flags.includes("c7")) {
      initialElo = Math.floor(initialElo * SPECIAL_CONFIG.c7.powerMultiplier);
    }

    // Create the character
    const newCharacterData = {
      userId: userId,
      name: name.trim(),
      battleChat: battleChat.trim(),
      eloScore: initialElo,
      wins: 0,
      losses: 0,
      isNPC: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await adminDb
      .collection("characters")
      .add(newCharacterData);
    
    const data = { id: docRef.id, ...newCharacterData };

    const specialCharacter = transformSpecialCharacter(data, flags);

    // Cache if memory flag is set
    if (flags.includes("memory")) {
      const cacheKey = `character-${data.id}-${flags.join("-")}`;
      updateMemoryCache(cacheKey, specialCharacter);
    }

    return NextResponse.json({ 
      data: specialCharacter,
      flags 
    }, { status: 201 });
  } catch (error) {
    console.error("Create special character error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/characters/special - Update special character
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const flags = parseFlags(searchParams);
    const { characterId, userId, updates } = await request.json();

    if (!characterId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify ownership
    const characterDoc = await adminDb
      .collection("characters")
      .doc(characterId)
      .get();

    if (!characterDoc.exists || characterDoc.data()?.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Apply updates
    const updateData: any = {
      updatedAt: new Date()
    };

    if (updates.battleChat) {
      updateData.battleChat = updates.battleChat.trim();
    }

    // Apply special modifications based on flags
    if (flags.includes("c7") && updates.levelUp) {
      const currentData = characterDoc.data();
      updateData.eloScore = Math.floor((currentData?.eloScore || 1000) * SPECIAL_CONFIG.c7.powerMultiplier);
    }

    await adminDb
      .collection("characters")
      .doc(characterId)
      .update(updateData);
    
    const updatedDoc = await adminDb
      .collection("characters")
      .doc(characterId)
      .get();
    
    const data = { id: updatedDoc.id, ...updatedDoc.data() };

    const specialCharacter = transformSpecialCharacter(data, flags);

    // Update cache if memory flag is set
    if (flags.includes("memory")) {
      const cacheKey = `character-${characterId}-${flags.join("-")}`;
      updateMemoryCache(cacheKey, specialCharacter);
    }

    return NextResponse.json({ 
      data: specialCharacter,
      flags 
    });
  } catch (error) {
    console.error("Update special character error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}