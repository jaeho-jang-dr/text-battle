import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiResponse, errorResponse, checkAuth, kidLog } from '@/lib/api-helpers';

// 🎯 매치메이킹 API - 실력이 비슷한 친구를 찾아요!
export async function GET(req: NextRequest) {
  try {
    const auth = checkAuth(req);
    if (!auth) {
      return errorResponse('unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') || 'balanced'; // balanced, easy, hard, random
    const excludeRecent = searchParams.get('excludeRecent') !== 'false';

    // 현재 사용자의 통계 조회
    const { data: userStats } = await supabase
      .from('users')
      .select(`
        id,
        username,
        avatar,
        user_animals (
          battles_won,
          battles_lost,
          level,
          animals (
            power,
            defense,
            speed,
            intelligence
          )
        )
      `)
      .eq('id', auth.userId)
      .single();

    if (!userStats || !userStats.user_animals || userStats.user_animals.length === 0) {
      return errorResponse('먼저 동물 친구를 만들어주세요! 🦁', 400);
    }

    // 사용자의 전체 통계 계산
    const userTotalStats = calculateUserStats(userStats.user_animals);

    // 최근 대전 상대 제외 (같은 상대와 반복 대전 방지)
    let recentOpponents: string[] = [];
    if (excludeRecent) {
      const { data: recentBattles } = await supabase
        .from('battles')
        .select('player1_id, player2_id')
        .or(`player1_id.eq.${auth.userId},player2_id.eq.${auth.userId}`)
        .order('created_at', { ascending: false })
        .limit(10);

      recentOpponents = recentBattles?.map(b => 
        b.player1_id === auth.userId ? b.player2_id : b.player1_id
      ) || [];
    }

    // 매치메이킹 대상 조회
    let query = supabase
      .from('users')
      .select(`
        id,
        username,
        avatar,
        created_at,
        user_animals (
          battles_won,
          battles_lost,
          level,
          animals (
            power,
            defense,
            speed,
            intelligence,
            rarity
          )
        )
      `)
      .neq('id', auth.userId)
      .eq('is_active', true)
      .gt('user_animals.count', 0);

    // 최근 상대 제외
    if (recentOpponents.length > 0) {
      query = query.not('id', 'in', `(${recentOpponents.join(',')})`);
    }

    const { data: candidates, error } = await query;

    if (error) {
      console.error('매치메이킹 조회 오류:', error);
      return errorResponse('상대를 찾는 중 문제가 발생했어요!', 500);
    }

    if (!candidates || candidates.length === 0) {
      return apiResponse(
        {
          status: 'no_matches',
          message: '현재 대전할 수 있는 친구가 없어요! 😢',
          tips: [
            '⏰ 잠시 후 다시 시도해보세요!',
            '🎮 친구들을 초대해서 함께 플레이해보세요!',
            '🦁 더 많은 동물을 수집해보세요!'
          ]
        },
        '매칭 가능한 플레이어가 없어요!',
        200
      );
    }

    // 각 후보자의 매칭 점수 계산
    const scoredCandidates = candidates
      .filter(c => c.user_animals && c.user_animals.length > 0)
      .map(candidate => {
        const candidateStats = calculateUserStats(candidate.user_animals);
        const matchScore = calculateMatchScore(userTotalStats, candidateStats, mode);
        
        return {
          ...candidate,
          stats: candidateStats,
          matchScore,
          difficulty: getDifficultyLevel(userTotalStats, candidateStats)
        };
      })
      .filter(c => c.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    if (scoredCandidates.length === 0) {
      return apiResponse(
        {
          status: 'no_suitable_matches',
          message: '실력이 비슷한 친구를 찾을 수 없어요! 🤔',
          allCandidates: candidates.length,
          tips: [
            '🎯 다른 매칭 모드를 시도해보세요!',
            '⏰ 나중에 다시 찾아보면 새로운 친구가 있을 거예요!',
            '💪 더 연습해서 실력을 키워보세요!'
          ]
        },
        '적절한 상대를 찾을 수 없어요!',
        200
      );
    }

    // 상위 5명 추천
    const recommendations = scoredCandidates.slice(0, 5).map((candidate, index) => ({
      rank: index + 1,
      id: candidate.id,
      username: candidate.username,
      avatar: candidate.avatar || '🦁',
      level: Math.round(candidate.stats.avgLevel),
      winRate: candidate.stats.winRate,
      totalBattles: candidate.stats.totalBattles,
      difficulty: candidate.difficulty,
      matchScore: Math.round(candidate.matchScore),
      bestAnimal: getBestAnimal(candidate.user_animals),
      accountAge: getAccountAge(candidate.created_at),
      recommendation: getRecommendationMessage(candidate.difficulty, index)
    }));

    // 매칭 로그
    kidLog('매치메이킹 조회', auth.userId, { 
      mode,
      candidatesFound: scoredCandidates.length,
      topMatch: recommendations[0]?.username 
    });

    return apiResponse(
      {
        status: 'matches_found',
        mode,
        matches: recommendations,
        userStats: {
          level: Math.round(userTotalStats.avgLevel),
          winRate: userTotalStats.winRate,
          totalBattles: userTotalStats.totalBattles
        },
        tips: [
          '🎯 실력이 비슷한 친구와 대전하면 더 재미있어요!',
          '💪 어려운 상대와 싸우면 더 많이 배울 수 있어요!',
          '🏆 승리하면 더 많은 경험치를 얻어요!',
          '🤝 패배해도 괜찮아요, 모두가 친구예요!'
        ]
      },
      `${recommendations.length}명의 대전 상대를 찾았어요! 🎮`,
      200
    );

  } catch (error) {
    console.error('매치메이킹 에러:', error);
    return errorResponse('상대를 찾는 중 문제가 발생했어요!', 500);
  }
}

// 사용자 통계 계산
function calculateUserStats(userAnimals: any[]): any {
  const totalWins = userAnimals.reduce((sum, ua) => sum + (ua.battles_won || 0), 0);
  const totalLosses = userAnimals.reduce((sum, ua) => sum + (ua.battles_lost || 0), 0);
  const totalBattles = totalWins + totalLosses;
  const winRate = totalBattles > 0 ? Math.round((totalWins / totalBattles) * 100) : 50;
  const avgLevel = userAnimals.reduce((sum, ua) => sum + ua.level, 0) / userAnimals.length;
  
  // 평균 스탯 계산
  let totalPower = 0, totalDefense = 0, totalSpeed = 0, totalIntelligence = 0;
  let animalCount = 0;
  
  userAnimals.forEach(ua => {
    if (ua.animals) {
      totalPower += ua.animals.power || 0;
      totalDefense += ua.animals.defense || 0;
      totalSpeed += ua.animals.speed || 0;
      totalIntelligence += ua.animals.intelligence || 0;
      animalCount++;
    }
  });

  const avgStats = animalCount > 0 ? {
    power: totalPower / animalCount,
    defense: totalDefense / animalCount,
    speed: totalSpeed / animalCount,
    intelligence: totalIntelligence / animalCount
  } : { power: 50, defense: 50, speed: 50, intelligence: 50 };

  return {
    totalWins,
    totalLosses,
    totalBattles,
    winRate,
    avgLevel,
    avgStats,
    animalCount: userAnimals.length,
    powerScore: calculatePowerScore(avgStats, avgLevel, winRate)
  };
}

// 전투력 점수 계산
function calculatePowerScore(stats: any, level: number, winRate: number): number {
  const statsTotal = stats.power + stats.defense + stats.speed + stats.intelligence;
  const levelBonus = level * 10;
  const winRateBonus = winRate * 0.5;
  
  return statsTotal + levelBonus + winRateBonus;
}

// 매칭 점수 계산
function calculateMatchScore(userStats: any, candidateStats: any, mode: string): number {
  const powerDiff = Math.abs(userStats.powerScore - candidateStats.powerScore);
  const levelDiff = Math.abs(userStats.avgLevel - candidateStats.avgLevel);
  const winRateDiff = Math.abs(userStats.winRate - candidateStats.winRate);
  
  // 기본 점수 (차이가 적을수록 높은 점수)
  let score = 100 - (powerDiff * 0.1) - (levelDiff * 5) - (winRateDiff * 0.3);
  
  // 모드별 조정
  switch (mode) {
    case 'easy':
      // 쉬운 상대 선호 (상대가 약할수록 점수 증가)
      if (candidateStats.powerScore < userStats.powerScore) {
        score += 20;
      } else {
        score -= 30;
      }
      break;
      
    case 'hard':
      // 어려운 상대 선호 (상대가 강할수록 점수 증가)
      if (candidateStats.powerScore > userStats.powerScore) {
        score += 20;
      } else {
        score -= 30;
      }
      break;
      
    case 'random':
      // 랜덤 요소 추가
      score += Math.random() * 50 - 25;
      break;
      
    // balanced는 기본 점수 유지
  }
  
  // 배틀 경험이 있는 플레이어 선호
  if (candidateStats.totalBattles > 0) {
    score += 10;
  }
  
  return Math.max(0, score);
}

// 난이도 레벨 판단
function getDifficultyLevel(userStats: any, candidateStats: any): string {
  const powerRatio = candidateStats.powerScore / userStats.powerScore;
  
  if (powerRatio < 0.7) return '쉬움';
  if (powerRatio < 0.9) return '약간 쉬움';
  if (powerRatio < 1.1) return '비슷함';
  if (powerRatio < 1.3) return '약간 어려움';
  return '어려움';
}

// 최고의 동물 정보
function getBestAnimal(userAnimals: any[]): any {
  if (!userAnimals || userAnimals.length === 0) return null;
  
  const best = userAnimals.reduce((best, current) => {
    const currentPower = (current.animals?.power || 0) + 
                        (current.animals?.defense || 0) + 
                        (current.animals?.speed || 0) + 
                        (current.animals?.intelligence || 0) +
                        (current.level * 10);
    const bestPower = (best.animals?.power || 0) + 
                     (best.animals?.defense || 0) + 
                     (best.animals?.speed || 0) + 
                     (best.animals?.intelligence || 0) +
                     (best.level * 10);
    
    return currentPower > bestPower ? current : best;
  });
  
  return best.animals ? {
    name: best.animals.korean_name || '알 수 없음',
    emoji: best.animals.emoji || '🦁',
    level: best.level,
    rarity: best.animals.rarity || 'common'
  } : null;
}

// 계정 나이 계산
function getAccountAge(createdAt: string): string {
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  
  if (days === 0) return '오늘 가입';
  if (days === 1) return '어제 가입';
  if (days < 7) return `${days}일 전 가입`;
  if (days < 30) return `${Math.floor(days / 7)}주 전 가입`;
  if (days < 365) return `${Math.floor(days / 30)}개월 전 가입`;
  return `${Math.floor(days / 365)}년 전 가입`;
}

// 추천 메시지 생성
function getRecommendationMessage(difficulty: string, rank: number): string {
  const messages = {
    '쉬움': ['자신감을 키울 수 있는 상대예요!', '연습하기 좋은 친구예요!', '편하게 즐길 수 있어요!'],
    '약간 쉬움': ['적당히 도전적인 상대예요!', '좋은 연습 상대예요!', '재미있는 대전이 될 거예요!'],
    '비슷함': ['가장 재미있는 대전이 될 거예요!', '실력이 비슷해서 박진감 넘쳐요!', '최고의 매치예요!'],
    '약간 어려움': ['도전해볼 만한 상대예요!', '이기면 정말 뿌듯할 거예요!', '실력을 키울 기회예요!'],
    '어려움': ['강한 상대지만 도전해보세요!', '많이 배울 수 있는 기회예요!', '용기를 내서 도전!']
  };
  
  const difficultyMessages = messages[difficulty as keyof typeof messages] || messages['비슷함'];
  return difficultyMessages[rank % difficultyMessages.length];
}