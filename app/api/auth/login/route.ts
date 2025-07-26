import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { apiResponse, errorResponse, validateRequest, rateLimiter, kidLog } from '@/lib/api-helpers';

// 🔐 로그인 API - 친구들이 안전하게 들어올 수 있어요!
export async function POST(req: NextRequest) {
  try {
    // IP 기반 속도 제한
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    if (!rateLimiter(`login:${ip}`, 5, 300000)) { // 5분에 5번
      return errorResponse('tooManyRequests', 429);
    }

    // 요청 데이터 검증
    const { valid, data, error } = await validateRequest(req, {
      // 스키마 검증은 추후 구현
    });

    if (!valid) {
      return errorResponse(error || 'badRequest', 400);
    }

    const { loginMethod, username, email, password } = data;

    // 사용자명 또는 이메일로 사용자 찾기
    let query = supabase.from('users').select('*');
    
    if (loginMethod === 'username' && username) {
      query = query.eq('username', username);
    } else if (loginMethod === 'email' && email) {
      query = query.eq('email', email);
    } else if (username) {
      query = query.eq('username', username);
    } else if (email) {
      query = query.eq('email', email);
    } else {
      return errorResponse('닉네임이나 이메일을 입력해주세요!', 400);
    }

    const { data: user, error: userError } = await query.single();

    if (userError || !user) {
      kidLog('로그인 실패 - 사용자 없음', undefined, { username, email });
      return errorResponse('친구를 찾을 수 없어요. 회원가입을 해주세요! 🦁', 404);
    }

    // 계정 활성 상태 확인
    if (!user.is_active) {
      kidLog('로그인 실패 - 비활성 계정', user.id);
      return errorResponse('계정이 잠시 쉬고 있어요. 관리자님께 문의해주세요! 💤', 403);
    }

    // 비밀번호 확인
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      kidLog('로그인 실패 - 잘못된 비밀번호', user.id);
      return errorResponse('비밀번호가 맞지 않아요. 다시 확인해주세요! 🔑', 401);
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
    const { password_hash, ...safeUser } = user;

    kidLog('로그인 성공', user.id, { username: user.username });

    return apiResponse(
      {
        user: safeUser,
        sessionId: session?.id,
        welcomeMessage: `${user.username}님, 다시 만나서 반가워요! 🎉`,
        tip: '오늘도 즐거운 배틀 하세요! ⚔️',
      },
      `로그인 성공! ${user.avatar} ${user.username}님 환영해요!`,
      200
    );

  } catch (error) {
    console.error('로그인 에러:', error);
    return errorResponse('로그인 중 문제가 발생했어요. 잠시 후 다시 시도해주세요!', 500);
  }
}