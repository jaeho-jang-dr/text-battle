import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiResponse, errorResponse } from '@/lib/api-helpers';

// 🧒 부모 이메일로 아이 계정들 조회
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { parentEmail } = body;

    if (!parentEmail) {
      return errorResponse('부모님 이메일을 입력해주세요!', 400);
    }

    // 부모 이메일로 등록된 모든 아이 계정 조회
    const { data: accounts, error } = await supabase
      .from('users')
      .select('id, username, avatar, age')
      .eq('parent_email', parentEmail)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('계정 조회 오류:', error);
      return errorResponse('계정을 찾는 중 문제가 발생했어요!', 500);
    }

    if (!accounts || accounts.length === 0) {
      return apiResponse(
        {
          accounts: [],
          message: '등록된 계정이 없어요. 먼저 회원가입을 해주세요!'
        },
        '계정을 찾을 수 없어요 😢',
        404
      );
    }

    // 민감한 정보 제거하고 필요한 정보만 반환
    const safeAccounts = accounts.map(acc => ({
      username: acc.username,
      avatar: acc.avatar,
      age: acc.age
    }));

    return apiResponse(
      {
        accounts: safeAccounts,
        total: accounts.length,
        tip: '🎮 캐릭터를 선택해서 로그인하세요!'
      },
      `${accounts.length}개의 계정을 찾았어요! 🎉`
    );

  } catch (error) {
    console.error('아이 계정 조회 에러:', error);
    return errorResponse('계정을 찾는 중 문제가 발생했어요!', 500);
  }
}