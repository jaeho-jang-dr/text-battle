import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiResponse, errorResponse, rateLimiter, kidLog } from '@/lib/api-helpers';

// 🎮 아이들을 위한 캐릭터 로그인 API
export async function POST(req: NextRequest) {
  try {
    // IP 기반 속도 제한
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    if (!rateLimiter(`kid-login:${ip}`, 10, 300000)) { // 5분에 10번
      return errorResponse('잠시 후에 다시 시도해주세요! ⏰', 429);
    }

    const body = await req.json();
    const { parentEmail, avatar, username } = body;

    // 필수 필드 확인
    if (!parentEmail || !avatar || !username) {
      return errorResponse('모든 정보를 입력해주세요! 📝', 400);
    }

    // 부모 이메일과 캐릭터로 계정 찾기
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('parent_email', parentEmail)
      .eq('avatar', avatar)
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      kidLog('캐릭터 로그인 실패', undefined, { parentEmail, avatar, username });
      return errorResponse('계정을 찾을 수 없어요. 정보를 다시 확인해주세요! 🔍', 404);
    }

    // 로그인 시간 업데이트
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // 플레이 세션 시작
    const { data: session } = await supabase
      .from('play_sessions')
      .insert([{
        user_id: user.id,
        start_time: new Date().toISOString()
      }])
      .select()
      .single();

    // 민감한 정보 제거
    const { password_hash, parent_email, ...safeUser } = user;

    kidLog('캐릭터 로그인 성공', user.id, { username: user.username });

    // 나이에 맞는 환영 메시지
    const welcomeMessages = [
      `${avatar} ${username}님, 다시 만나서 반가워요!`,
      `와! ${username}님이 돌아왔어요! ${avatar}`,
      `${username}님, 오늘도 즐거운 모험을 시작해요! ${avatar}`,
      `${avatar} ${username}님과 함께라면 뭐든 할 수 있어요!`
    ];

    return apiResponse(
      {
        user: safeUser,
        sessionId: session?.id,
        welcomeMessage: welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)],
        dailyTip: getDailyTip(user.age),
        playTimeRemaining: user.play_time_limit - (user.today_play_time || 0)
      },
      `로그인 성공! ${avatar} ${username}님 환영해요! 🎉`,
      200
    );

  } catch (error) {
    console.error('캐릭터 로그인 에러:', error);
    return errorResponse('로그인 중 문제가 발생했어요. 잠시 후 다시 시도해주세요!', 500);
  }
}

// 나이별 일일 팁
function getDailyTip(age: number): string {
  const tips7to9 = [
    '🎮 오늘은 새로운 동물 친구를 만나보는 건 어때요?',
    '💡 배틀에서 긴 문장을 쓰면 더 강해져요!',
    '🌟 매일 조금씩 플레이하면 더 강해질 수 있어요!',
    '🦁 동물들의 특성을 잘 활용해보세요!'
  ];

  const tips10to12 = [
    '🧠 지능이 높은 동물은 전략적인 플레이가 가능해요!',
    '⚔️ 상대의 약점을 파악하면 승리할 확률이 높아져요!',
    '🏆 업적을 달성하면 특별한 보상을 받을 수 있어요!',
    '📚 동물 도감을 완성해보세요!'
  ];

  const tips13to15 = [
    '💪 스탯 조합을 다양하게 시도해보세요!',
    '🎨 나만의 동물을 만들어 친구들과 공유해보세요!',
    '📊 전투 기록을 분석해서 전략을 개선해보세요!',
    '🌍 다양한 서식지의 동물들을 모아보세요!'
  ];

  let tipArray = tips7to9;
  if (age >= 10 && age <= 12) tipArray = tips10to12;
  else if (age >= 13) tipArray = tips13to15;

  return tipArray[Math.floor(Math.random() * tipArray.length)];
}