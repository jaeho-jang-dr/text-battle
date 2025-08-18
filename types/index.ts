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

// 배틀 분석 타입
export interface BattleChatAnalysis {
  creativity: number;      // 창의성 - unique word usage, original metaphors
  impact: number;         // 임팩트 - powerful opening/closing, memorable phrases
  focus: number;          // 집중력 - consistency, coherent narrative
  linguisticPower: number; // 언어적파워 - strong verbs, vivid descriptions
  strategy: number;       // 전략성 - mentions of attack/defense tactics
  emotionMomentum: number; // 감정과 기세 - emotional intensity, confidence
  lengthScore: number;    // 챗의 길이 - adequate length for expression
  totalScore: number;     // Overall score
}

// 배틀 타입
export interface Battle {
  id: string;
  attackerId: string;
  defenderId: string;
  winnerId: string;
  attackerScore: number;
  defenderScore: number;
  battleLog: string | string[];
  explanation?: string;  // 승리/패배 이유 설명
  tip?: string;          // 플레이어를 위한 팁
  attackerAnalysis?: BattleChatAnalysis;  // 공격자 상세 분석
  defenderAnalysis?: BattleChatAnalysis;  // 수비자 상세 분석
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