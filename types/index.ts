// 사용자 타입
export interface User {
  id: string;
  email?: string;
  kakaoId?: string;
  username: string;
  isGuest: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 캐릭터 타입
export interface Character {
  id: string;
  userId: string;
  name: string; // 10자 이내
  battleChat: string; // 100자 이내
  eloScore: number;
  wins: number;
  losses: number;
  isNPC: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 배틀 타입
export interface Battle {
  id: string;
  attackerId: string;
  defenderId: string;
  winnerId: string;
  attackerScore: number;
  defenderScore: number;
  battleLog: string;
  createdAt: Date;
}

// 배틀 기록 타입
export interface BattleHistory {
  battleId: string;
  characterId: string;
  opponentId: string;
  isWin: boolean;
  scoreGained: number;
  scoreLost: number;
  date: Date;
}

// 리더보드 엔트리
export interface LeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  eloScore: number;
  wins: number;
  losses: number;
  winRate: number;
  isNPC: boolean;
}

// 게임 설정
export interface GameSettings {
  dailyBattleLimit: number; // 기본 10
  defensiveBattleLimit: number; // 기본 5
  attackBattleLimit: number; // 기본 3
  baseScore: number;
  eloMultiplier: number;
}

// 배틀 제한 상태
export interface BattleRestrictions {
  dailyBattleCount: number;
  canBattle: boolean;
  consecutiveDefense: Map<string, number>;
  consecutiveAttack: Map<string, number>;
  resetTime: Date;
}