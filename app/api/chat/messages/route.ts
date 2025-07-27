import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

// 채팅 메시지 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    // 24시간 이내 메시지만 조회
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('메시지 조회 오류:', error);
      return NextResponse.json(
        { error: '메시지를 불러올 수 없어요!' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        messages: messages || [],
        count: messages?.length || 0
      }
    });

  } catch (error) {
    console.error('채팅 메시지 조회 오류:', error);
    return NextResponse.json(
      { error: '메시지 조회 중 문제가 발생했어요!' },
      { status: 500 }
    );
  }
}