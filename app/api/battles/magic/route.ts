import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  runTransaction
} from "firebase/firestore";
import { cookies } from "next/headers";
import { Battle, Character } from "@/types";

// Magic battle system constants
const MAGIC_TYPES = {
  FIRE: { name: "Fire", weakness: "WATER", strength: "NATURE" },
  WATER: { name: "Water", weakness: "NATURE", strength: "FIRE" },
  NATURE: { name: "Nature", weakness: "FIRE", strength: "WATER" },
  LIGHT: { name: "Light", weakness: "DARK", strength: "DARK" },
  DARK: { name: "Dark", weakness: "LIGHT", strength: "LIGHT" },
  ARCANE: { name: "Arcane", weakness: "NONE", strength: "ALL" }
} as const;

// Persona archetypes for C7 implementation
const PERSONA_ARCHETYPES = {
  MAGICIAN: { primary: "ARCANE", secondary: "FIRE", memoryBonus: 1.2 },
  PRIESTESS: { primary: "LIGHT", secondary: "WATER", memoryBonus: 1.5 },
  EMPRESS: { primary: "NATURE", secondary: "LIGHT", memoryBonus: 1.3 },
  EMPEROR: { primary: "FIRE", secondary: "DARK", memoryBonus: 1.1 },
  HIEROPHANT: { primary: "LIGHT", secondary: "NATURE", memoryBonus: 1.4 },
  LOVERS: { primary: "WATER", secondary: "LIGHT", memoryBonus: 1.6 },
  CHARIOT: { primary: "FIRE", secondary: "ARCANE", memoryBonus: 1.0 },
} as const;

// Serena NPC configuration
const SERENA_CONFIG = {
  id: "serena-c7-magic",
  name: "Serena",
  battleChat: "The threads of fate weave through magic and memory...",
  persona: "PRIESTESS",
  magicType: "LIGHT",
  eloScore: 1500,
  memoryDepth: 7, // C7 level memory
  isNPC: true
};

interface MagicBattleData {
  attackerId: string;
  defenderId: string;
  attackerMagic?: keyof typeof MAGIC_TYPES;
  defenderMagic?: keyof typeof MAGIC_TYPES;
  sequence?: number;
  useMemory?: boolean;
  includeSerena?: boolean;
  persona?: keyof typeof PERSONA_ARCHETYPES;
}

interface BattleMemory {
  characterId: string;
  opponentId: string;
  magicUsed: string[];
  outcomes: boolean[];
  patterns: string[];
  lastBattleTime: Date;
  memoryStrength: number;
}

// Get or create Serena NPC
async function getOrCreateSerena() {
  const serenaRef = doc(db, "characters", SERENA_CONFIG.id);
  const serenaDoc = await getDoc(serenaRef);
  
  if (!serenaDoc.exists()) {
    await setDoc(serenaRef, {
      user_id: "system",
      name: SERENA_CONFIG.name,
      battle_chat: SERENA_CONFIG.battleChat,
      elo_score: SERENA_CONFIG.eloScore,
      wins: 0,
      losses: 0,
      is_npc: true,
      magic_type: SERENA_CONFIG.magicType,
      persona: SERENA_CONFIG.persona,
      memory_depth: SERENA_CONFIG.memoryDepth,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    return { ...SERENA_CONFIG };
  }
  
  return { id: serenaDoc.id, ...serenaDoc.data() };
}

// Get battle memory for a character
async function getBattleMemory(
  characterId: string, 
  opponentId: string
): Promise<BattleMemory | null> {
  const memoryRef = collection(db, "battle_memories");
  const memoryQuery = query(
    memoryRef,
    where("character_id", "==", characterId),
    where("opponent_id", "==", opponentId),
    limit(1)
  );
  
  const snapshot = await getDocs(memoryQuery);
  if (snapshot.empty) return null;
  
  const data = snapshot.docs[0].data();
  return {
    characterId: data.character_id,
    opponentId: data.opponent_id,
    magicUsed: data.magic_used || [],
    outcomes: data.outcomes || [],
    patterns: data.patterns || [],
    lastBattleTime: data.last_battle_time?.toDate() || new Date(),
    memoryStrength: data.memory_strength || 0
  };
}

// Update battle memory
async function updateBattleMemory(
  characterId: string,
  opponentId: string,
  magicType: string,
  won: boolean,
  memoryDepth: number = 5
) {
  const memoryRef = collection(db, "battle_memories");
  const memoryQuery = query(
    memoryRef,
    where("character_id", "==", characterId),
    where("opponent_id", "==", opponentId),
    limit(1)
  );
  
  const snapshot = await getDocs(memoryQuery);
  
  if (snapshot.empty) {
    // Create new memory
    await setDoc(doc(memoryRef), {
      character_id: characterId,
      opponent_id: opponentId,
      magic_used: [magicType],
      outcomes: [won],
      patterns: [],
      memory_strength: 1,
      last_battle_time: serverTimestamp(),
      created_at: serverTimestamp()
    });
  } else {
    // Update existing memory
    const docRef = snapshot.docs[0].ref;
    const data = snapshot.docs[0].data();
    
    const magicUsed = [...(data.magic_used || []), magicType].slice(-memoryDepth);
    const outcomes = [...(data.outcomes || []), won].slice(-memoryDepth);
    
    // Detect patterns
    const patterns = detectPatterns(magicUsed, outcomes);
    
    await updateDoc(docRef, {
      magic_used: magicUsed,
      outcomes: outcomes,
      patterns: patterns,
      memory_strength: Math.min((data.memory_strength || 0) + 0.1, memoryDepth),
      last_battle_time: serverTimestamp()
    });
  }
}

// Pattern detection for C7 memory system
function detectPatterns(magicUsed: string[], outcomes: boolean[]): string[] {
  const patterns: string[] = [];
  
  // Check for repeated magic sequences
  if (magicUsed.length >= 3) {
    const lastThree = magicUsed.slice(-3).join("-");
    const count = magicUsed.join("-").split(lastThree).length - 1;
    if (count >= 2) {
      patterns.push(`REPEAT_SEQUENCE:${lastThree}`);
    }
  }
  
  // Check for win/loss patterns
  const recentOutcomes = outcomes.slice(-5);
  const winRate = recentOutcomes.filter(o => o).length / recentOutcomes.length;
  if (winRate > 0.8) patterns.push("DOMINANT_STRATEGY");
  if (winRate < 0.2) patterns.push("WEAK_STRATEGY");
  
  // Check for magic type preferences
  const magicCounts = magicUsed.reduce((acc, magic) => {
    acc[magic] = (acc[magic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostUsed = Object.entries(magicCounts)
    .sort(([,a], [,b]) => b - a)[0];
  if (mostUsed && mostUsed[1] > magicUsed.length * 0.5) {
    patterns.push(`FAVORS:${mostUsed[0]}`);
  }
  
  return patterns;
}

// Calculate magic battle score with C7 enhancements
function calculateMagicBattleScore(
  attackerMagic: keyof typeof MAGIC_TYPES,
  defenderMagic: keyof typeof MAGIC_TYPES,
  attackerPersona?: keyof typeof PERSONA_ARCHETYPES,
  defenderPersona?: keyof typeof PERSONA_ARCHETYPES,
  attackerMemory?: BattleMemory | null,
  defenderMemory?: BattleMemory | null,
  sequence: number = 1
): { attackerScore: number; defenderScore: number; battleLog: string[] } {
  let attackerScore = 50;
  let defenderScore = 50;
  const battleLog: string[] = [];
  
  // Base magic interaction
  const attackMagic = MAGIC_TYPES[attackerMagic];
  const defenseMagic = MAGIC_TYPES[defenderMagic];
  
  if (defenderMagic === attackMagic.weakness) {
    defenderScore += 30;
    battleLog.push(`${defenseMagic.name} counters ${attackMagic.name}!`);
  } else if (defenderMagic === attackMagic.strength) {
    attackerScore += 30;
    battleLog.push(`${attackMagic.name} overwhelms ${defenseMagic.name}!`);
  }
  
  // Persona bonuses
  if (attackerPersona) {
    const persona = PERSONA_ARCHETYPES[attackerPersona];
    if (persona.primary === attackerMagic || persona.secondary === attackerMagic) {
      attackerScore += 15;
      battleLog.push(`${attackerPersona} resonates with ${attackMagic.name}`);
    }
    if (attackerMemory) {
      attackerScore += Math.floor(10 * persona.memoryBonus);
    }
  }
  
  if (defenderPersona) {
    const persona = PERSONA_ARCHETYPES[defenderPersona];
    if (persona.primary === defenderMagic || persona.secondary === defenderMagic) {
      defenderScore += 15;
      battleLog.push(`${defenderPersona} resonates with ${defenseMagic.name}`);
    }
    if (defenderMemory) {
      defenderScore += Math.floor(10 * persona.memoryBonus);
    }
  }
  
  // Memory-based predictions (C7 feature)
  if (attackerMemory && attackerMemory.patterns.length > 0) {
    const memoryBonus = Math.min(attackerMemory.memoryStrength * 5, 25);
    attackerScore += memoryBonus;
    battleLog.push(`Memory patterns grant +${memoryBonus} power`);
  }
  
  if (defenderMemory && defenderMemory.patterns.length > 0) {
    const memoryBonus = Math.min(defenderMemory.memoryStrength * 5, 25);
    defenderScore += memoryBonus;
    battleLog.push(`Defensive memories provide +${memoryBonus} resilience`);
  }
  
  // Sequence multiplier
  const sequenceMultiplier = 1 + (sequence - 1) * 0.1;
  attackerScore = Math.floor(attackerScore * sequenceMultiplier);
  defenderScore = Math.floor(defenderScore * sequenceMultiplier);
  
  if (sequence > 1) {
    battleLog.push(`Battle sequence ${sequence} intensifies the magic!`);
  }
  
  // Add randomness for unpredictability
  attackerScore += Math.floor(Math.random() * 20);
  defenderScore += Math.floor(Math.random() * 20);
  
  return { attackerScore, defenderScore, battleLog };
}

// POST /api/battles/magic - Create a magic battle with C7 features
export async function POST(request: NextRequest) {
  try {
    const data: MagicBattleData = await request.json();
    let { 
      attackerId, 
      defenderId, 
      attackerMagic = "FIRE",
      defenderMagic = "WATER",
      sequence = 1,
      useMemory = true,
      includeSerena = false,
      persona
    } = data;
    
    // Handle Serena inclusion
    if (includeSerena) {
      const serena = await getOrCreateSerena();
      if (!attackerId) {
        attackerId = serena.id;
        attackerMagic = (serena as any).magicType || (serena as any).magic_type || "ARCANE" as keyof typeof MAGIC_TYPES;
      } else if (!defenderId) {
        defenderId = serena.id;
        defenderMagic = (serena as any).magicType || (serena as any).magic_type || "ARCANE" as keyof typeof MAGIC_TYPES;
      }
    }
    
    if (!attackerId || !defenderId) {
      return NextResponse.json(
        { error: "Both attacker and defender IDs are required" },
        { status: 400 }
      );
    }
    
    // Get the current user from session
    const cookieStore = cookies();
    const userId = cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Execute the battle in a transaction
    const result = await runTransaction(db, async (transaction) => {
      // Get both characters
      const attackerRef = doc(db, "characters", attackerId);
      const defenderRef = doc(db, "characters", defenderId);
      
      const attackerDoc = await transaction.get(attackerRef);
      const defenderDoc = await transaction.get(defenderRef);
      
      if (!attackerDoc.exists() || !defenderDoc.exists()) {
        throw new Error("Character not found");
      }
      
      const attacker = attackerDoc.data();
      const defender = defenderDoc.data();
      
      // Verify ownership (unless NPC)
      if (!attacker.is_npc && attacker.user_id !== userId) {
        throw new Error("You can only battle with your own character");
      }
      
      // Get battle memories if enabled
      let attackerMemory: BattleMemory | null = null;
      let defenderMemory: BattleMemory | null = null;
      
      if (useMemory) {
        attackerMemory = await getBattleMemory(attackerId, defenderId);
        defenderMemory = await getBattleMemory(defenderId, attackerId);
      }
      
      // Get personas
      const attackerPersona = attacker.persona || persona;
      const defenderPersona = defender.persona;
      
      // Calculate battle outcome
      const { attackerScore, defenderScore, battleLog } = calculateMagicBattleScore(
        attackerMagic,
        defenderMagic,
        attackerPersona,
        defenderPersona,
        attackerMemory,
        defenderMemory,
        sequence
      );
      
      const winnerId = attackerScore > defenderScore ? attackerId : defenderId;
      const attackerWon = winnerId === attackerId;
      
      // Calculate ELO changes
      const kFactor = 32;
      const expectedScore = 1 / (1 + Math.pow(10, (defender.elo_score - attacker.elo_score) / 400));
      const actualScore = attackerWon ? 1 : 0;
      
      const eloChange = Math.round(kFactor * (actualScore - expectedScore));
      const newAttackerElo = attacker.elo_score + eloChange;
      const newDefenderElo = defender.elo_score - eloChange;
      
      // Create enhanced battle log
      const fullBattleLog = [
        `=== Magic Battle Sequence ${sequence} ===`,
        `${attacker.name} channels ${attackerMagic} magic`,
        `${defender.name} counters with ${defenderMagic} magic`,
        ...battleLog,
        `Final scores: ${attacker.name} (${attackerScore}) vs ${defender.name} (${defenderScore})`,
        `Winner: ${attackerWon ? attacker.name : defender.name}!`
      ].join("\n");
      
      // Create battle record
      const battleRef = doc(collection(db, "battles"));
      const battleData = {
        attacker_id: attackerId,
        defender_id: defenderId,
        winner_id: winnerId,
        attacker_score: attackerScore,
        defender_score: defenderScore,
        battle_log: fullBattleLog,
        battle_type: "magic",
        sequence: sequence,
        attacker_magic: attackerMagic,
        defender_magic: defenderMagic,
        memory_used: useMemory,
        created_at: serverTimestamp()
      };
      
      transaction.set(battleRef, battleData);
      
      // Update character stats
      transaction.update(attackerRef, {
        elo_score: newAttackerElo,
        wins: attackerWon ? attacker.wins + 1 : attacker.wins,
        losses: attackerWon ? attacker.losses : attacker.losses + 1,
        last_magic_used: attackerMagic,
        updated_at: serverTimestamp()
      });
      
      transaction.update(defenderRef, {
        elo_score: newDefenderElo,
        wins: attackerWon ? defender.wins : defender.wins + 1,
        losses: attackerWon ? defender.losses + 1 : defender.losses,
        last_magic_used: defenderMagic,
        updated_at: serverTimestamp()
      });
      
      // Update battle memories
      if (useMemory) {
        await updateBattleMemory(
          attackerId, 
          defenderId, 
          attackerMagic, 
          attackerWon,
          attacker.memory_depth || 5
        );
        await updateBattleMemory(
          defenderId, 
          attackerId, 
          defenderMagic, 
          !attackerWon,
          defender.memory_depth || 5
        );
      }
      
      return {
        id: battleRef.id,
        ...battleData,
        attacker: {
          name: attacker.name,
          oldElo: attacker.elo_score,
          newElo: newAttackerElo,
          persona: attackerPersona
        },
        defender: {
          name: defender.name,
          oldElo: defender.elo_score,
          newElo: newDefenderElo,
          persona: defenderPersona
        }
      };
    });
    
    return NextResponse.json({ 
      success: true,
      data: result,
      features: {
        c7Level: true,
        sequential: sequence,
        magicSystem: true,
        memoryEnabled: useMemory,
        serenaIncluded: includeSerena,
        personaActive: !!persona
      }
    });
    
  } catch (error: any) {
    console.error("Magic battle error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/battles/magic - Get magic battle info or memories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get("characterId");
    const opponentId = searchParams.get("opponentId");
    const getMemory = searchParams.get("memory") === "true";
    
    if (getMemory && characterId && opponentId) {
      const memory = await getBattleMemory(characterId, opponentId);
      return NextResponse.json({ 
        data: memory,
        hasMemory: !!memory 
      });
    }
    
    // Return magic system info
    return NextResponse.json({
      magicTypes: MAGIC_TYPES,
      personas: PERSONA_ARCHETYPES,
      serena: SERENA_CONFIG,
      features: {
        c7MemoryDepth: 7,
        sequentialBattles: true,
        personaSystem: true,
        patternRecognition: true
      }
    });
    
  } catch (error) {
    console.error("Get magic battle info error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}