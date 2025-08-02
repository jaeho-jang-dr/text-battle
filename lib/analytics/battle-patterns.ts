import { BattleHistoryEntry, BattleStats } from '../../types/battle-history';

export interface BattlePattern {
  type: 'winning_time' | 'losing_streak' | 'opponent_dominance' | 'improvement' | 'plateau';
  description: string;
  confidence: number; // 0-1
  recommendation?: string;
}

export interface PredictiveInsight {
  prediction: string;
  probability: number;
  basedOn: string[];
}

export class BattlePatternAnalyzer {
  // 배틀 패턴 분석
  static analyzeBattlePatterns(
    history: BattleHistoryEntry[], 
    stats: BattleStats
  ): BattlePattern[] {
    const patterns: BattlePattern[] = [];

    // 시간대별 승률 분석
    const timePattern = this.analyzeTimeBasedPattern(history);
    if (timePattern) patterns.push(timePattern);

    // 상대별 전적 분석
    const opponentPatterns = this.analyzeOpponentPatterns(history);
    patterns.push(...opponentPatterns);

    // 실력 향상/정체 분석
    const progressPattern = this.analyzeProgressPattern(history);
    if (progressPattern) patterns.push(progressPattern);

    // 연패 패턴 분석
    const streakPattern = this.analyzeStreakPattern(history, stats);
    if (streakPattern) patterns.push(streakPattern);

    return patterns;
  }

  // 시간대별 승률 패턴 분석
  private static analyzeTimeBasedPattern(history: BattleHistoryEntry[]): BattlePattern | null {
    if (history.length < 20) return null;

    const hourlyStats = new Map<number, { wins: number; total: number }>();

    history.forEach(battle => {
      const hour = new Date(battle.createdAt).getHours();
      const stat = hourlyStats.get(hour) || { wins: 0, total: 0 };
      stat.total++;
      if (battle.isWin) stat.wins++;
      hourlyStats.set(hour, stat);
    });

    // 가장 성적이 좋은 시간대 찾기
    let bestHour = -1;
    let bestWinRate = 0;
    let worstHour = -1;
    let worstWinRate = 1;

    hourlyStats.forEach((stat, hour) => {
      if (stat.total >= 3) { // 최소 3경기 이상
        const winRate = stat.wins / stat.total;
        if (winRate > bestWinRate) {
          bestWinRate = winRate;
          bestHour = hour;
        }
        if (winRate < worstWinRate) {
          worstWinRate = winRate;
          worstHour = hour;
        }
      }
    });

    if (bestHour !== -1 && bestWinRate - worstWinRate > 0.3) {
      return {
        type: 'winning_time',
        description: `${bestHour}시~${bestHour + 1}시에 특히 강해요! (승률 ${Math.round(bestWinRate * 100)}%)`,
        confidence: Math.min((bestWinRate - worstWinRate) * 2, 1),
        recommendation: `${bestHour}시 전후로 배틀하면 더 좋은 성적을 낼 수 있어요!`
      };
    }

    return null;
  }

  // 상대별 전적 패턴 분석
  private static analyzeOpponentPatterns(history: BattleHistoryEntry[]): BattlePattern[] {
    const patterns: BattlePattern[] = [];
    const opponentStats = new Map<string, { wins: number; losses: number; name: string }>();

    history.forEach(battle => {
      const stats = opponentStats.get(battle.opponentId) || { 
        wins: 0, 
        losses: 0, 
        name: battle.opponentName 
      };
      
      if (battle.isWin) stats.wins++;
      else stats.losses++;
      
      opponentStats.set(battle.opponentId, stats);
    });

    // 5번 이상 만난 상대 분석
    opponentStats.forEach((stats, opponentId) => {
      const total = stats.wins + stats.losses;
      if (total >= 5) {
        const winRate = stats.wins / total;
        
        if (winRate >= 0.8) {
          patterns.push({
            type: 'opponent_dominance',
            description: `${stats.name}님에게 특히 강해요! (${stats.wins}승 ${stats.losses}패)`,
            confidence: Math.min(total / 10, 1)
          });
        } else if (winRate <= 0.2) {
          patterns.push({
            type: 'opponent_dominance',
            description: `${stats.name}님과는 상성이 안 맞나봐요 (${stats.wins}승 ${stats.losses}패)`,
            confidence: Math.min(total / 10, 1),
            recommendation: '새로운 전략을 시도해보세요!'
          });
        }
      }
    });

    return patterns;
  }

  // 실력 향상/정체 패턴 분석
  private static analyzeProgressPattern(history: BattleHistoryEntry[]): BattlePattern | null {
    if (history.length < 20) return null;

    // 최근 20경기를 5경기씩 4그룹으로 나누어 승률 변화 분석
    const groups = [];
    for (let i = 0; i < 4; i++) {
      const groupStart = i * 5;
      const groupEnd = groupStart + 5;
      const group = history.slice(groupStart, groupEnd);
      const wins = group.filter(b => b.isWin).length;
      groups.push(wins / 5);
    }

    // 선형 회귀로 추세 분석
    const trend = this.calculateTrend(groups);

    if (Math.abs(trend) > 0.1) {
      if (trend > 0) {
        return {
          type: 'improvement',
          description: '실력이 꾸준히 향상되고 있어요! 🌟',
          confidence: Math.min(Math.abs(trend) * 3, 1),
          recommendation: '이 추세를 계속 유지해보세요!'
        };
      } else {
        return {
          type: 'plateau',
          description: '최근 성적이 조금 주춤하네요',
          confidence: Math.min(Math.abs(trend) * 3, 1),
          recommendation: '배틀 텍스트를 수정하거나 새로운 전략을 시도해보세요!'
        };
      }
    }

    return null;
  }

  // 연승/연패 패턴 분석
  private static analyzeStreakPattern(
    history: BattleHistoryEntry[], 
    stats: BattleStats
  ): BattlePattern | null {
    if (stats.currentStreak <= -3) {
      return {
        type: 'losing_streak',
        description: `${Math.abs(stats.currentStreak)}연패 중이에요`,
        confidence: 0.8,
        recommendation: '잠시 쉬었다가 새로운 마음으로 도전해보세요!'
      };
    }

    return null;
  }

  // 예측 인사이트 생성
  static generatePredictiveInsights(
    history: BattleHistoryEntry[],
    stats: BattleStats
  ): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];

    // 다음 경기 승률 예측
    const nextMatchPrediction = this.predictNextMatch(history, stats);
    if (nextMatchPrediction) insights.push(nextMatchPrediction);

    // 목표 달성 예측
    const goalPrediction = this.predictGoalAchievement(history, stats);
    if (goalPrediction) insights.push(goalPrediction);

    return insights;
  }

  // 다음 경기 승률 예측
  private static predictNextMatch(
    history: BattleHistoryEntry[],
    stats: BattleStats
  ): PredictiveInsight | null {
    if (history.length < 10) return null;

    let probability = stats.winRate / 100;

    // 현재 연승/연패 반영
    if (stats.currentStreak > 0) {
      probability += 0.05 * Math.min(stats.currentStreak, 3);
    } else if (stats.currentStreak < 0) {
      probability -= 0.05 * Math.min(Math.abs(stats.currentStreak), 3);
    }

    // 최근 5경기 성적 반영
    const recent5 = history.slice(0, 5);
    const recentWinRate = recent5.filter(b => b.isWin).length / 5;
    probability = (probability + recentWinRate) / 2;

    // 확률 범위 제한
    probability = Math.max(0.1, Math.min(0.9, probability));

    return {
      prediction: `다음 경기 승률: ${Math.round(probability * 100)}%`,
      probability,
      basedOn: ['전체 승률', '최근 성적', '현재 연승/연패']
    };
  }

  // 목표 달성 예측
  private static predictGoalAchievement(
    history: BattleHistoryEntry[],
    stats: BattleStats
  ): PredictiveInsight | null {
    if (history.length < 20) return null;

    // 승률 70% 달성 예측
    if (stats.winRate < 70 && stats.winRate > 50) {
      const recentTrend = this.getRecentTrend(history);
      if (recentTrend > 0) {
        const battlesNeeded = Math.ceil((70 - stats.winRate) / recentTrend);
        return {
          prediction: `현재 추세라면 약 ${battlesNeeded}경기 후 승률 70% 달성 가능!`,
          probability: 0.6 + recentTrend,
          basedOn: ['최근 승률 향상 추세', '현재 승률']
        };
      }
    }

    // 100승 달성 예측
    if (stats.wins > 50 && stats.wins < 100) {
      const avgWinsPerDay = this.calculateAverageWinsPerDay(history);
      if (avgWinsPerDay > 0) {
        const daysNeeded = Math.ceil((100 - stats.wins) / avgWinsPerDay);
        return {
          prediction: `현재 속도라면 약 ${daysNeeded}일 후 100승 달성!`,
          probability: 0.7,
          basedOn: ['일평균 승리 수', '현재 승리 수']
        };
      }
    }

    return null;
  }

  // 선형 추세 계산
  private static calculateTrend(values: number[]): number {
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  // 최근 승률 추세
  private static getRecentTrend(history: BattleHistoryEntry[]): number {
    const recent10 = history.slice(0, 10);
    const older10 = history.slice(10, 20);

    const recentWinRate = recent10.filter(b => b.isWin).length / 10;
    const olderWinRate = older10.filter(b => b.isWin).length / 10;

    return recentWinRate - olderWinRate;
  }

  // 일평균 승리 수 계산
  private static calculateAverageWinsPerDay(history: BattleHistoryEntry[]): number {
    if (history.length === 0) return 0;

    const firstBattle = new Date(history[history.length - 1].createdAt);
    const lastBattle = new Date(history[0].createdAt);
    const daysDiff = (lastBattle.getTime() - firstBattle.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff < 1) return history.filter(b => b.isWin).length;

    const totalWins = history.filter(b => b.isWin).length;
    return totalWins / Math.max(daysDiff, 1);
  }
}