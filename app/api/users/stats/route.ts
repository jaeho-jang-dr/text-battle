import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiResponse, errorResponse, checkAuth, kidLog } from '@/lib/api-helpers';

// 📊 사용자 통계 API - 나의 게임 실적을 확인해요!
export async function GET(req: NextRequest) {
  try {
    const auth = checkAuth(req);
    if (!auth) {
      return errorResponse('unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'all'; // all, today, week, month
    const detailed = searchParams.get('detailed') === 'true';

    // 기본 사용자 정보
    const { data: user } = await supabase
      .from('users')
      .select('username, avatar, created_at')
      .eq('id', auth.userId)
      .single();

    if (!user) {
      return errorResponse('사용자를 찾을 수 없어요!', 404);
    }

    // 날짜 필터 설정
    let dateFilter = null;
    const now = new Date();
    
    switch (period) {
      case 'today':
        dateFilter = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        break;
      case 'week':
        dateFilter = new Date(now.setDate(now.getDate() - 7)).toISOString();
        break;
      case 'month':
        dateFilter = new Date(now.setDate(now.getDate() - 30)).toISOString();
        break;
    }

    // 배틀 통계 조회
    let battlesQuery = supabase
      .from('battles')
      .select('*', { count: 'exact' })
      .or(`player1_id.eq.${auth.userId},player2_id.eq.${auth.userId}`);
    
    if (dateFilter) {
      battlesQuery = battlesQuery.gte('created_at', dateFilter);
    }

    const { data: battles, count: totalBattles } = await battlesQuery;

    // 기본 통계 계산
    const wins = battles?.filter(b => b.winner_id === auth.userId).length || 0;
    const losses = (totalBattles || 0) - wins;
    const winRate = totalBattles ? Math.round((wins / totalBattles) * 100) : 0;

    // 동물별 통계
    const { data: userAnimals } = await supabase
      .from('user_animals')
      .select(`
        *,
        animals (
          id,
          name,
          korean_name,
          emoji,
          rarity,
          category
        )
      `)
      .eq('user_id', auth.userId);

    // 동물별 상세 통계
    const animalStats = userAnimals?.map(ua => {
      const animalBattles = battles?.filter(b => 
        (b.player1_id === auth.userId && b.player1_animal_id === ua.animal_id) ||
        (b.player2_id === auth.userId && b.player2_animal_id === ua.animal_id)
      ) || [];
      
      const animalWins = animalBattles.filter(b => b.winner_id === auth.userId).length;
      const animalTotal = animalBattles.length;
      const animalWinRate = animalTotal > 0 ? Math.round((animalWins / animalTotal) * 100) : 0;

      return {
        animal: ua.animals,
        nickname: ua.nickname,
        level: ua.level,
        experience: ua.experience,
        stats: {
          battles: animalTotal,
          wins: animalWins,
          losses: animalTotal - animalWins,
          winRate: animalWinRate
        }
      };
    }).sort((a, b) => b.stats.wins - a.stats.wins) || [];

    // 최고 성과
    const bestAnimal = animalStats.length > 0 ? animalStats[0] : null;
    const mostUsedAnimal = userAnimals?.reduce((best, current) => {
      const currentTotal = current.battles_won + current.battles_lost;
      const bestTotal = best.battles_won + best.battles_lost;
      return currentTotal > bestTotal ? current : best;
    });

    // 연속 승리/패배 계산
    const streaks = calculateStreaks(battles || [], auth.userId);

    // 일일/주간/월간 통계
    const periodStats = await getPeriodStats(auth.userId, period);

    // 업적 통계
    const { count: achievementsCount } = await supabase
      .from('user_achievements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', auth.userId);

    // 순위 정보
    const rankInfo = await getUserRank(auth.userId);

    // 재미있는 통계
    const funStats = {
      favoriteTime: await getFavoritePlayTime(auth.userId),
      totalPlayTime: await getTotalPlayTime(auth.userId),
      averageBattleDuration: '3분', // 예시
      mostFacedOpponent: await getMostFacedOpponent(auth.userId, battles || []),
      rarityCollection: getRarityStats(userAnimals || [])
    };

    // 성장 추세
    const growthTrend = await getGrowthTrend(auth.userId, battles || []);

    kidLog('통계 조회', auth.userId, { period, detailed });

    const response = {
      user: {
        username: user.username,
        avatar: user.avatar,
        joinDate: user.created_at,
        daysPlayed: Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
      },
      overview: {
        totalBattles: totalBattles || 0,
        wins,
        losses,
        winRate: `${winRate}%`,
        currentStreak: streaks.current,
        bestStreak: streaks.best,
        worstStreak: streaks.worst
      },
      animals: {
        total: userAnimals?.length || 0,
        stats: detailed ? animalStats : animalStats.slice(0, 3),
        bestPerformer: bestAnimal,
        mostUsed: mostUsedAnimal ? {
          name: mostUsedAnimal.animals?.korean_name,
          emoji: mostUsedAnimal.animals?.emoji,
          battles: mostUsedAnimal.battles_won + mostUsedAnimal.battles_lost
        } : null
      },
      achievements: {
        unlocked: achievementsCount || 0,
        recent: await getRecentAchievements(auth.userId, 3)
      },
      ranking: rankInfo,
      periodStats,
      funStats,
      growthTrend,
      motivationalMessage: getMotivationalMessage(winRate, totalBattles || 0, streaks.current)
    };

    return apiResponse(
      response,
      `${user.username}님의 ${period === 'all' ? '전체' : period === 'today' ? '오늘' : period === 'week' ? '이번 주' : '이번 달'} 통계예요! 📊`,
      200
    );

  } catch (error) {
    console.error('통계 조회 에러:', error);
    return errorResponse('통계를 불러오는 중 문제가 발생했어요!', 500);
  }
}

// 연속 승리/패배 계산
function calculateStreaks(battles: any[], userId: string): any {
  if (battles.length === 0) return { current: 0, best: 0, worst: 0 };

  const sortedBattles = battles.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  let currentStreak = 0;
  let bestStreak = 0;
  let worstStreak = 0;
  let tempStreak = 0;
  let isWinStreak = null;

  for (const battle of sortedBattles) {
    const isWin = battle.winner_id === userId;

    if (isWinStreak === null) {
      isWinStreak = isWin;
      tempStreak = 1;
    } else if (isWin === isWinStreak) {
      tempStreak++;
    } else {
      if (isWinStreak) {
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        worstStreak = Math.min(worstStreak, -tempStreak);
      }
      isWinStreak = isWin;
      tempStreak = 1;
    }
  }

  // 마지막 연속 기록 처리
  if (isWinStreak) {
    bestStreak = Math.max(bestStreak, tempStreak);
    currentStreak = tempStreak;
  } else {
    worstStreak = Math.min(worstStreak, -tempStreak);
    currentStreak = -tempStreak;
  }

  return {
    current: currentStreak,
    best: bestStreak,
    worst: Math.abs(worstStreak)
  };
}

// 기간별 통계
async function getPeriodStats(userId: string, period: string) {
  const stats = {
    battlesPerDay: 0,
    winRateTrend: 'stable' as 'improving' | 'stable' | 'declining',
    peakDay: null as string | null,
    comparison: null as any
  };

  if (period === 'week' || period === 'month') {
    const days = period === 'week' ? 7 : 30;
    const { data: dailyBattles } = await supabase
      .from('battles')
      .select('created_at, winner_id')
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (dailyBattles && dailyBattles.length > 0) {
      stats.battlesPerDay = Math.round(dailyBattles.length / days * 10) / 10;
      
      // 승률 추세 계산
      const firstHalf = dailyBattles.slice(0, Math.floor(dailyBattles.length / 2));
      const secondHalf = dailyBattles.slice(Math.floor(dailyBattles.length / 2));
      
      const firstHalfWinRate = firstHalf.filter(b => b.winner_id === userId).length / firstHalf.length;
      const secondHalfWinRate = secondHalf.filter(b => b.winner_id === userId).length / secondHalf.length;
      
      if (secondHalfWinRate > firstHalfWinRate + 0.1) stats.winRateTrend = 'improving';
      else if (secondHalfWinRate < firstHalfWinRate - 0.1) stats.winRateTrend = 'declining';
    }
  }

  return stats;
}

// 선호 플레이 시간대
async function getFavoritePlayTime(userId: string): Promise<string> {
  const { data: sessions } = await supabase
    .from('play_sessions')
    .select('start_time')
    .eq('user_id', userId)
    .limit(50);

  if (!sessions || sessions.length === 0) return '아직 데이터가 없어요';

  const hourCounts: Record<number, number> = {};
  sessions.forEach(session => {
    const hour = new Date(session.start_time).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const favoriteHour = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)[0][0];

  const hour = parseInt(favoriteHour);
  if (hour >= 6 && hour < 12) return '아침형 게이머 🌅';
  if (hour >= 12 && hour < 18) return '오후형 게이머 ☀️';
  if (hour >= 18 && hour < 22) return '저녁형 게이머 🌆';
  return '밤형 게이머 🌙';
}

// 총 플레이 시간
async function getTotalPlayTime(userId: string): Promise<string> {
  const { data: sessions } = await supabase
    .from('play_sessions')
    .select('duration_minutes')
    .eq('user_id', userId);

  const totalMinutes = sessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;
  
  if (totalMinutes < 60) return `${totalMinutes}분`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}시간 ${minutes}분`;
}

// 가장 많이 만난 상대
async function getMostFacedOpponent(userId: string, battles: any[]): Promise<any> {
  const opponentCounts: Record<string, number> = {};
  
  battles.forEach(battle => {
    const opponentId = battle.player1_id === userId ? battle.player2_id : battle.player1_id;
    opponentCounts[opponentId] = (opponentCounts[opponentId] || 0) + 1;
  });

  const mostFacedId = Object.entries(opponentCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0];

  if (!mostFacedId) return null;

  const { data: opponent } = await supabase
    .from('users')
    .select('username, avatar')
    .eq('id', mostFacedId)
    .single();

  return opponent ? {
    username: opponent.username,
    avatar: opponent.avatar,
    battles: opponentCounts[mostFacedId]
  } : null;
}

// 희귀도별 수집 통계
function getRarityStats(userAnimals: any[]): any {
  const counts = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0
  };

  userAnimals.forEach(ua => {
    const rarity = ua.animals?.rarity || 'common';
    counts[rarity as keyof typeof counts]++;
  });

  return counts;
}

// 사용자 순위
async function getUserRank(userId: string): Promise<any> {
  const { data: allUsers } = await supabase
    .from('users')
    .select(`
      id,
      user_animals(battles_won, battles_lost)
    `);

  const rankings = allUsers?.map(user => {
    const totalWins = user.user_animals.reduce((sum: number, ua: any) => sum + ua.battles_won, 0);
    const totalBattles = user.user_animals.reduce((sum: number, ua: any) => sum + ua.battles_won + ua.battles_lost, 0);
    return { id: user.id, wins: totalWins, battles: totalBattles };
  }).sort((a, b) => b.wins - a.wins) || [];

  const rank = rankings.findIndex(r => r.id === userId) + 1;

  return {
    current: rank || 999,
    total: rankings.length,
    percentile: rank ? Math.round((1 - (rank / rankings.length)) * 100) : 0,
    badge: rank <= 3 ? '🏆' : rank <= 10 ? '⭐' : rank <= 25 ? '✨' : '💫'
  };
}

// 성장 추세
async function getGrowthTrend(userId: string, battles: any[]): Promise<any> {
  if (battles.length < 10) {
    return {
      status: 'insufficient_data',
      message: '더 많은 배틀이 필요해요!'
    };
  }

  const recentBattles = battles.slice(0, 10);
  const olderBattles = battles.slice(10, 20);

  const recentWinRate = recentBattles.filter(b => b.winner_id === userId).length / recentBattles.length;
  const olderWinRate = olderBattles.length > 0 
    ? olderBattles.filter(b => b.winner_id === userId).length / olderBattles.length 
    : 0;

  const improvement = ((recentWinRate - olderWinRate) * 100).toFixed(1);

  return {
    recentWinRate: Math.round(recentWinRate * 100),
    improvement: parseFloat(improvement),
    trend: parseFloat(improvement) > 5 ? '상승' : parseFloat(improvement) < -5 ? '하락' : '유지',
    emoji: parseFloat(improvement) > 5 ? '📈' : parseFloat(improvement) < -5 ? '📉' : '➡️'
  };
}

// 최근 업적
async function getRecentAchievements(userId: string, limit: number): Promise<any[]> {
  const { data } = await supabase
    .from('user_achievements')
    .select(`
      unlocked_at,
      achievements (name, emoji, description)
    `)
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false })
    .limit(limit);

  return data?.map(ua => ({
    name: ua.achievements?.name,
    emoji: ua.achievements?.emoji,
    unlockedAt: ua.unlocked_at
  })) || [];
}

// 동기부여 메시지
function getMotivationalMessage(winRate: number, totalBattles: number, currentStreak: number): string {
  if (currentStreak >= 5) {
    return '🔥 대단해요! 연승 중이에요! 계속 이어가보세요!';
  } else if (currentStreak <= -3) {
    return '💪 포기하지 마세요! 다음엔 꼭 이길 거예요!';
  } else if (winRate >= 70) {
    return '🏆 최고의 실력자예요! 정말 대단해요!';
  } else if (winRate >= 50) {
    return '⭐ 좋은 성적이에요! 계속 노력하면 더 잘할 수 있어요!';
  } else if (totalBattles < 10) {
    return '🌱 이제 시작이에요! 더 많이 플레이해보세요!';
  } else {
    return '🎯 조금씩 실력이 늘고 있어요! 화이팅!';
  }
}