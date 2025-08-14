export const COLLECTIONS = {
  USERS: 'users',
  CHARACTERS: 'characters',
  BATTLES: 'battles',
  BATTLE_LOGS: 'battle_logs',
  NPCS: 'npcs',
  LEADERBOARD: 'leaderboard',
} as const;

export interface UserDoc {
  uid: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterDoc {
  id: string;
  name: string;
  userId: string;
  backstory: string;
  avatar?: string;
  level: number;
  experience: number;
  stats: {
    power: number;
    speed: number;
    defense: number;
    hp: number;
    maxHp: number;
  };
  wins: number;
  losses: number;
  elo: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BattleDoc {
  id: string;
  characterId1: string;
  characterId2: string;
  character1Name: string;
  character2Name: string;
  winnerId: string;
  loserId: string;
  logs: string[];
  eloChange: number;
  createdAt: Date;
}

export interface NPCDoc extends Omit<CharacterDoc, 'userId'> {
  personality: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  isSpecialNPC?: boolean;
}