import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/firestore/collections";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-simple";

// Special configuration flags implementation
const CONFIG = {
  c7: { powerMultiplier: 1.7, level: 7, abilities: ['critical_strike', 'dodge', 'counter'] },
  seq: { order: ['validate', 'enhance', 'battle', 'memory'], processSequentially: true },
  magic: { 
    enabled: true, 
    spells: ['fireball', 'healing', 'shield', 'teleport'],
    mana: 100,
    regenRate: 10
  },
  memory: { enabled: true, cacheSize: 1000, duration: 3600 },
  serena: { 
    npcId: 'serena_mystic',
    name: 'Serena the Mystic',
    elo: 2000,
    personality: 'mysterious and powerful',
    specialAbilities: ['mind_read', 'future_sight']
  },
  persona: {
    types: ['aggressive', 'defensive', 'balanced', 'strategic'],
    adaptiveAI: true
  }
};

// In-memory cache for the memory flag
const memoryCache = new Map();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const flags = searchParams.get('flags')?.split(',') || [];
    
    const response: any = {
      endpoint: 'magic',
      activeFlags: flags,
      configuration: {}
    };

    // Process flags
    if (flags.includes('c7')) {
      response.configuration.c7 = CONFIG.c7;
    }
    
    if (flags.includes('seq')) {
      response.configuration.seq = CONFIG.seq;
    }
    
    if (flags.includes('magic')) {
      response.configuration.magic = CONFIG.magic;
    }
    
    if (flags.includes('memory')) {
      response.configuration.memory = {
        ...CONFIG.memory,
        currentCacheSize: memoryCache.size
      };
    }
    
    if (flags.includes('serena')) {
      // Check if Serena NPC exists
      const serenaRef = adminDb.collection(COLLECTIONS.NPCS).doc(CONFIG.serena.npcId);
      const serenaDoc = await serenaRef.get();
      
      if (!serenaDoc.exists) {
        // Create Serena NPC
        await serenaRef.set({
          id: CONFIG.serena.npcId,
          name: CONFIG.serena.name,
          backstory: "A mysterious sorceress with unmatched magical powers",
          avatar: "/npcs/serena.webp",
          level: 10,
          experience: 10000,
          stats: {
            power: 200,
            speed: 180,
            defense: 150,
            hp: 2000,
            maxHp: 2000
          },
          wins: 0,
          losses: 0,
          elo: CONFIG.serena.elo,
          personality: CONFIG.serena.personality,
          difficultyLevel: 'hard',
          isSpecialNPC: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      response.configuration.serena = CONFIG.serena;
    }
    
    if (flags.includes('persona')) {
      response.configuration.persona = CONFIG.persona;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Magic endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { characterId, action, flags = [] } = body;

    if (!characterId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get character
    const charRef = adminDb.collection(COLLECTIONS.CHARACTERS).doc(characterId);
    const charDoc = await charRef.get();
    
    if (!charDoc.exists) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    const character = charDoc.data();
    let result: any = { characterId, action };

    // Process based on flags
    if (flags.includes('c7') && character) {
      // Apply C7 enhancements
      character.stats.power = Math.floor(character.stats.power * CONFIG.c7.powerMultiplier);
      character.level = Math.max(character.level, CONFIG.c7.level);
      await charRef.update({
        stats: character.stats,
        level: character.level,
        abilities: CONFIG.c7.abilities,
        updatedAt: new Date()
      });
      result.c7Applied = true;
    }

    if (flags.includes('magic') && action === 'cast_spell') {
      const { spell } = body;
      if (CONFIG.magic.spells.includes(spell)) {
        result.spellCast = spell;
        result.manaUsed = 20;
        result.effect = `${spell} successfully cast!`;
      }
    }

    if (flags.includes('memory')) {
      // Store in memory cache
      const key = `${characterId}_${Date.now()}`;
      memoryCache.set(key, {
        character,
        action,
        timestamp: new Date()
      });
      
      // Clean old entries
      if (memoryCache.size > CONFIG.memory.cacheSize) {
        const firstKey = memoryCache.keys().next().value;
        memoryCache.delete(firstKey);
      }
      
      result.memoryCached = true;
    }

    if (flags.includes('persona') && body.persona) {
      if (CONFIG.persona.types.includes(body.persona)) {
        await charRef.update({
          persona: body.persona,
          updatedAt: new Date()
        });
        result.personaSet = body.persona;
      }
    }

    return NextResponse.json({ 
      success: true,
      result 
    });
  } catch (error) {
    console.error("Magic POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { characterId, updates, flags = [] } = body;

    if (!characterId || !updates) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const charRef = adminDb.collection(COLLECTIONS.CHARACTERS).doc(characterId);
    const updateData: any = { ...updates, updatedAt: new Date() };

    // Apply flag-specific modifications
    if (flags.includes('seq')) {
      // Process updates sequentially as defined in CONFIG.seq.order
      for (const step of CONFIG.seq.order) {
        if (step === 'validate' && updates.stats) {
          // Validate stats
          updateData.stats = {
            power: Math.max(1, Math.min(999, updates.stats.power || 100)),
            speed: Math.max(1, Math.min(999, updates.stats.speed || 100)),
            defense: Math.max(1, Math.min(999, updates.stats.defense || 100)),
            hp: Math.max(1, updates.stats.hp || 100),
            maxHp: Math.max(1, updates.stats.maxHp || 100)
          };
        }
        
        if (step === 'enhance' && flags.includes('c7')) {
          updateData.enhanced = true;
          updateData.enhancementLevel = CONFIG.c7.level;
        }
      }
    }

    await charRef.update(updateData);

    return NextResponse.json({ 
      success: true,
      characterId,
      updated: Object.keys(updateData)
    });
  } catch (error) {
    console.error("Magic PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}