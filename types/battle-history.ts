// 배틀 히스토리 관련 타입 정의

// 배틀 히스토리 통계
export interface BattleStats {
  totalBattles: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  averageScoreChange: number;
  favoriteOpponent?: {
    characterId: string;
    characterName: string;
    battleCount: number;
  };
  nemesis?: {
    characterId: string;
    characterName: string;
    lossCount: number;
  };
}

// 타임라인 포인트
export interface TimelinePoint {
  date: string;
  score: number;
  eloScore: number;
  battleCount: number;
  wins: number;
  losses: number;
}

// 인사이트
export interface BattleInsight {
  type: 'achievement' | 'suggestion' | 'trend';
  message: string;
  icon: string;
}

// 배틀 히스토리 엔트리
export interface BattleHistoryEntry {
  id: string;
  battleType: 'active' | 'passive';
  opponentId: string;
  opponentName: string;
  opponentAnimal: {
    name: string;
    koreanName: string;
    emoji: string;
  };
  isWin: boolean;
  scoreChange: number;
  eloChange: number;
  finalScore: number;
  finalEloScore: number;
  aiJudgment?: string;
  aiReasoning?: string;
  createdAt: string;
}

// 페이지네이션 정보
export interface PaginationInfo {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

// 배틀 히스토리 응답
export interface BattleHistoryResponse {
  history: BattleHistoryEntry[];
  stats?: BattleStats;
  timeline?: TimelinePoint[];
  insights?: BattleInsight[];
  pagination: PaginationInfo;
}