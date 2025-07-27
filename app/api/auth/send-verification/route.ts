import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: '이메일 주소를 입력해주세요!' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    // 인증 토큰 생성
    const token = crypto.randomBytes(32).toString('hex');
    
    // parent_approvals 테이블에 인증 요청 저장
    const { error: insertError } = await supabase
      .from('parent_approvals')
      .insert({
        parent_email: email,
        approval_type: 'registration',
        token: token,
        approval_data: { sent_at: new Date().toISOString() }
      });

    if (insertError) {
      console.error('인증 요청 저장 오류:', insertError);
      return NextResponse.json(
        { error: '인증 요청 저장에 실패했어요!' },
        { status: 500 }
      );
    }

    // 실제 운영 환경에서는 이메일 발송 서비스 사용
    // 여기서는 개발용으로 콘솔에 출력
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;
    console.log('부모 인증 링크:', verificationLink);

    // 개발 환경에서는 즉시 승인 처리 가능
    if (process.env.NODE_ENV === 'development') {
      console.log('개발 모드: 자동 승인 처리 가능');
    }

    return NextResponse.json({
      success: true,
      message: '인증 메일을 발송했어요! 부모님께서 이메일을 확인해주세요.',
      data: {
        email,
        // 개발 환경에서만 토큰 반환
        ...(process.env.NODE_ENV === 'development' && { token })
      }
    });

  } catch (error) {
    console.error('이메일 인증 오류:', error);
    return NextResponse.json(
      { error: '인증 메일 발송 중 문제가 발생했어요!' },
      { status: 500 }
    );
  }
}