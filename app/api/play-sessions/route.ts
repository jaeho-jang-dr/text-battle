import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiResponse, errorResponse, checkAuth, validateRequest, kidLog } from '@/lib/api-helpers';

// ⏱️ 플레이 세션 시작 API - 게임 시작 시간을 기록해요!
export async function POST(req: NextRequest) {
  try {
    const auth = checkAuth(req);
    if (!auth) {
      return errorResponse('unauthorized', 401);
    }

    const { valid, data, error } = await validateRequest(req, {});
    if (!valid) {
      return errorResponse(error || 'badRequest', 400);
    }

    const { action } = data;

    if (action === 'start') {
      return handleSessionStart(auth.userId);
    } else if (action === 'end') {
      return handleSessionEnd(auth.userId);
    } else if (action === 'check') {
      return checkPlayTime(auth.userId);
    } else {
      return errorResponse('올바른 액션을 선택해주세요! (start, end, check)', 400);
    }

  } catch (error) {
    console.error('플레이 세션 에러:', error);
    return errorResponse('플레이 세션 처리 중 문제가 발생했어요!', 500);
  }
}

// 세션 시작 처리
async function handleSessionStart(userId: string) {
  // 사용자 정보 및 현재 플레이 시간 확인
  const { data: user } = await supabase
    .from('users')
    .select('play_time_limit, today_play_time, username')
    .eq('id', userId)
    .single();

  if (!user) {
    return errorResponse('사용자 정보를 찾을 수 없어요!', 404);
  }

  // 플레이 시간 제한 확인
  if (user.today_play_time >= user.play_time_limit) {
    return apiResponse(
      {
        status: 'time_limit_reached',
        message: '오늘의 플레이 시간이 끝났어요! 내일 다시 만나요! 👋',
        todayPlayTime: user.today_play_time,
        limit: user.play_time_limit,
        remainingTime: 0,
        tips: [
          '📚 책을 읽어보는 건 어때요?',
          '🏃 밖에서 운동도 건강에 좋아요!',
          '🎨 그림을 그려보는 것도 재미있어요!',
          '👨‍👩‍👧 가족과 함께 시간을 보내보세요!'
        ]
      },
      '오늘은 충분히 플레이했어요! 내일 또 만나요! 😊',
      200
    );
  }

  // 진행 중인 세션이 있는지 확인
  const { data: activeSession } = await supabase
    .from('play_sessions')
    .select('*')
    .eq('user_id', userId)
    .is('end_time', null)
    .single();

  if (activeSession) {
    // 이미 세션이 있으면 계속 진행
    const sessionDuration = Math.floor(
      (Date.now() - new Date(activeSession.start_time).getTime()) / 1000 / 60
    );
    
    return apiResponse(
      {
        status: 'session_active',
        sessionId: activeSession.id,
        startTime: activeSession.start_time,
        currentDuration: sessionDuration,
        remainingTime: Math.max(0, user.play_time_limit - user.today_play_time - sessionDuration),
        message: '이미 게임을 플레이 중이에요! 🎮'
      },
      '게임 진행 중!',
      200
    );
  }

  // 새 세션 시작
  const { data: newSession, error } = await supabase
    .from('play_sessions')
    .insert([{
      user_id: userId,
      start_time: new Date().toISOString(),
      parent_approved: false
    }])
    .select()
    .single();

  if (error) {
    console.error('세션 시작 오류:', error);
    return errorResponse('게임을 시작하는 중 문제가 발생했어요!', 500);
  }

  kidLog('플레이 세션 시작', userId, { sessionId: newSession.id });

  const remainingTime = user.play_time_limit - user.today_play_time;
  const encouragements = [
    '즐거운 게임 시간 되세요! 🎮',
    '오늘도 멋진 모험이 기다려요! 🌟',
    '동물 친구들과 함께 놀아요! 🦁',
    '재미있게 플레이해요! 🎉'
  ];

  return apiResponse(
    {
      status: 'session_started',
      sessionId: newSession.id,
      startTime: newSession.start_time,
      remainingTime,
      dailyLimit: user.play_time_limit,
      todayPlayed: user.today_play_time,
      message: encouragements[Math.floor(Math.random() * encouragements.length)],
      warnings: remainingTime <= 10 ? [
        `⏰ 오늘은 ${remainingTime}분만 더 플레이할 수 있어요!`,
        '💡 시간이 얼마 남지 않았어요!'
      ] : []
    },
    `${user.username}님, 게임을 시작해요! 남은 시간: ${remainingTime}분 ⏱️`,
    201
  );
}

// 세션 종료 처리
async function handleSessionEnd(userId: string) {
  // 활성 세션 찾기
  const { data: activeSession } = await supabase
    .from('play_sessions')
    .select('*')
    .eq('user_id', userId)
    .is('end_time', null)
    .single();

  if (!activeSession) {
    return apiResponse(
      {
        status: 'no_active_session',
        message: '진행 중인 게임이 없어요!'
      },
      '종료할 세션이 없어요!',
      200
    );
  }

  // 세션 종료 및 플레이 시간 계산
  const endTime = new Date();
  const startTime = new Date(activeSession.start_time);
  const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60);

  // 세션 업데이트
  const { error: sessionError } = await supabase
    .from('play_sessions')
    .update({
      end_time: endTime.toISOString(),
      duration_minutes: durationMinutes
    })
    .eq('id', activeSession.id);

  if (sessionError) {
    console.error('세션 종료 오류:', sessionError);
    return errorResponse('게임 종료 처리 중 문제가 발생했어요!', 500);
  }

  // 사용자의 오늘 플레이 시간 업데이트
  const { data: user } = await supabase
    .from('users')
    .select('today_play_time, play_time_limit')
    .eq('id', userId)
    .single();

  const newPlayTime = (user?.today_play_time || 0) + durationMinutes;

  await supabase
    .from('users')
    .update({
      today_play_time: newPlayTime,
      last_login: endTime.toISOString()
    })
    .eq('id', userId);

  kidLog('플레이 세션 종료', userId, { 
    sessionId: activeSession.id,
    duration: durationMinutes 
  });

  // 플레이 시간에 따른 메시지
  let farewell = '';
  if (durationMinutes < 5) {
    farewell = '벌써 가시나요? 다음에 또 놀아요! 👋';
  } else if (durationMinutes < 30) {
    farewell = '재미있게 놀았나요? 다음에 또 만나요! 😊';
  } else if (durationMinutes < 60) {
    farewell = '오늘도 즐거웠어요! 좋은 하루 보내세요! 🌟';
  } else {
    farewell = '오랜 시간 함께해서 즐거웠어요! 충분히 쉬세요! 💤';
  }

  // 통계 정보
  const stats = {
    sessionDuration: durationMinutes,
    todayTotal: newPlayTime,
    remainingTime: Math.max(0, (user?.play_time_limit || 60) - newPlayTime),
    achievements: []
  };

  // 플레이 시간 관련 업적 확인
  if (newPlayTime >= 30 && user?.today_play_time < 30) {
    stats.achievements.push('🏅 오늘의 게이머 (30분 플레이)');
  }
  if (durationMinutes >= 60) {
    stats.achievements.push('⭐ 집중력 대장 (1시간 연속 플레이)');
  }

  return apiResponse(
    {
      status: 'session_ended',
      sessionId: activeSession.id,
      duration: {
        minutes: durationMinutes,
        formatted: formatDuration(durationMinutes)
      },
      todayStats: stats,
      message: farewell,
      tips: newPlayTime >= (user?.play_time_limit || 60) ? [
        '📚 이제 다른 활동을 해보는 건 어때요?',
        '🎨 그림을 그리거나 만들기를 해보세요!',
        '🏃 밖에서 신나게 뛰어놀아요!',
        '📖 재미있는 책을 읽어보세요!'
      ] : []
    },
    `${durationMinutes}분 동안 플레이했어요! ${farewell}`,
    200
  );
}

// 플레이 시간 확인
async function checkPlayTime(userId: string) {
  const { data: user } = await supabase
    .from('users')
    .select('username, play_time_limit, today_play_time')
    .eq('id', userId)
    .single();

  if (!user) {
    return errorResponse('사용자 정보를 찾을 수 없어요!', 404);
  }

  // 현재 진행 중인 세션 확인
  const { data: activeSession } = await supabase
    .from('play_sessions')
    .select('*')
    .eq('user_id', userId)
    .is('end_time', null)
    .single();

  let currentSessionTime = 0;
  if (activeSession) {
    currentSessionTime = Math.floor(
      (Date.now() - new Date(activeSession.start_time).getTime()) / 1000 / 60
    );
  }

  const totalPlayedToday = user.today_play_time + currentSessionTime;
  const remainingTime = Math.max(0, user.play_time_limit - totalPlayedToday);
  const percentage = Math.round((totalPlayedToday / user.play_time_limit) * 100);

  // 시간대별 메시지
  let statusMessage = '';
  let statusEmoji = '';
  
  if (remainingTime === 0) {
    statusMessage = '오늘의 플레이 시간이 모두 끝났어요!';
    statusEmoji = '🛑';
  } else if (remainingTime <= 5) {
    statusMessage = '플레이 시간이 거의 끝나가요!';
    statusEmoji = '⏰';
  } else if (remainingTime <= 15) {
    statusMessage = '시간이 얼마 남지 않았어요!';
    statusEmoji = '⏳';
  } else if (percentage >= 75) {
    statusMessage = '오늘 많이 플레이했네요!';
    statusEmoji = '😅';
  } else if (percentage >= 50) {
    statusMessage = '절반 정도 플레이했어요!';
    statusEmoji = '⏱️';
  } else {
    statusMessage = '충분한 플레이 시간이 남았어요!';
    statusEmoji = '✨';
  }

  return apiResponse(
    {
      username: user.username,
      playTime: {
        dailyLimit: user.play_time_limit,
        playedToday: user.today_play_time,
        currentSession: currentSessionTime,
        totalToday: totalPlayedToday,
        remaining: remainingTime,
        percentage,
        status: remainingTime > 0 ? 'active' : 'limit_reached'
      },
      session: activeSession ? {
        id: activeSession.id,
        startTime: activeSession.start_time,
        duration: currentSessionTime
      } : null,
      message: `${statusEmoji} ${statusMessage}`,
      visualBar: generateProgressBar(percentage),
      recommendations: remainingTime <= 15 ? [
        '💾 중요한 진행 상황을 저장하세요!',
        '🏁 마지막 배틀을 준비하세요!',
        '📝 오늘의 업적을 확인해보세요!'
      ] : []
    },
    `${user.username}님, 오늘 ${totalPlayedToday}분 플레이했어요! (남은 시간: ${remainingTime}분)`,
    200
  );
}

// 플레이 시간 포맷팅
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}분`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
}

// 진행 바 생성
function generateProgressBar(percentage: number): string {
  const filled = Math.round(percentage / 10);
  const empty = 10 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty) + ` ${percentage}%`;
}

// 매일 자정에 플레이 시간 초기화 (별도 크론잡으로 실행)
export async function resetDailyPlayTime() {
  const { error } = await supabase
    .from('users')
    .update({ today_play_time: 0 })
    .gt('today_play_time', 0);

  if (error) {
    console.error('일일 플레이 시간 초기화 오류:', error);
  } else {
    console.log('일일 플레이 시간이 초기화되었습니다.');
  }
}