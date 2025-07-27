import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiResponse, errorResponse, checkAuth, validateRequest, kidLog } from '@/lib/api-helpers';

// 👤 사용자 프로필 조회 API - 나의 정보를 확인해요!
export async function GET(req: NextRequest) {
  try {
    const auth = checkAuth(req);
    if (!auth) {
      return errorResponse('unauthorized', 401);
    }

    // 사용자 정보 조회
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        age,
        avatar,
        role,
        parent_email,
        is_active,
        last_login,
        play_time_limit,
        today_play_time,
        created_at
      `)
      .eq('id', auth.userId)
      .single();

    if (error || !user) {
      console.error('사용자 조회 오류:', error);
      return errorResponse('사용자 정보를 찾을 수 없어요! 🤔', 404);
    }

    // 사용자 통계 조회
    const [animals, battles, achievements] = await Promise.all([
      // 보유 동물 수
      supabase
        .from('user_animals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', auth.userId),
      
      // 배틀 통계
      supabase
        .from('battles')
        .select('*', { count: 'exact' })
        .or(`player1_id.eq.${auth.userId},player2_id.eq.${auth.userId}`),
      
      // 달성한 업적 수
      supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', auth.userId)
    ]);

    // 승률 계산
    const totalBattles = battles.count || 0;
    const wins = battles.data?.filter(b => b.winner_id === auth.userId).length || 0;
    const losses = totalBattles - wins;
    const winRate = totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0;

    // 플레이 시간 관련 정보
    const remainingPlayTime = Math.max(0, user.play_time_limit - user.today_play_time);
    const playTimePercentage = user.play_time_limit > 0 
      ? Math.round((user.today_play_time / user.play_time_limit) * 100) 
      : 0;

    // 계정 생성 후 경과 일수
    const accountAge = Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    return apiResponse(
      {
        profile: {
          id: user.id,
          username: user.username,
          email: user.email,
          age: user.age,
          avatar: user.avatar,
          role: user.role,
          parentEmail: user.parent_email,
          isActive: user.is_active,
          lastLogin: user.last_login,
          createdAt: user.created_at,
          accountAgeDays: accountAge
        },
        stats: {
          animalsCollected: animals.count || 0,
          battlesTotal: totalBattles,
          battlesWon: wins,
          battlesLost: losses,
          winRate: `${winRate}%`,
          achievementsUnlocked: achievements.count || 0
        },
        playTime: {
          dailyLimit: user.play_time_limit,
          todayPlayed: user.today_play_time,
          remaining: remainingPlayTime,
          percentage: playTimePercentage,
          status: remainingPlayTime > 0 ? 'active' : 'limit_reached'
        },
        badges: getBadges(wins, animals.count || 0, accountAge),
        welcomeMessage: getWelcomeMessage(user.username, wins, accountAge)
      },
      `안녕하세요, ${user.username}님! 🎮`
    );

  } catch (error) {
    console.error('프로필 조회 에러:', error);
    return errorResponse('프로필을 불러오는 중 문제가 발생했어요!', 500);
  }
}

// 🎨 프로필 업데이트 API - 내 정보를 수정해요!
export async function PUT(req: NextRequest) {
  try {
    const auth = checkAuth(req);
    if (!auth) {
      return errorResponse('unauthorized', 401);
    }

    const { valid, data, error } = await validateRequest(req, {});
    if (!valid) {
      return errorResponse(error || 'badRequest', 400);
    }

    const { username, age, avatar, parentEmail } = data;

    // 업데이트할 필드만 포함
    const updates: any = {};
    
    if (username !== undefined) {
      // 사용자명 검증 (2-20자, 한글/영문/숫자)
      if (!username || username.length < 2 || username.length > 20) {
        return errorResponse('사용자 이름은 2자 이상 20자 이하여야 해요! 📝', 400);
      }
      
      // 중복 체크
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', auth.userId)
        .single();
      
      if (existing) {
        return errorResponse('이미 사용 중인 이름이에요! 다른 이름을 선택해주세요 🤔', 400);
      }
      
      updates.username = username;
    }

    if (age !== undefined) {
      // 나이 검증 (7-15세)
      if (age < 7 || age > 15) {
        return errorResponse('7세에서 15세 사이의 친구들만 플레이할 수 있어요! 🎮', 400);
      }
      updates.age = age;
    }

    if (avatar !== undefined) {
      // 아바타 이모지 검증
      const allowedAvatars = ['🙂', '😊', '🤗', '😎', '🤩', '🥳', '🦁', '🐯', '🦊', '🐻', '🐼', '🐨', '🐵', '🦄', '🐉'];
      if (!allowedAvatars.includes(avatar)) {
        return errorResponse('선택할 수 없는 아바타예요! 🎭', 400);
      }
      updates.avatar = avatar;
    }

    if (parentEmail !== undefined) {
      // 부모 이메일 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (parentEmail && !emailRegex.test(parentEmail)) {
        return errorResponse('올바른 이메일 주소를 입력해주세요! 📧', 400);
      }
      updates.parent_email = parentEmail;
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('수정할 정보를 입력해주세요! 📝', 400);
    }

    // 프로필 업데이트
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', auth.userId)
      .select()
      .single();

    if (updateError) {
      console.error('프로필 업데이트 오류:', updateError);
      return errorResponse('프로필 수정 중 문제가 발생했어요!', 500);
    }

    kidLog('프로필 업데이트', auth.userId, { 
      updatedFields: Object.keys(updates) 
    });

    // 업데이트된 정보에 따른 응답 메시지
    const messages = [];
    if (updates.username) messages.push(`이제 ${updates.username}님이라고 불러드릴게요!`);
    if (updates.age) messages.push(`나이 정보가 업데이트되었어요!`);
    if (updates.avatar) messages.push(`새로운 아바타 ${updates.avatar}가 멋져요!`);
    if (updates.parent_email) messages.push(`부모님 이메일이 등록되었어요!`);

    return apiResponse(
      {
        profile: updatedUser,
        updatedFields: Object.keys(updates),
        message: messages.join(' '),
        tips: [
          '💡 프로필 사진은 언제든 바꿀 수 있어요!',
          '🎨 다양한 아바타를 시도해보세요!',
          '📧 부모님 이메일을 등록하면 더 안전해요!'
        ]
      },
      `프로필이 성공적으로 수정되었어요! ✨`,
      200
    );

  } catch (error) {
    console.error('프로필 업데이트 에러:', error);
    return errorResponse('프로필 수정 중 문제가 발생했어요!', 500);
  }
}

// 뱃지 시스템
function getBadges(wins: number, animals: number, days: number): string[] {
  const badges = [];
  
  // 승리 뱃지
  if (wins >= 100) badges.push('🏆 백전백승');
  else if (wins >= 50) badges.push('🥇 승리의 달인');
  else if (wins >= 10) badges.push('🥈 떠오르는 스타');
  else if (wins >= 1) badges.push('🥉 첫 승리');
  
  // 컬렉션 뱃지
  if (animals >= 50) badges.push('🦁 동물 박사');
  else if (animals >= 20) badges.push('🐾 동물 수집가');
  else if (animals >= 5) badges.push('🐣 동물 친구');
  
  // 플레이 기간 뱃지
  if (days >= 365) badges.push('⭐ 1년 개근상');
  else if (days >= 100) badges.push('💫 100일 기념');
  else if (days >= 30) badges.push('🌟 한 달 플레이어');
  else if (days >= 7) badges.push('✨ 일주일 모험가');
  
  return badges;
}

// 환영 메시지 생성
function getWelcomeMessage(username: string, wins: number, days: number): string {
  if (days === 0) {
    return `${username}님, 환영해요! 멋진 모험을 시작해보세요! 🎉`;
  } else if (wins === 0) {
    return `${username}님, 오늘은 첫 승리를 거둬보는 건 어때요? 💪`;
  } else if (wins >= 50) {
    return `${username}님, 정말 대단한 실력이에요! 계속 화이팅! 🏆`;
  } else {
    return `${username}님, 오늘도 즐거운 배틀 되세요! 🎮`;
  }
}