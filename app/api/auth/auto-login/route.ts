import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: '자동 로그인 토큰이 없어요!' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    // 토큰으로 사용자 조회
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('auto_login_token', token)
      .eq('is_active', true)
      .eq('account_suspended', false)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰이에요!' },
        { status: 401 }
      );
    }

    // 마지막 로그인 시간 업데이트
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // 민감한 정보 제거
    const { password_hash, auto_login_token, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      message: `${user.username}님, 다시 만나서 반가워요! 🎉`,
      data: {
        user: safeUser
      }
    });

  } catch (error) {
    console.error('자동 로그인 오류:', error);
    return NextResponse.json(
      { error: '자동 로그인 중 문제가 발생했어요!' },
      { status: 500 }
    );
  }
}