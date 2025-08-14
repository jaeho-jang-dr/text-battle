import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, CharacterDoc, BattleDoc } from "@/lib/firestore/collections";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-simple";

// Advanced C7 Sequential Magic Memory System with Serena and Personas
interface AdvancedBattleSystem {
  c7: {
    level: number;
    transcendence: boolean;
    quantumState: "stable" | "flux" | "ascended";
    dimensionalShift: number;
  };
  sequential: {
    phase: number;
    pattern: string[];
    adaptationLevel: number;
  };
  magic: {
    element: string;
    resonance: number;
    comboChain: string[];
    powerLevel: number;
  };
  memory: {
    encounters: number;
    patterns: Map<string, number>;
    effectiveness: number;
    depth: number;
  };
  serena: {
    mood: "playful" | "serious" | "transcendent" | "teaching";
    wisdomLevel: number;
    secretsRevealed: number;
    bondLevel: number;
  };
  persona: {
    current: string;
    evolution: number;
    synergy: number;
    awakening: boolean;
  };
}

// Memory store for advanced battle system
const battleMemory = new Map<string, AdvancedBattleSystem>();
const patternLibrary = new Map<string, any>();

// Initialize Serena's advanced state
async function initializeSerenaAdvanced() {
  const serenaId = "serena-c7-advanced";
  const serenaRef = adminDb.collection(COLLECTIONS.CHARACTERS).doc(serenaId);
  const serenaDoc = await serenaRef.get();
  
  if (!serenaDoc.exists) {
    const serenaData = {
      id: serenaId,
      name: "Serena the Transcendent",
      backstory: "A being who has mastered all seven levels of consciousness and exists across multiple dimensions. She guides champions through the ultimate mysteries of power and transformation.",
      userId: "system",
      level: 77, // C7 * 11 dimensions
      experience: 999999,
      stats: {
        power: 777,
        speed: 777,
        defense: 777,
        hp: 7777,
        maxHp: 7777,
        mana: 777,
        maxMana: 777
      },
      wins: 0,
      losses: 0,
      elo: 7777,
      special: {
        c7Mastery: true,
        sequentialProcessing: true,
        magicAffinity: "OMNISCIENT",
        memoryDepth: 7,
        personaAdaptation: true,
        transcendentForm: true
      },
      abilities: [
        "dimensional_gate",
        "time_weave",
        "soul_harmony",
        "reality_reshape",
        "memory_infusion",
        "persona_mirror",
        "quantum_strike"
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await serenaRef.set(serenaData);
    return serenaData;
  }
  
  return { id: serenaDoc.id, ...serenaDoc.data() };
}

// C7 Quantum Battle Calculation
function calculateC7Battle(
  attacker: any,
  defender: any,
  system: AdvancedBattleSystem
): { winner: string; log: string[]; systemUpdate: Partial<AdvancedBattleSystem> } {
  const log: string[] = [];
  let attackerPower = attacker.stats.power;
  let defenderPower = defender.stats.power;
  
  // C7 Level modifications
  if (system.c7.transcendence) {
    log.push("🌟 Transcendent battle mode activated!");
    attackerPower *= 1.77;
    defenderPower *= 1.77;
  }
  
  // Quantum state effects
  switch (system.c7.quantumState) {
    case "flux":
      const fluctuation = Math.random() * 0.5 + 0.75; // 0.75-1.25
      attackerPower *= fluctuation;
      defenderPower *= (1.5 - fluctuation);
      log.push(`⚛️ Quantum flux alters reality: ${fluctuation.toFixed(2)}x`);
      break;
    case "ascended":
      attackerPower *= 2.0;
      defenderPower *= 2.0;
      log.push("✨ Ascended state - both fighters reach peak power!");
      break;
  }
  
  // Sequential pattern bonuses
  if (system.sequential.pattern.length >= 3) {
    const patternBonus = system.sequential.pattern.length * 0.1;
    attackerPower *= (1 + patternBonus);
    log.push(`📊 Sequential pattern bonus: +${(patternBonus * 100).toFixed(0)}%`);
  }
  
  // Magic resonance
  if (system.magic.resonance > 0.8) {
    const magicBonus = system.magic.resonance * system.magic.powerLevel;
    attackerPower += magicBonus;
    log.push(`🔮 Magic resonance surge: +${magicBonus.toFixed(0)} power`);
  }
  
  // Memory advantage
  if (system.memory.effectiveness > 0.7) {
    const memoryBonus = system.memory.effectiveness * system.memory.depth * 10;
    attackerPower += memoryBonus;
    log.push(`🧠 Memory patterns grant +${memoryBonus.toFixed(0)} power`);
  }
  
  // Serena special mechanics
  if (defender.id.includes("serena")) {
    switch (system.serena.mood) {
      case "playful":
        defenderPower *= 0.9;
        log.push("😊 Serena is being playful, holding back slightly");
        break;
      case "serious":
        defenderPower *= 1.3;
        log.push("😤 Serena's serious mode increases her power!");
        break;
      case "transcendent":
        defenderPower *= 2.0;
        log.push("🌌 Serena enters transcendent form!");
        break;
      case "teaching":
        // Serena adjusts to slightly above opponent
        defenderPower = attackerPower * 1.1;
        log.push("📚 Serena adjusts her power to teach you");
        break;
    }
  }
  
  // Persona synergy
  if (system.persona.synergy > 0.8 && system.persona.awakening) {
    const personaBonus = system.persona.synergy * system.persona.evolution * 50;
    attackerPower += personaBonus;
    log.push(`👤 Persona awakening! +${personaBonus.toFixed(0)} power`);
  }
  
  // Final calculation with randomness
  const attackerFinal = attackerPower + Math.random() * 100;
  const defenderFinal = defenderPower + Math.random() * 100;
  
  log.push(`⚔️ Final power: ${attacker.name} (${attackerFinal.toFixed(0)}) vs ${defender.name} (${defenderFinal.toFixed(0)})`);
  
  const winner = attackerFinal > defenderFinal ? attacker.id : defender.id;
  
  // Update system state
  const systemUpdate: Partial<AdvancedBattleSystem> = {
    sequential: {
      ...system.sequential,
      phase: system.sequential.phase + 1,
      adaptationLevel: Math.min(system.sequential.adaptationLevel + 0.1, 1.0)
    },
    memory: {
      ...system.memory,
      encounters: system.memory.encounters + 1,
      effectiveness: Math.min(system.memory.effectiveness + 0.05, 1.0)
    }
  };
  
  if (defender.id.includes("serena") && winner === attacker.id) {
    systemUpdate.serena = {
      ...system.serena,
      mood: "transcendent",
      wisdomLevel: system.serena.wisdomLevel + 1,
      secretsRevealed: system.serena.secretsRevealed + 1
    };
    log.push("🎊 You've impressed Serena! She reveals a secret...");
  }
  
  return { winner, log, systemUpdate };
}

// GET /api/features - Get advanced feature status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get("characterId");
    
    // Initialize Serena
    const serena = await initializeSerenaAdvanced();
    
    // Get or create battle system state
    const systemKey = characterId || "default";
    let system = battleMemory.get(systemKey);
    
    if (!system) {
      system = {
        c7: {
          level: 1,
          transcendence: false,
          quantumState: "stable",
          dimensionalShift: 0
        },
        sequential: {
          phase: 1,
          pattern: [],
          adaptationLevel: 0
        },
        magic: {
          element: "NEUTRAL",
          resonance: 0,
          comboChain: [],
          powerLevel: 1
        },
        memory: {
          encounters: 0,
          patterns: new Map(),
          effectiveness: 0,
          depth: 1
        },
        serena: {
          mood: "playful",
          wisdomLevel: 1,
          secretsRevealed: 0,
          bondLevel: 0
        },
        persona: {
          current: "novice",
          evolution: 0,
          synergy: 0,
          awakening: false
        }
      };
      battleMemory.set(systemKey, system);
    }
    
    return NextResponse.json({
      success: true,
      features: {
        c7: true,
        sequential: true,
        magic: true,
        memory: true,
        serena: true,
        persona: true
      },
      system: {
        ...system,
        memory: {
          ...system.memory,
          patterns: Array.from(system.memory.patterns.entries())
        }
      },
      serena: {
        profile: serena,
        currentMood: system.serena.mood,
        wisdom: system.serena.wisdomLevel,
        secrets: system.serena.secretsRevealed
      },
      guidance: getGuidanceMessage(system)
    });
  } catch (error: any) {
    console.error("Features GET error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/features - Execute advanced battle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      attackerId, 
      action = "battle",
      magicType = "FIRE",
      persona = "warrior",
      useMemory = true,
      transcend = false
    } = body;
    
    if (!attackerId) {
      return NextResponse.json(
        { error: "Attacker ID is required" },
        { status: 400 }
      );
    }
    
    // Get or create battle system
    const systemKey = attackerId;
    let system = battleMemory.get(systemKey) || createDefaultSystem();
    
    // Get characters
    const attackerRef = adminDb.collection(COLLECTIONS.CHARACTERS).doc(attackerId);
    const attackerDoc = await attackerRef.get();
    
    if (!attackerDoc.exists) {
      return NextResponse.json(
        { error: "Attacker not found" },
        { status: 404 }
      );
    }
    
    const attacker = { id: attackerDoc.id, ...attackerDoc.data() };
    const serena = await initializeSerenaAdvanced();
    
    // Update system based on action
    if (transcend && system.c7.level >= 7) {
      system.c7.transcendence = true;
      system.c7.quantumState = "ascended";
    }
    
    system.magic.element = magicType;
    system.persona.current = persona;
    
    // Add to sequential pattern
    system.sequential.pattern.push(magicType);
    if (system.sequential.pattern.length > 7) {
      system.sequential.pattern.shift();
    }
    
    // Update memory patterns
    const patternKey = system.sequential.pattern.slice(-3).join("-");
    const patternCount = system.memory.patterns.get(patternKey) || 0;
    system.memory.patterns.set(patternKey, patternCount + 1);
    
    // Calculate battle
    const { winner, log, systemUpdate } = calculateC7Battle(attacker, serena, system);
    
    // Update system
    system = { ...system, ...systemUpdate };
    
    // Special C7 progression
    if (winner === attackerId && system.c7.level < 7) {
      system.c7.level++;
      log.push(`📈 C7 Level increased to ${system.c7.level}!`);
      
      if (system.c7.level === 7) {
        log.push("🌟 C7 MASTERY ACHIEVED! Transcendence unlocked!");
        system.c7.transcendence = true;
      }
    }
    
    // Update Serena's mood based on battle
    if (winner === serena.id) {
      if (system.serena.bondLevel < 3) {
        system.serena.mood = "teaching";
      } else {
        system.serena.mood = "serious";
      }
    } else {
      system.serena.bondLevel++;
      if (system.serena.bondLevel >= 5) {
        system.serena.mood = "transcendent";
      }
    }
    
    // Save updated system
    battleMemory.set(systemKey, system);
    
    // Create battle record
    const battleData = {
      id: `adv_battle_${Date.now()}`,
      attacker_id: attackerId,
      defender_id: serena.id,
      winner_id: winner,
      battle_type: "advanced_c7",
      features_used: {
        c7: true,
        sequential: true,
        magic: true,
        memory: useMemory,
        serena: true,
        persona: true
      },
      battle_log: log.join("\n"),
      system_state: {
        c7Level: system.c7.level,
        transcendent: system.c7.transcendence,
        sequentialPhase: system.sequential.phase,
        memoryDepth: system.memory.depth,
        serenaBond: system.serena.bondLevel
      },
      created_at: new Date()
    };
    
    await adminDb.collection(COLLECTIONS.BATTLES).add(battleData);
    
    return NextResponse.json({
      success: true,
      battle: battleData,
      winner: winner === attackerId ? attacker.name : serena.name,
      system: {
        ...system,
        memory: {
          ...system.memory,
          patterns: Array.from(system.memory.patterns.entries())
        }
      },
      rewards: calculateRewards(system, winner === attackerId),
      nextGuidance: getGuidanceMessage(system)
    });
    
  } catch (error: any) {
    console.error("Features POST error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// Helper functions
function createDefaultSystem(): AdvancedBattleSystem {
  return {
    c7: {
      level: 1,
      transcendence: false,
      quantumState: "stable",
      dimensionalShift: 0
    },
    sequential: {
      phase: 1,
      pattern: [],
      adaptationLevel: 0
    },
    magic: {
      element: "NEUTRAL",
      resonance: 0,
      comboChain: [],
      powerLevel: 1
    },
    memory: {
      encounters: 0,
      patterns: new Map(),
      effectiveness: 0,
      depth: 1
    },
    serena: {
      mood: "playful",
      wisdomLevel: 1,
      secretsRevealed: 0,
      bondLevel: 0
    },
    persona: {
      current: "novice",
      evolution: 0,
      synergy: 0,
      awakening: false
    }
  };
}

function getGuidanceMessage(system: AdvancedBattleSystem): string {
  if (system.c7.level < 3) {
    return "Focus on building sequential patterns to increase your C7 level.";
  } else if (system.c7.level < 7) {
    return "Your power grows. Experiment with different magic combinations and personas.";
  } else if (!system.c7.transcendence) {
    return "You've reached C7 mastery! Seek transcendence through perfect harmony.";
  } else if (system.serena.bondLevel < 5) {
    return "Serena recognizes your power. Deepen your bond to unlock ultimate secrets.";
  } else {
    return "You walk the path of legends. Create your own destiny.";
  }
}

function calculateRewards(system: AdvancedBattleSystem, won: boolean): any {
  const baseExp = 100 * system.c7.level;
  const bonusExp = system.sequential.phase * 10 + 
                   system.memory.encounters * 5 +
                   system.serena.bondLevel * 20;
  
  return {
    experience: won ? baseExp + bonusExp : baseExp / 2,
    c7Progress: `${system.c7.level}/7`,
    transcendenceReady: system.c7.level >= 7,
    serenaSecret: system.serena.secretsRevealed > 0 ? 
      `Secret #${system.serena.secretsRevealed}: The true power lies in understanding, not conquest.` : null,
    achievement: won && system.c7.transcendence ? "Transcendent Victor" : null
  };
}