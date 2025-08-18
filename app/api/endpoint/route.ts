import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, CharacterDoc, NPCDoc, BattleDoc } from "@/lib/firestore/collections";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-simple";

// Comprehensive feature configuration
const FEATURES = {
  c7: {
    enabled: false,
    level: 7,
    powerMultiplier: 1.7,
    abilities: ["critical_strike", "dodge", "counter", "combo_breaker", "transcendence", "quantum_strike", "temporal_shift"],
    criticalChance: 0.25,
    dodgeChance: 0.15,
    counterChance: 0.20,
    comboDamageMultiplier: 2.5,
    transcendenceThreshold: 0.7,
    quantumProbability: 0.33,
    temporalWindow: 3
  },
  seq: {
    enabled: false,
    processingOrder: ["authenticate", "validate", "enhance", "execute", "memory", "learn", "adapt", "respond"],
    strictOrder: true,
    parallelAllowed: false,
    adaptiveSequencing: true,
    contextAwareOrdering: true
  },
  magic: {
    enabled: false,
    spells: {
      fireball: { damage: 150, manaCost: 30, cooldown: 3, type: "FIRE" },
      healing: { heal: 100, manaCost: 20, cooldown: 5, type: "LIGHT" },
      shield: { defense: 50, duration: 3, manaCost: 25, cooldown: 4, type: "ARCANE" },
      teleport: { dodgeChance: 1.0, manaCost: 40, cooldown: 6, type: "ARCANE" },
      thunderstrike: { damage: 200, stunChance: 0.3, manaCost: 50, cooldown: 8, type: "NATURE" },
      mindcontrol: { controlDuration: 2, manaCost: 60, cooldown: 10, type: "DARK" },
      timefreeze: { duration: 4, manaCost: 80, cooldown: 15, type: "ARCANE" },
      soulburn: { damage: 300, selfDamage: 50, manaCost: 70, cooldown: 12, type: "DARK" }
    },
    maxMana: 100,
    manaRegenRate: 5,
    spellPower: 1.0,
    elementalAffinities: true,
    comboSpells: true
  },
  memory: {
    enabled: false,
    cacheType: "lru", // least recently used
    maxEntries: 1000,
    ttl: 3600, // 1 hour
    compressionEnabled: true,
    persistentStorage: false,
    patternRecognition: true,
    adaptiveCaching: true,
    memoryDepth: 7,
    contextualMemory: true
  },
  serena: {
    enabled: false,
    npcId: "serena-the-mystic",
    profile: {
      name: "Serena the Mystic",
      title: "Keeper of Ancient Wisdom",
      backstory: "A powerful sorceress who has mastered the ancient arts of magic and transcended mortal limitations. She exists between realms, guiding worthy champions through the mysteries of power.",
      avatar: "/npcs/serena-mystic.webp",
      personality: "mysterious, wise, occasionally playful, deeply insightful",
      voiceLines: {
        greeting: "Ah, another soul seeks the ancient wisdom...",
        victory: "The threads of fate were clear from the beginning.",
        defeat: "Even the eternal can learn from mortality.",
        special: "Let me show you the true nature of magic...",
        c7activation: "You have reached the seventh seal. Prepare for transcendence.",
        memoryTrigger: "I remember you... and all your patterns.",
        personaShift: "Your true nature reveals itself in battle."
      }
    },
    stats: {
      level: 50,
      power: 300,
      speed: 250,
      defense: 200,
      hp: 5000,
      maxHp: 5000,
      mana: 500,
      maxMana: 500
    },
    abilities: ["mind_read", "future_sight", "reality_warp", "time_stop", "soul_resonance", "dimensional_shift", "memory_extraction"],
    elo: 3000,
    specialMechanics: {
      adaptiveDifficulty: true,
      learnsFromOpponent: true,
      multiPhaseEncounter: true,
      hiddenPotential: true
    }
  },
  persona: {
    enabled: false,
    types: {
      aggressive: {
        attackBonus: 1.3,
        defenseBonus: 0.8,
        speedBonus: 1.1,
        behavior: "prefers offensive moves, takes risks",
        preferredMagic: ["FIRE", "DARK"],
        comboProbability: 0.7
      },
      defensive: {
        attackBonus: 0.9,
        defenseBonus: 1.4,
        speedBonus: 0.9,
        behavior: "focuses on survival, counter-attacks",
        preferredMagic: ["LIGHT", "NATURE"],
        comboProbability: 0.3
      },
      balanced: {
        attackBonus: 1.0,
        defenseBonus: 1.0,
        speedBonus: 1.0,
        behavior: "adapts to opponent's style",
        preferredMagic: ["WATER", "ARCANE"],
        comboProbability: 0.5
      },
      strategic: {
        attackBonus: 1.1,
        defenseBonus: 1.1,
        speedBonus: 1.2,
        behavior: "analyzes patterns, exploits weaknesses",
        preferredMagic: ["ARCANE", "LIGHT"],
        comboProbability: 0.6
      },
      mystic: {
        attackBonus: 1.2,
        defenseBonus: 1.0,
        speedBonus: 1.3,
        behavior: "channels ancient powers, unpredictable",
        preferredMagic: ["ARCANE", "DARK", "LIGHT"],
        comboProbability: 0.8
      }
    },
    adaptiveAI: true,
    learningRate: 0.1,
    personaEvolution: true,
    contextualPersona: true
  }
};

// Memory cache implementation
class MemoryCache {
  private cache: Map<string, { data: any; timestamp: number; hits: number }>;
  private maxEntries: number;
  private ttl: number;

  constructor(maxEntries: number, ttl: number) {
    this.cache = new Map();
    this.maxEntries = maxEntries;
    this.ttl = ttl;
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.data;
  }

  set(key: string, data: any): void {
    if (this.cache.size >= this.maxEntries) {
      // Remove least recently used
      let lruKey = "";
      let lruTime = Infinity;
      
      Array.from(this.cache.entries()).forEach(([k, v]) => {
        if (v.timestamp < lruTime) {
          lruTime = v.timestamp;
          lruKey = k;
        }
      });
      
      if (lruKey) this.cache.delete(lruKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0
    });
  }

  getStats() {
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      ttl: this.ttl,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        hits: value.hits,
        age: Math.floor((Date.now() - value.timestamp) / 1000)
      }))
    };
  }

  clear(): void {
    this.cache.clear();
  }
}

// Initialize memory cache
const memoryCache = new MemoryCache(
  FEATURES.memory.maxEntries,
  FEATURES.memory.ttl
);

// Parse feature flags from request
function parseFeatures(request: NextRequest): typeof FEATURES {
  const features = { ...FEATURES };
  const searchParams = request.nextUrl.searchParams;

  // Check each feature flag
  if (searchParams.get("c7") === "true") features.c7.enabled = true;
  if (searchParams.get("seq") === "true") features.seq.enabled = true;
  if (searchParams.get("magic") === "true") features.magic.enabled = true;
  if (searchParams.get("memory") === "true") features.memory.enabled = true;
  if (searchParams.get("serena") === "true") features.serena.enabled = true;
  if (searchParams.get("persona") === "true") features.persona.enabled = true;
  
  // Enable all features if "all" is specified
  if (searchParams.get("all") === "true") {
    features.c7.enabled = true;
    features.seq.enabled = true;
    features.magic.enabled = true;
    features.memory.enabled = true;
    features.serena.enabled = true;
    features.persona.enabled = true;
  }

  return features;
}

// Sequential processing implementation
async function processSequentially(
  steps: string[],
  handlers: Record<string, () => Promise<any>>
): Promise<any[]> {
  const results: any[] = [];
  
  for (const step of steps) {
    if (handlers[step]) {
      try {
        const result = await handlers[step]();
        results.push({ step, success: true, data: result });
      } catch (error: any) {
        results.push({ step, success: false, error: error.message || 'Unknown error' });
        throw error; // Stop on error
      }
    }
  }
  
  return results;
}

// Create or get Serena NPC
async function getOrCreateSerena(features: typeof FEATURES): Promise<NPCDoc> {
  const serenaRef = adminDb.collection(COLLECTIONS.NPCS).doc(features.serena.npcId);
  const serenaDoc = await serenaRef.get();

  if (serenaDoc.exists) {
    return serenaDoc.data() as NPCDoc;
  }

  // Create Serena
  const serenaData: NPCDoc = {
    id: features.serena.npcId,
    name: features.serena.profile.name,
    backstory: features.serena.profile.backstory,
    avatar: features.serena.profile.avatar,
    level: features.serena.stats.level,
    experience: 100000,
    stats: features.serena.stats,
    wins: 0,
    losses: 0,
    elo: features.serena.elo,
    personality: features.serena.profile.personality,
    difficultyLevel: 'hard',
    isSpecialNPC: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await serenaRef.set(serenaData);
  return serenaData;
}

// Apply C7 enhancements to character
function applyC7Enhancements(character: CharacterDoc, features: typeof FEATURES): CharacterDoc {
  if (!features.c7.enabled) return character;

  return {
    ...character,
    level: Math.max(character.level, features.c7.level),
    stats: {
      ...character.stats,
      power: Math.floor(character.stats.power * features.c7.powerMultiplier),
      speed: Math.floor(character.stats.speed * 1.3),
      defense: Math.floor(character.stats.defense * 1.2)
    }
  };
}

// Apply persona modifications
function applyPersona(character: CharacterDoc, personaType: string, features: typeof FEATURES): CharacterDoc {
  if (!features.persona.enabled || !(personaType in features.persona.types)) return character;

  const persona = features.persona.types[personaType as keyof typeof features.persona.types];
  
  return {
    ...character,
    stats: {
      ...character.stats,
      power: Math.floor(character.stats.power * persona.attackBonus),
      speed: Math.floor(character.stats.speed * persona.speedBonus),
      defense: Math.floor(character.stats.defense * persona.defenseBonus)
    }
  };
}

// GET /api/endpoint - Main endpoint with all features
export async function GET(request: NextRequest) {
  try {
    const features = parseFeatures(request);
    const cacheKey = `endpoint-${request.nextUrl.search}`;
    
    // Check memory cache if enabled
    if (features.memory.enabled) {
      const cached = memoryCache.get(cacheKey);
      if (cached) {
        return NextResponse.json({
          ...cached,
          cached: true,
          cacheStats: memoryCache.getStats()
        });
      }
    }

    const response: any = {
      endpoint: "comprehensive",
      timestamp: new Date().toISOString(),
      features: Object.entries(features)
        .filter(([_, config]) => config.enabled)
        .map(([name]) => name),
      configuration: {}
    };

    // Sequential processing if enabled
    if (features.seq.enabled) {
      const handlers = {
        authenticate: async () => {
          const session = await getServerSession(authOptions);
          return { authenticated: !!session, user: session?.user?.email };
        },
        validate: async () => {
          const validationResults = {
            timestamp: Date.now(),
            featuresValid: true,
            contextValid: true,
            memoryValid: features.memory.enabled ? memoryCache.getStats().size < features.memory.maxEntries : true
          };
          return validationResults;
        },
        enhance: async () => {
          const enhancements = [];
          if (features.c7.enabled) {
            enhancements.push({
              type: "c7",
              level: features.c7.level,
              abilities: features.c7.abilities
            });
          }
          if (features.magic.enabled) {
            enhancements.push({
              type: "magic",
              spells: Object.keys(features.magic.spells),
              power: features.magic.spellPower
            });
          }
          if (features.persona.enabled) {
            enhancements.push({
              type: "persona",
              available: Object.keys(features.persona.types),
              adaptive: features.persona.adaptiveAI
            });
          }
          return { enhancements, enhancementCount: enhancements.length };
        },
        execute: async () => {
          const results = [];
          
          if (features.serena.enabled) {
            const serena = await getOrCreateSerena(features);
            results.push({ 
              type: "serena", 
              data: serena,
              specialMechanics: features.serena.specialMechanics 
            });
          }
          
          if (features.magic.enabled) {
            results.push({
              type: "magic_system",
              initialized: true,
              spellCount: Object.keys(features.magic.spells).length
            });
          }
          
          return { executed: results, executionTime: Date.now() };
        },
        memory: async () => {
          const stats = memoryCache.getStats();
          return { 
            cacheStats: stats,
            efficiency: stats.size > 0 ? 
              stats.entries.reduce((acc, e) => acc + e.hits, 0) / stats.size : 0
          };
        },
        learn: async () => {
          if (!features.memory.enabled || !features.persona.enabled) {
            return { learning: false };
          }
          return {
            learning: true,
            patterns: features.memory.patternRecognition,
            adaptation: features.persona.adaptiveAI
          };
        },
        adapt: async () => {
          if (!features.seq.adaptiveSequencing) {
            return { adapted: false };
          }
          return {
            adapted: true,
            contextAware: features.seq.contextAwareOrdering,
            personaEvolution: features.persona.personaEvolution
          };
        },
        respond: async () => {
          return { 
            status: "ready",
            featuresActive: Object.entries(features)
              .filter(([_, config]) => config.enabled)
              .map(([name]) => name),
            timestamp: new Date().toISOString()
          };
        }
      };

      response.sequentialProcessing = await processSequentially(
        features.seq.processingOrder,
        handlers
      );
    }

    // Add feature configurations
    if (features.c7.enabled) {
      response.configuration.c7 = {
        level: features.c7.level,
        powerMultiplier: features.c7.powerMultiplier,
        abilities: features.c7.abilities,
        combatModifiers: {
          criticalChance: features.c7.criticalChance,
          dodgeChance: features.c7.dodgeChance,
          counterChance: features.c7.counterChance
        }
      };
    }

    if (features.magic.enabled) {
      response.configuration.magic = {
        spells: Object.keys(features.magic.spells),
        maxMana: features.magic.maxMana,
        manaRegenRate: features.magic.manaRegenRate,
        spellDetails: features.magic.spells
      };
    }

    if (features.memory.enabled) {
      response.configuration.memory = {
        ...features.memory,
        currentStats: memoryCache.getStats()
      };
    }

    if (features.serena.enabled) {
      const serena = await getOrCreateSerena(features);
      response.configuration.serena = {
        profile: features.serena.profile,
        stats: serena,
        specialAbilities: features.serena.abilities
      };
    }

    if (features.persona.enabled) {
      response.configuration.persona = {
        availableTypes: Object.keys(features.persona.types),
        details: features.persona.types,
        adaptiveAI: features.persona.adaptiveAI
      };
    }

    // Cache the response if memory is enabled
    if (features.memory.enabled) {
      memoryCache.set(cacheKey, response);
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/endpoint - Execute actions with features
export async function POST(request: NextRequest) {
  try {
    const features = parseFeatures(request);
    const body = await request.json();
    const { action, data } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    // Authenticate if seq is enabled
    if (features.seq.enabled) {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const response: any = {
      action,
      timestamp: new Date().toISOString(),
      features: Object.entries(features)
        .filter(([_, config]) => config.enabled)
        .map(([name]) => name),
      results: {}
    };

    // Handle different actions
    switch (action) {
      case "create_character": {
        const { name, backstory, userId } = data;
        
        if (!name || !backstory || !userId) {
          return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
          );
        }

        let characterData: CharacterDoc = {
          id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name,
          backstory,
          userId,
          level: 1,
          experience: 0,
          stats: {
            power: 100,
            speed: 100,
            defense: 100,
            hp: 100,
            maxHp: 100
          },
          wins: 0,
          losses: 0,
          elo: 1000,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Apply enhancements
        if (features.c7.enabled) {
          characterData = applyC7Enhancements(characterData, features);
        }

        if (features.persona.enabled && data.persona) {
          characterData = applyPersona(characterData, data.persona, features);
        }

        // Save to Firestore
        const charRef = adminDb.collection(COLLECTIONS.CHARACTERS).doc(characterData.id);
        await charRef.set(characterData);

        response.results.character = characterData;
        break;
      }

      case "cast_spell": {
        if (!features.magic.enabled) {
          return NextResponse.json(
            { error: "Magic feature is not enabled" },
            { status: 400 }
          );
        }

        const { characterId, spell, targetId, combo = false } = data;
        
        if (!characterId || !spell) {
          return NextResponse.json(
            { error: "Character ID and spell are required" },
            { status: 400 }
          );
        }

        const spellConfig = features.magic.spells[spell as keyof typeof features.magic.spells];
        if (!spellConfig) {
          return NextResponse.json(
            { error: "Invalid spell" },
            { status: 400 }
          );
        }
        
        // Get character data
        const charRef = adminDb.collection(COLLECTIONS.CHARACTERS).doc(characterId);
        const charDoc = await charRef.get();
        
        if (!charDoc.exists) {
          return NextResponse.json(
            { error: "Character not found" },
            { status: 404 }
          );
        }
        
        const character = charDoc.data() as CharacterDoc;
        
        // Check mana availability
        const currentMana = (character as any).mana || features.magic.maxMana;
        if (currentMana < spellConfig.manaCost) {
          return NextResponse.json(
            { error: "Insufficient mana" },
            { status: 400 }
          );
        }
        
        // Apply spell effects
        let damage = 0;
        let healing = 0;
        let statusEffects = [];
        let comboDamage = 0;
        
        // Base spell effects
        if ('damage' in spellConfig) {
          damage = spellConfig.damage * features.magic.spellPower;
          
          // Apply elemental affinity bonus
          if (features.magic.elementalAffinities && features.persona.enabled) {
            const personaType = (character as any).persona || "balanced";
            const persona = features.persona.types[personaType as keyof typeof features.persona.types];
            if (persona && 'preferredMagic' in persona) {
              const spellType = (spellConfig as any).type;
              if (persona.preferredMagic.includes(spellType)) {
                damage *= 1.25; // 25% bonus for affinity
              }
            }
          }
        }
        
        if ('heal' in spellConfig) {
          healing = spellConfig.heal * features.magic.spellPower;
        }
        
        if ('stunChance' in spellConfig && Math.random() < spellConfig.stunChance) {
          statusEffects.push("stunned");
        }
        
        if ('defense' in spellConfig) {
          statusEffects.push(`shield(${spellConfig.defense})`);
        }
        
        if ('dodgeChance' in spellConfig) {
          statusEffects.push(`evasive(${spellConfig.dodgeChance})`);
        }
        
        // Combo spell mechanics
        if (features.magic.comboSpells && combo) {
          const comboKey = `combo-${characterId}`;
          const previousSpell = memoryCache.get(comboKey);
          
          if (previousSpell && previousSpell.spell !== spell) {
            comboDamage = damage * 0.5; // 50% bonus damage for combos
            damage += comboDamage;
            
            // Special combo effects
            if (previousSpell.spell === "fireball" && spell === "thunderstrike") {
              statusEffects.push("electrified");
            } else if (previousSpell.spell === "shield" && spell === "healing") {
              healing *= 1.5; // 50% more healing when shielded
            }
          }
          
          // Store current spell for next combo
          memoryCache.set(comboKey, { spell, timestamp: Date.now() });
        }
        
        // Update character mana
        await charRef.update({
          mana: currentMana - spellConfig.manaCost,
          lastSpellCast: spell,
          updatedAt: new Date()
        });
        
        // Apply effects to target if specified
        if (targetId && (damage > 0 || statusEffects.length > 0)) {
          const targetRef = adminDb.collection(COLLECTIONS.CHARACTERS).doc(targetId);
          const targetDoc = await targetRef.get();
          
          if (targetDoc.exists) {
            const target = targetDoc.data() as CharacterDoc;
            const newHp = Math.max(0, target.stats.hp - damage);
            
            await targetRef.update({
              'stats.hp': newHp,
              statusEffects: statusEffects,
              updatedAt: new Date()
            });
          }
        }

        response.results.spellCast = {
          spell,
          config: spellConfig,
          effects: {
            damage: Math.floor(damage),
            healing: Math.floor(healing),
            statusEffects,
            comboDamage: Math.floor(comboDamage)
          },
          manaCost: spellConfig.manaCost,
          cooldown: spellConfig.cooldown,
          remainingMana: currentMana - spellConfig.manaCost,
          comboActive: combo && comboDamage > 0
        };
        break;
      }

      case "battle_serena": {
        if (!features.serena.enabled) {
          return NextResponse.json(
            { error: "Serena feature is not enabled" },
            { status: 400 }
          );
        }

        const { challengerId, useC7 = true, useMemory = true, persona = "mystic" } = data;
        if (!challengerId) {
          return NextResponse.json(
            { error: "Challenger ID is required" },
            { status: 400 }
          );
        }

        const serena = await getOrCreateSerena(features);
        
        // Get challenger data
        const challengerRef = adminDb.collection(COLLECTIONS.CHARACTERS).doc(challengerId);
        const challengerDoc = await challengerRef.get();
        
        if (!challengerDoc.exists) {
          return NextResponse.json(
            { error: "Challenger not found" },
            { status: 404 }
          );
        }
        
        const challenger = challengerDoc.data() as CharacterDoc;
        
        // Calculate battle with advanced mechanics
        let serenaWinChance = 0.7; // Base 70% win rate
        
        // Apply C7 mechanics
        if (features.c7.enabled && useC7) {
          const levelDiff = features.serena.stats.level - challenger.level;
          serenaWinChance += levelDiff * 0.01; // 1% per level difference
          
          // Transcendence check
          if (Math.random() < features.c7.transcendenceThreshold) {
            serenaWinChance += 0.1; // 10% bonus for transcendence
          }
        }
        
        // Apply memory mechanics
        let memoryAdvantage = 0;
        if (features.memory.enabled && useMemory) {
          const battleKey = `battle-${serena.id}-${challengerId}`;
          const previousBattle = memoryCache.get(battleKey);
          
          if (previousBattle) {
            memoryAdvantage = 0.15; // 15% advantage from memory
            serenaWinChance += memoryAdvantage;
          }
          
          // Store this battle in memory
          memoryCache.set(battleKey, {
            challengerId,
            timestamp: Date.now(),
            challengerStats: challenger.stats
          });
        }
        
        // Apply persona mechanics
        if (features.persona.enabled && persona) {
          const personaConfig = features.persona.types[persona as keyof typeof features.persona.types];
          if (personaConfig) {
            // Serena adapts to counter the challenger's persona
            serenaWinChance += 0.05; // 5% adaptation bonus
          }
        }
        
        // Determine winner
        const serenaWins = Math.random() < Math.min(serenaWinChance, 0.95); // Cap at 95%
        const winner = serenaWins ? serena.id : challengerId;
        
        // Select appropriate dialogue
        let dialogue = features.serena.profile.voiceLines.greeting;
        if (features.c7.enabled && useC7 && serenaWins) {
          dialogue = features.serena.profile.voiceLines.c7activation;
        } else if (memoryAdvantage > 0 && serenaWins) {
          dialogue = features.serena.profile.voiceLines.memoryTrigger;
        } else if (features.persona.enabled && persona === "mystic") {
          dialogue = features.serena.profile.voiceLines.personaShift;
        } else {
          dialogue = serenaWins 
            ? features.serena.profile.voiceLines.victory 
            : features.serena.profile.voiceLines.defeat;
        }
        
        // Special abilities activation
        const abilitiesUsed: string[] = [];
        if (serenaWins && features.serena.abilities.length > 0) {
          // Randomly select 1-3 abilities
          const numAbilities = Math.floor(Math.random() * 3) + 1;
          for (let i = 0; i < numAbilities; i++) {
            const ability = features.serena.abilities[
              Math.floor(Math.random() * features.serena.abilities.length)
            ];
            if (!abilitiesUsed.includes(ability)) {
              abilitiesUsed.push(ability);
            }
          }
        }
        
        // Calculate rewards based on battle complexity
        const baseExp = 500;
        let expMultiplier = 1;
        if (features.c7.enabled) expMultiplier += 0.5;
        if (features.memory.enabled) expMultiplier += 0.3;
        if (features.persona.enabled) expMultiplier += 0.2;
        
        const battleResult = {
          id: `battle_${Date.now()}`,
          challengerId,
          serenaId: serena.id,
          winner,
          winProbability: serenaWinChance,
          dialogue,
          abilitiesUsed,
          mechanics: {
            c7Active: features.c7.enabled && useC7,
            memoryUsed: features.memory.enabled && useMemory,
            memoryAdvantage,
            personaActive: features.persona.enabled && !!persona,
            adaptiveDifficulty: features.serena.specialMechanics.adaptiveDifficulty
          },
          rewards: {
            experience: Math.floor(baseExp * expMultiplier),
            achievement: serenaWins ? "Challenged the Mystic" : "Defeated the Mystic",
            specialReward: !serenaWins ? "Mystic's Blessing" : null
          }
        };
        
        // Update character stats if they won
        if (!serenaWins) {
          await challengerRef.update({
            experience: challenger.experience + battleResult.rewards.experience,
            wins: challenger.wins + 1,
            updatedAt: new Date()
          });
        } else {
          await challengerRef.update({
            losses: challenger.losses + 1,
            updatedAt: new Date()
          });
        }

        response.results.battle = battleResult;
        break;
      }

      case "get_cache_stats": {
        if (!features.memory.enabled) {
          return NextResponse.json(
            { error: "Memory feature is not enabled" },
            { status: 400 }
          );
        }

        response.results.cacheStats = memoryCache.getStats();
        break;
      }

      case "clear_cache": {
        if (!features.memory.enabled) {
          return NextResponse.json(
            { error: "Memory feature is not enabled" },
            { status: 400 }
          );
        }

        memoryCache.clear();
        response.results.message = "Cache cleared successfully";
        break;
      }

      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }

    // Cache response if memory is enabled
    if (features.memory.enabled) {
      const cacheKey = `action-${action}-${Date.now()}`;
      memoryCache.set(cacheKey, response);
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Endpoint POST error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/endpoint - Update with features
export async function PUT(request: NextRequest) {
  try {
    const features = parseFeatures(request);
    const body = await request.json();
    const { characterId, updates } = body;

    if (!characterId || !updates) {
      return NextResponse.json(
        { error: "Character ID and updates are required" },
        { status: 400 }
      );
    }

    const charRef = adminDb.collection(COLLECTIONS.CHARACTERS).doc(characterId);
    const charDoc = await charRef.get();

    if (!charDoc.exists) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    let characterData = charDoc.data() as CharacterDoc;
    
    // Apply updates
    characterData = {
      ...characterData,
      ...updates,
      updatedAt: new Date()
    };

    // Apply feature enhancements
    if (features.c7.enabled && updates.levelUp) {
      characterData = applyC7Enhancements(characterData, features);
    }

    if (features.persona.enabled && updates.persona) {
      characterData = applyPersona(characterData, updates.persona, features);
    }

    await charRef.update(characterData);

    // Cache if memory is enabled
    if (features.memory.enabled) {
      const cacheKey = `character-${characterId}`;
      memoryCache.set(cacheKey, characterData);
    }

    return NextResponse.json({
      success: true,
      character: characterData,
      features: Object.entries(features)
        .filter(([_, config]) => config.enabled)
        .map(([name]) => name)
    });
  } catch (error: any) {
    console.error("Endpoint PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/endpoint - Delete with features
export async function DELETE(request: NextRequest) {
  try {
    const features = parseFeatures(request);
    const { characterId } = await request.json();

    if (!characterId) {
      return NextResponse.json(
        { error: "Character ID is required" },
        { status: 400 }
      );
    }

    // Don't allow deleting Serena
    if (features.serena.enabled && characterId === features.serena.npcId) {
      return NextResponse.json(
        { error: "Cannot delete special NPCs" },
        { status: 403 }
      );
    }

    const charRef = adminDb.collection(COLLECTIONS.CHARACTERS).doc(characterId);
    await charRef.delete();

    // Clear from cache if memory is enabled
    if (features.memory.enabled) {
      const cacheKey = `character-${characterId}`;
      memoryCache.set(cacheKey, null);
    }

    return NextResponse.json({
      success: true,
      message: "Character deleted successfully",
      characterId
    });
  } catch (error: any) {
    console.error("Endpoint DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}