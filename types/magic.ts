// Magic battle system types
export type MagicType = "FIRE" | "WATER" | "NATURE" | "LIGHT" | "DARK" | "ARCANE";

export type PersonaArchetype = 
  | "MAGICIAN" 
  | "PRIESTESS" 
  | "EMPRESS" 
  | "EMPEROR" 
  | "HIEROPHANT" 
  | "LOVERS" 
  | "CHARIOT";

export interface MagicTypeConfig {
  name: string;
  weakness: MagicType | "NONE";
  strength: MagicType | "ALL";
}

export interface PersonaConfig {
  primary: MagicType;
  secondary: MagicType;
  memoryBonus: number;
}

export interface MagicBattle {
  id: string;
  attackerId: string;
  defenderId: string;
  winnerId: string;
  attackerScore: number;
  defenderScore: number;
  battleLog: string;
  battleType: "magic";
  sequence: number;
  attackerMagic: MagicType;
  defenderMagic: MagicType;
  memoryUsed: boolean;
  createdAt: Date;
}

export interface BattleMemory {
  characterId: string;
  opponentId: string;
  magicUsed: MagicType[];
  outcomes: boolean[];
  patterns: string[];
  lastBattleTime: Date;
  memoryStrength: number;
}

export interface MagicCharacter {
  id: string;
  userId: string;
  name: string;
  battleChat: string;
  eloScore: number;
  wins: number;
  losses: number;
  isNPC: boolean;
  magicType?: MagicType;
  persona?: PersonaArchetype;
  memoryDepth?: number;
  lastMagicUsed?: MagicType;
  createdAt: Date;
  updatedAt: Date;
}

export interface MagicBattleRequest {
  attackerId?: string;
  defenderId?: string;
  attackerMagic?: MagicType;
  defenderMagic?: MagicType;
  sequence?: number;
  useMemory?: boolean;
  includeSerena?: boolean;
  persona?: PersonaArchetype;
}

export interface MagicBattleResponse {
  success: boolean;
  data?: {
    id: string;
    attacker_id: string;
    defender_id: string;
    winner_id: string;
    attacker_score: number;
    defender_score: number;
    battle_log: string;
    battle_type: string;
    sequence: number;
    attacker_magic: MagicType;
    defender_magic: MagicType;
    memory_used: boolean;
    created_at: any;
    attacker: {
      name: string;
      oldElo: number;
      newElo: number;
      persona?: PersonaArchetype;
    };
    defender: {
      name: string;
      oldElo: number;
      newElo: number;
      persona?: PersonaArchetype;
    };
  };
  features?: {
    c7Level: boolean;
    sequential: number;
    magicSystem: boolean;
    memoryEnabled: boolean;
    serenaIncluded: boolean;
    personaActive: boolean;
  };
  error?: string;
}

// C7 Memory patterns
export type MemoryPattern = 
  | `REPEAT_SEQUENCE:${string}`
  | "DOMINANT_STRATEGY"
  | "WEAK_STRATEGY"
  | `FAVORS:${MagicType}`;

// Sequence state for multi-battle chains
export interface SequenceBattleState {
  characterId: string;
  opponentId: string;
  currentSequence: number;
  maxSequence: number;
  wins: number;
  losses: number;
  magicHistory: MagicType[];
  active: boolean;
  startedAt: Date;
  lastBattleAt: Date;
}