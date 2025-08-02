import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/types';
import { 
  BattleHistoryResponse, 
  BattleHistoryEntry, 
  BattleStats, 
  TimelinePoint,
  BattleInsight
} from '@/types/battle-history';
import { battleHistoryCache } from '@/lib/cache/battle-history-cache';
import { BattlePatternAnalyzer } from '@/lib/analytics/battle-patterns';

export async function GET(req: NextRequest) {
  try {
    // 인증 확인
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: '로그인이 필요합니다.'
      }, { status: 401 });
    }

    // 사용자 확인
    const user = await db.prepare(`
      SELECT * FROM users 
      WHERE login_token = ? 
      AND datetime(token_expires_at) > datetime('now')
    `).get(token) as any;

    if (!user) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 토큰입니다'
      }, { status: 401 });
    }

    // 쿼리 파라미터 파싱
    const searchParams = req.nextUrl.searchParams;
    const characterId = searchParams.get('characterId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeStats = searchParams.get('includeStats') === 'true';
    const includeTimeline = searchParams.get('includeTimeline') === 'true';
    const includePatterns = searchParams.get('includePatterns') === 'true';
    const includePredictions = searchParams.get('includePredictions') === 'true';
    const forceRefresh = searchParams.has('_t'); // timestamp 파라미터가 있으면 강제 새로고침

    if (!characterId) {
      return NextResponse.json({
        success: false,
        error: '캐릭터 ID가 필요합니다.'
      }, { status: 400 });
    }

    // 강제 새로고침인 경우 캐시 무효화
    if (forceRefresh) {
      console.log(`Force refresh requested for character ${characterId} - invalidating cache`);
      battleHistoryCache.invalidateCharacter(characterId);
    }

    // 캐시 확인 (강제 새로고침이 아닌 경우에만)
    const cacheParams = { limit, offset, includeStats, includeTimeline };
    const cachedData = !forceRefresh ? battleHistoryCache.get(characterId, cacheParams) : null;
    
    if (cachedData && !includePatterns && !includePredictions) {
      console.log(`Cache hit for character ${characterId}`);
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true
      } as ApiResponse<BattleHistoryResponse>);
    }

    // 캐릭터 소유권 확인
    const character = await db.prepare(`
      SELECT id, user_id, character_name, base_score, elo_score
      FROM characters
      WHERE id = ?
    `).get(characterId) as any;

    if (!character) {
      return NextResponse.json({
        success: false,
        error: '캐릭터를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    if (character.user_id !== user.id) {
      return NextResponse.json({
        success: false,
        error: '권한이 없습니다.'
      }, { status: 403 });
    }

    // 전체 배틀 수 조회
    const totalCount = await db.prepare(`
      SELECT COUNT(*) as count
      FROM battles
      WHERE attacker_id = ? OR defender_id = ?
    `).get(characterId, characterId) as { count: number };

    // 배틀 히스토리 조회
    const battles = await db.prepare(`
      SELECT 
        b.*,
        CASE 
          WHEN b.attacker_id = ? THEN 'active'
          ELSE 'passive'
        END as my_role,
        CASE 
          WHEN b.attacker_id = ? THEN b.attacker_score_change
          ELSE b.defender_score_change
        END as my_score_change,
        CASE 
          WHEN b.attacker_id = ? THEN b.attacker_elo_change
          ELSE b.defender_elo_change
        END as my_elo_change,
        CASE 
          WHEN b.attacker_id = ? THEN def.id
          ELSE att.id
        END as opponent_id,
        CASE 
          WHEN b.attacker_id = ? THEN def.character_name
          ELSE att.character_name
        END as opponent_name,
        CASE 
          WHEN b.attacker_id = ? THEN def_animal.name
          ELSE att_animal.name
        END as opponent_animal_name,
        CASE 
          WHEN b.attacker_id = ? THEN def_animal.korean_name
          ELSE att_animal.korean_name
        END as opponent_animal_korean_name,
        CASE 
          WHEN b.attacker_id = ? THEN def_animal.emoji
          ELSE att_animal.emoji
        END as opponent_animal_emoji
      FROM battles b
      JOIN characters att ON b.attacker_id = att.id
      JOIN characters def ON b.defender_id = def.id
      JOIN animals att_animal ON att.animal_id = att_animal.id
      JOIN animals def_animal ON def.animal_id = def_animal.id
      WHERE b.attacker_id = ? OR b.defender_id = ?
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `).all(
      characterId, characterId, characterId, characterId, 
      characterId, characterId, characterId, characterId,
      characterId, characterId,
      limit, offset
    ) as any[];

    // 배틀 히스토리 엔트리 포맷팅
    const history: BattleHistoryEntry[] = battles.map(battle => ({
      id: battle.id,
      battleType: battle.my_role,
      opponentId: battle.opponent_id,
      opponentName: battle.opponent_name,
      opponentAnimal: {
        name: battle.opponent_animal_name,
        koreanName: battle.opponent_animal_korean_name,
        emoji: battle.opponent_animal_emoji
      },
      isWin: battle.winner_id === characterId,
      scoreChange: battle.my_score_change,
      eloChange: battle.my_elo_change,
      finalScore: character.base_score,
      finalEloScore: character.elo_score,
      aiJudgment: battle.ai_judgment,
      aiReasoning: battle.ai_reasoning,
      createdAt: battle.created_at
    }));

    const response: BattleHistoryResponse = {
      history,
      pagination: {
        limit,
        offset,
        total: totalCount.count,
        hasMore: offset + limit < totalCount.count
      }
    };

    // 통계 포함 옵션
    if (includeStats) {
      const stats = await calculateBattleStats(characterId);
      response.stats = stats;
    }

    // 타임라인 포함 옵션
    if (includeTimeline) {
      const timeline = await generateTimeline(characterId);
      response.timeline = timeline;
    }

    // 인사이트 생성 (통계가 있는 경우에만)
    if (response.stats) {
      response.insights = generateInsights(response.stats, history);
    }

    // 패턴 분석 포함 옵션
    if (includePatterns && response.stats) {
      const patterns = BattlePatternAnalyzer.analyzeBattlePatterns(history, response.stats);
      (response as any).patterns = patterns;
    }

    // 예측 인사이트 포함 옵션
    if (includePredictions && response.stats) {
      const predictions = BattlePatternAnalyzer.generatePredictiveInsights(history, response.stats);
      (response as any).predictions = predictions;
    }

    // 캐시 저장 (패턴과 예측 제외)
    if (!includePatterns && !includePredictions) {
      battleHistoryCache.set(characterId, cacheParams, response);
    }

    return NextResponse.json({
      success: true,
      data: response
    } as ApiResponse<BattleHistoryResponse>);

  } catch (error) {
    console.error('Battle history error:', error);
    
    // 상세한 에러 로깅
    if (error instanceof Error) {
      const searchParams = req.nextUrl.searchParams;
      const characterId = searchParams.get('characterId');
      const limit = parseInt(searchParams.get('limit') || '20');
      const offset = parseInt(searchParams.get('offset') || '0');
      const includeStats = searchParams.get('includeStats') === 'true';
      const includeTimeline = searchParams.get('includeTimeline') === 'true';
      const includePatterns = searchParams.get('includePatterns') === 'true';
      const includePredictions = searchParams.get('includePredictions') === 'true';
      
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        characterId: characterId || 'unknown',
        params: { limit, offset, includeStats, includeTimeline, includePatterns, includePredictions }
      });
    }
    
    return NextResponse.json({
      success: false,
      error: '배틀 히스토리 조회 중 오류가 발생했습니다.',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
    }, { status: 500 });
  }
}

// 배틀 통계 계산
async function calculateBattleStats(characterId: string): Promise<BattleStats> {
  // 기본 통계
  const basicStats = await db.prepare(`
    SELECT 
      COUNT(*) as total_battles,
      SUM(CASE WHEN winner_id = ? THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN winner_id != ? AND winner_id IS NOT NULL THEN 1 ELSE 0 END) as losses
    FROM battles
    WHERE (attacker_id = ? OR defender_id = ?) AND winner_id IS NOT NULL
  `).get(characterId, characterId, characterId, characterId) as any;

  // 평균 점수 변화
  const avgScoreChange = await db.prepare(`
    SELECT AVG(
      CASE 
        WHEN attacker_id = ? THEN attacker_score_change
        ELSE defender_score_change
      END
    ) as avg_change
    FROM battles
    WHERE attacker_id = ? OR defender_id = ?
  `).get(characterId, characterId, characterId) as { avg_change: number };

  // 현재 연승/연패 계산
  const recentBattles = await db.prepare(`
    SELECT winner_id
    FROM battles
    WHERE (attacker_id = ? OR defender_id = ?) AND winner_id IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 20
  `).all(characterId, characterId) as { winner_id: string }[];

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  for (const battle of recentBattles) {
    if (battle.winner_id === characterId) {
      if (currentStreak >= 0) currentStreak++;
      else currentStreak = 1;
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      if (currentStreak <= 0) currentStreak--;
      else currentStreak = -1;
      tempStreak = 0;
    }
  }

  // 가장 많이 만난 상대
  const favoriteOpponent = await db.prepare(`
    SELECT 
      CASE 
        WHEN attacker_id = ? THEN defender_id
        ELSE attacker_id
      END as opponent_id,
      CASE 
        WHEN attacker_id = ? THEN def.character_name
        ELSE att.character_name
      END as opponent_name,
      COUNT(*) as battle_count
    FROM battles b
    JOIN characters att ON b.attacker_id = att.id
    JOIN characters def ON b.defender_id = def.id
    WHERE attacker_id = ? OR defender_id = ?
    GROUP BY opponent_id
    ORDER BY battle_count DESC
    LIMIT 1
  `).get(characterId, characterId, characterId, characterId) as any;

  // 천적 (가장 많이 진 상대)
  const nemesis = await db.prepare(`
    SELECT 
      CASE 
        WHEN attacker_id = ? THEN defender_id
        ELSE attacker_id
      END as opponent_id,
      CASE 
        WHEN attacker_id = ? THEN def.character_name
        ELSE att.character_name
      END as opponent_name,
      COUNT(*) as loss_count
    FROM battles b
    JOIN characters att ON b.attacker_id = att.id
    JOIN characters def ON b.defender_id = def.id
    WHERE (attacker_id = ? OR defender_id = ?) 
      AND winner_id != ? 
      AND winner_id IS NOT NULL
    GROUP BY opponent_id
    ORDER BY loss_count DESC
    LIMIT 1
  `).get(characterId, characterId, characterId, characterId, characterId) as any;

  return {
    totalBattles: basicStats.total_battles,
    wins: basicStats.wins,
    losses: basicStats.losses,
    winRate: basicStats.total_battles > 0 
      ? Math.round((basicStats.wins / basicStats.total_battles) * 100)
      : 0,
    currentStreak,
    bestStreak,
    averageScoreChange: Math.round(avgScoreChange.avg_change || 0),
    favoriteOpponent: favoriteOpponent ? {
      characterId: favoriteOpponent.opponent_id,
      characterName: favoriteOpponent.opponent_name,
      battleCount: favoriteOpponent.battle_count
    } : undefined,
    nemesis: nemesis ? {
      characterId: nemesis.opponent_id,
      characterName: nemesis.opponent_name,
      lossCount: nemesis.loss_count
    } : undefined
  };
}

// 타임라인 생성
async function generateTimeline(characterId: string): Promise<TimelinePoint[]> {
  const battles = await db.prepare(`
    SELECT 
      DATE(created_at) as battle_date,
      COUNT(*) as battle_count,
      SUM(CASE WHEN winner_id = ? THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN winner_id != ? AND winner_id IS NOT NULL THEN 1 ELSE 0 END) as losses,
      SUM(CASE 
        WHEN attacker_id = ? THEN attacker_score_change
        ELSE defender_score_change
      END) as total_score_change,
      SUM(CASE 
        WHEN attacker_id = ? THEN attacker_elo_change
        ELSE defender_elo_change
      END) as total_elo_change
    FROM battles
    WHERE attacker_id = ? OR defender_id = ?
    GROUP BY battle_date
    ORDER BY battle_date DESC
    LIMIT 30
  `).all(
    characterId, characterId, characterId, characterId,
    characterId, characterId
  ) as any[];

  // 누적 점수 계산
  let cumulativeScore = 1000; // 기본 점수
  let cumulativeElo = 1500; // 기본 ELO

  return battles.reverse().map(day => {
    cumulativeScore += day.total_score_change;
    cumulativeElo += day.total_elo_change;

    return {
      date: day.battle_date,
      score: cumulativeScore,
      eloScore: cumulativeElo,
      battleCount: day.battle_count,
      wins: day.wins,
      losses: day.losses
    };
  });
}

// 인사이트 생성 (향상된 버전)
function generateInsights(stats: BattleStats, recentHistory: BattleHistoryEntry[]): BattleInsight[] {
  const insights: BattleInsight[] = [];

  // 연승 인사이트 (단계별)
  if (stats.currentStreak >= 10) {
    insights.push({
      type: 'achievement',
      message: `🌟 전설의 ${stats.currentStreak}연승! 누구도 막을 수 없어요!`,
      icon: '🌟'
    });
  } else if (stats.currentStreak >= 5) {
    insights.push({
      type: 'achievement',
      message: `🔥 놀라운 ${stats.currentStreak}연승 중! 계속 파이팅!`,
      icon: '🔥'
    });
  } else if (stats.currentStreak >= 3) {
    insights.push({
      type: 'achievement',
      message: `✨ ${stats.currentStreak}연승 중! 좋은 흐름이에요!`,
      icon: '✨'
    });
  }

  // 승률 인사이트 (세분화)
  if (stats.winRate >= 80) {
    insights.push({
      type: 'achievement',
      message: '👑 승률 80% 이상! 진정한 챔피언이에요!',
      icon: '👑'
    });
  } else if (stats.winRate >= 70) {
    insights.push({
      type: 'achievement',
      message: '🏆 승률 70% 이상! 최고의 전사예요!',
      icon: '🏆'
    });
  } else if (stats.winRate >= 60) {
    insights.push({
      type: 'achievement',
      message: '⭐ 승률 60% 이상! 강력한 전사예요!',
      icon: '⭐'
    });
  }

  // 최근 추세 (더 상세히)
  const recent10 = recentHistory.slice(0, 10);
  const recent5 = recentHistory.slice(0, 5);
  const recentWins10 = recent10.filter(b => b.isWin).length;
  const recentWins5 = recent5.filter(b => b.isWin).length;
  
  if (recentWins5 === 5) {
    insights.push({
      type: 'trend',
      message: '🚀 최근 5경기 전승! 완벽한 퍼포먼스예요!',
      icon: '🚀'
    });
  } else if (recentWins10 >= 8) {
    insights.push({
      type: 'trend',
      message: '📈 최근 10경기 중 ' + recentWins10 + '승! 놀라운 성과예요!',
      icon: '📈'
    });
  } else if (recentWins5 >= 4) {
    insights.push({
      type: 'trend',
      message: '📊 최근 5경기 중 4승! 상승세예요!',
      icon: '📊'
    });
  } else if (recentWins5 <= 1) {
    insights.push({
      type: 'suggestion',
      message: '💡 새로운 전략이 필요할 때예요. 배틀 텍스트를 수정해보세요!',
      icon: '💡'
    });
  }

  // 라이벌 인사이트
  if (stats.favoriteOpponent && stats.favoriteOpponent.battleCount >= 10) {
    insights.push({
      type: 'trend',
      message: `⚔️ ${stats.favoriteOpponent.characterName}님과 ${stats.favoriteOpponent.battleCount}번의 숙명의 대결!`,
      icon: '⚔️'
    });
  } else if (stats.favoriteOpponent && stats.favoriteOpponent.battleCount >= 5) {
    insights.push({
      type: 'trend',
      message: `🤝 ${stats.favoriteOpponent.characterName}님과 ${stats.favoriteOpponent.battleCount}번 대결! 라이벌이네요!`,
      icon: '🤝'
    });
  }

  // 천적 인사이트
  if (stats.nemesis && stats.nemesis.lossCount >= 5) {
    insights.push({
      type: 'suggestion',
      message: `🎯 ${stats.nemesis.characterName}님께 ${stats.nemesis.lossCount}번 패배했어요. 새로운 전략을 시도해보세요!`,
      icon: '🎯'
    });
  }

  // 전체 배틀 수 인사이트
  if (stats.totalBattles >= 100) {
    insights.push({
      type: 'achievement',
      message: `🎖️ ${stats.totalBattles}번의 배틀 경험! 진정한 베테랑이에요!`,
      icon: '🎖️'
    });
  } else if (stats.totalBattles >= 50) {
    insights.push({
      type: 'achievement',
      message: `🥇 ${stats.totalBattles}번의 배틀! 경험이 쌓이고 있어요!`,
      icon: '🥇'
    });
  }

  // 평균 점수 변화 인사이트
  if (stats.averageScoreChange > 5) {
    insights.push({
      type: 'trend',
      message: `💰 평균 ${stats.averageScoreChange}점씩 획득! 효율적인 전투예요!`,
      icon: '💰'
    });
  }

  return insights;
}