import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

// 채팅 메시지 전송
export async function POST(request: NextRequest) {
  try {
    const { userId, username, message, is_filtered } = await request.json();

    if (!userId || !username || !message) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었어요!' },
        { status: 400 }
      );
    }

    // 메시지 길이 확인
    if (message.length > 200) {
      return NextResponse.json(
        { error: '메시지는 200자까지만 입력할 수 있어요!' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    // 사용자 계정 상태 확인
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('account_suspended')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없어요!' },
        { status: 404 }
      );
    }

    if (user.account_suspended) {
      return NextResponse.json(
        { error: '계정이 정지되어 채팅을 할 수 없어요.' },
        { status: 403 }
      );
    }

    // 메시지 저장
    const { data: newMessage, error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        username,
        message,
        is_filtered: is_filtered || false
      })
      .select()
      .single();

    if (insertError) {
      console.error('메시지 저장 오류:', insertError);
      return NextResponse.json(
        { error: '메시지 전송에 실패했어요!' },
        { status: 500 }
      );
    }

    // 오래된 메시지 자동 삭제 (24시간 이상)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    await supabase
      .from('chat_messages')
      .delete()
      .lt('created_at', twentyFourHoursAgo.toISOString());

    return NextResponse.json({
      success: true,
      message: '메시지를 전송했어요! 💬',
      data: {
        message: newMessage
      }
    });

  } catch (error) {
    console.error('채팅 전송 오류:', error);
    return NextResponse.json(
      { error: '메시지 전송 중 문제가 발생했어요!' },
      { status: 500 }
    );
  }
}