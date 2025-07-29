// 배틀 비교 관련 타입 정의

// 캐릭터 개요 정보
export interface CharacterOverview {
  id: string;
  name: string;
  animal: {
    name: string;
    koreanName: string;
    emoji: string;
  };
  baseScore: number;
  eloScore: number;
  createdAt: string;
}

// 전적 비교
export interface HeadToHeadStats {
  totalBattles: number;
  character1Wins: number;
  character2Wins: number;
  lastBattleDate?: string;
  lastWinnerId?: string;
  battleHistory: {
    battleId: string;
    winnerId: string;
    winnerName: string;
    scoreChange: number;
    date: string;
  }[];
}

// 통계 비교
export interface StatComparison {
  character1: {
    totalBattles: number;
    wins: number;
    losses: number;
    winRate: number;
    averageScoreChange: number;
    currentStreak: number;
    bestStreak: number;
    rank?: number;
  };
  character2: {
    totalBattles: number;
    wins: number;
    losses: number;
    winRate: number;
    averageScoreChange: number;
    currentStreak: number;
    bestStreak: number;
    rank?: number;
  };
}

// 성과 비교
export interface AchievementComparison {
  character1Achievements: Achievement[];
  character2Achievements: Achievement[];
  sharedAchievements: Achievement[];
}

export interface Achievement {
  type: 'milestone' | 'streak' | 'special';
  title: string;
  description: string;
  earnedDate?: string;
  icon: string;
}

// 강점/약점 분석
export interface StrengthWeaknessAnalysis {
  character1: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
  };
  character2: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
  };
}

// 예측 분석
export interface PredictiveAnalysis {
  predictedWinner: {
    characterId: string;
    characterName: string;
    probability: number;
  };
  factors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }[];
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

// 시각화용 데이터
export interface ComparisonVisualization {
  radarChartData: {
    categories: string[];
    character1Values: number[];
    character2Values: number[];
  };
  trendComparison: {
    dates: string[];
    character1Scores: number[];
    character2Scores: number[];
  };
}

// 전체 비교 응답
export interface BattleComparisonResponse {
  character1: CharacterOverview;
  character2: CharacterOverview;
  headToHead: HeadToHeadStats;
  stats: StatComparison;
  achievements?: AchievementComparison;
  analysis?: StrengthWeaknessAnalysis;
  prediction?: PredictiveAnalysis;
  visualization?: ComparisonVisualization;
  insights: ComparisonInsight[];
}

// 비교 인사이트
export interface ComparisonInsight {
  type: 'advantage' | 'rivalry' | 'suggestion' | 'fun_fact';
  message: string;
  targetCharacter?: 'character1' | 'character2' | 'both';
  icon: string;
}