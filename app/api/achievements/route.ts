import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiResponse, errorResponse, checkAuth, kidLog } from '@/lib/api-helpers';

// 🏆 업적 목록 조회 API - 멋진 도전 과제들!
export async function GET(req: NextRequest) {
  try {
    const auth = checkAuth(req);
    const userId = auth?.userId;

    // 모든 업적 조회
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*')
      .order('requirement_value', { ascending: true });

    if (error) {
      console.error('업적 조회 오류:', error);
      return errorResponse('업적을 불러오는 중 문제가 발생했어요!', 500);
    }

    // 사용자가 로그인한 경우 달성 여부 확인
    let userAchievements: any[] = [];
    if (userId) {
      const { data } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', userId);
      
      userAchievements = data || [];
    }

    // 업적 데이터 포맷팅
    const formattedAchievements = achievements?.map(achievement => {
      const userAchievement = userAchievements.find(
        ua => ua.achievement_id === achievement.id
      );

      return {
        ...achievement,
        isUnlocked: !!userAchievement,
        unlockedAt: userAchievement?.unlocked_at,
        progress: userId ? getAchievementProgress(achievement, userId) : null
      };
    }) || [];

    // 카테고리별 분류
    const categorized = {
      battles: formattedAchievements.filter(a => a.requirement_type.includes('battle')),
      collection: formattedAchievements.filter(a => a.requirement_type.includes('animal')),
      play: formattedAchievements.filter(a => a.requirement_type.includes('play')),
      special: formattedAchievements.filter(a => !['battle', 'animal', 'play'].some(t => a.requirement_type.includes(t)))
    };

    return apiResponse(
      {
        achievements: formattedAchievements,
        categorized,
        stats: {
          total: achievements?.length || 0,
          unlocked: userAchievements.length,
          percentage: achievements?.length 
            ? Math.round((userAchievements.length / achievements.length) * 100) 
            : 0
        },
        tips: [
          '🎯 업적을 달성하면 특별한 보상을 받을 수 있어요!',
          '🌟 어려운 업적일수록 더 좋은 보상이 기다려요!',
          '💡 매일 조금씩 도전해보세요!'
        ]
      },
      `${achievements?.length || 0}개의 멋진 도전이 기다리고 있어요! 🏆`
    );

  } catch (error) {
    console.error('업적 목록 조회 에러:', error);
    return errorResponse('업적을 불러오는 중 문제가 발생했어요!', 500);
  }
}

// 업적 진행도 계산 (실제로는 더 복잡한 로직)
async function getAchievementProgress(achievement: any, userId: string): Promise<number> {
  // 예시 구현
  switch (achievement.requirement_type) {
    case 'battles_won':
      // 승리한 배틀 수 조회
      const { count: wins } = await supabase
        .from('battles')
        .select('*', { count: 'exact', head: true })
        .eq('winner_id', userId);
      return Math.min((wins || 0) / achievement.requirement_value * 100, 100);

    case 'animals_collected':
      // 수집한 동물 수 조회
      const { count: animals } = await supabase
        .from('user_animals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      return Math.min((animals || 0) / achievement.requirement_value * 100, 100);

    default:
      return 0;
  }
}

// 🎁 업적 달성 확인 및 보상 API
export async function POST(req: NextRequest) {
  try {
    const auth = checkAuth(req);
    if (!auth) {
      return errorResponse('unauthorized', 401);
    }

    // 사용자의 현재 상태 확인
    const stats = await getUserStats(auth.userId);

    // 달성 가능한 업적 확인
    const { data: achievements } = await supabase
      .from('achievements')
      .select('*');

    // 이미 달성한 업적 확인
    const { data: unlockedAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', auth.userId);

    const unlockedIds = unlockedAchievements?.map(ua => ua.achievement_id) || [];
    const newAchievements = [];

    // 새로 달성한 업적 확인
    for (const achievement of achievements || []) {
      if (unlockedIds.includes(achievement.id)) continue;

      let achieved = false;
      switch (achievement.requirement_type) {
        case 'battles_won':
          achieved = stats.battlesWon >= achievement.requirement_value;
          break;
        case 'animals_collected':
          achieved = stats.animalsCollected >= achievement.requirement_value;
          break;
        case 'play_days':
          achieved = stats.playDays >= achievement.requirement_value;
          break;
        case 'perfect_battles':
          achieved = stats.perfectBattles >= achievement.requirement_value;
          break;
      }

      if (achieved) {
        newAchievements.push(achievement);
        
        // 업적 달성 기록
        await supabase
          .from('user_achievements')
          .insert([{
            user_id: auth.userId,
            achievement_id: achievement.id,
            unlocked_at: new Date().toISOString()
          }]);

        // 보상 지급
        await grantReward(auth.userId, achievement);
        
        kidLog('업적 달성', auth.userId, { 
          achievementName: achievement.name,
          achievementId: achievement.id 
        });
      }
    }

    if (newAchievements.length === 0) {
      return apiResponse(
        {
          message: '아직 새로운 업적이 없어요!',
          nextAchievements: await getNextAchievements(auth.userId),
          currentStats: stats
        },
        '계속 도전해보세요! 곧 업적을 달성할 거예요! 💪'
      );
    }

    return apiResponse(
      {
        newAchievements: newAchievements.map(a => ({
          id: a.id,
          name: a.name,
          description: a.description,
          emoji: a.emoji,
          reward: a.reward_data
        })),
        totalUnlocked: unlockedIds.length + newAchievements.length,
        message: `${newAchievements.length}개의 업적을 달성했어요!`,
        celebration: '🎉🎊🏆✨'
      },
      `와! ${newAchievements.length}개의 업적을 달성했어요! 🎉`,
      200
    );

  } catch (error) {
    console.error('업적 확인 에러:', error);
    return errorResponse('업적 확인 중 문제가 발생했어요!', 500);
  }
}

// 사용자 통계 조회
async function getUserStats(userId: string) {
  const [battles, animals, firstLogin] = await Promise.all([
    supabase.from('battles').select('*', { count: 'exact' })
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`),
    supabase.from('user_animals').select('*', { count: 'exact' })
      .eq('user_id', userId),
    supabase.from('users').select('created_at').eq('id', userId).single()
  ]);

  const battlesWon = battles.data?.filter(b => b.winner_id === userId).length || 0;
  const perfectBattles = battles.data?.filter(b => 
    b.winner_id === userId && b.battle_log?.includes('perfect')
  ).length || 0;

  const playDays = firstLogin.data 
    ? Math.floor((Date.now() - new Date(firstLogin.data.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    battlesWon,
    battlesTotal: battles.count || 0,
    animalsCollected: animals.count || 0,
    playDays,
    perfectBattles
  };
}

// 보상 지급
async function grantReward(userId: string, achievement: any) {
  if (!achievement.reward_type || !achievement.reward_data) return;

  switch (achievement.reward_type) {
    case 'animal':
      // 특별한 동물 잠금 해제
      await supabase
        .from('user_animals')
        .insert([{
          user_id: userId,
          animal_id: achievement.reward_data.animal_id,
          nickname: `${achievement.name} 보상`,
          level: 1,
          experience: 0
        }]);
      break;

    case 'avatar':
      // 새로운 아바타 추가 (사용자 정보 업데이트)
      // TODO: 아바타 시스템 구현
      break;

    case 'title':
      // 특별한 칭호 부여
      // TODO: 칭호 시스템 구현
      break;
  }
}

// 다음 달성 가능한 업적 추천
async function getNextAchievements(userId: string) {
  const stats = await getUserStats(userId);
  const { data: achievements } = await supabase
    .from('achievements')
    .select('*');

  const { data: unlockedIds } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  const unlocked = unlockedIds?.map(u => u.achievement_id) || [];

  return achievements
    ?.filter(a => !unlocked.includes(a.id))
    .map(a => {
      let progress = 0;
      let current = 0;
      
      switch (a.requirement_type) {
        case 'battles_won':
          current = stats.battlesWon;
          progress = (current / a.requirement_value) * 100;
          break;
        case 'animals_collected':
          current = stats.animalsCollected;
          progress = (current / a.requirement_value) * 100;
          break;
      }

      return {
        ...a,
        progress: Math.min(progress, 100),
        current,
        remaining: Math.max(0, a.requirement_value - current)
      };
    })
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3) || [];
}