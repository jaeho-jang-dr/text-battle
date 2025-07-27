import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/server';

// 콘텐츠 필터링 API
export async function POST(request: NextRequest) {
  try {
    const { content, userId } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: '검사할 내용을 입력해주세요!' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    // 필터 목록 가져오기
    const { data: filters, error: filterError } = await supabase
      .from('content_filters')
      .select('*')
      .eq('is_active', true);

    if (filterError) {
      console.error('필터 조회 오류:', filterError);
      return NextResponse.json(
        { error: '필터 조회 중 문제가 발생했어요!' },
        { status: 500 }
      );
    }

    let filteredContent = content;
    let violations: any[] = [];
    let totalSeverity = 0;

    // 각 필터 적용
    for (const filter of filters || []) {
      const regex = new RegExp(filter.word_pattern, 'gi');
      const matches = content.match(regex);
      
      if (matches) {
        violations.push({
          type: filter.filter_type,
          severity: filter.severity,
          matches: matches.length
        });
        
        totalSeverity += filter.severity * matches.length;
        filteredContent = filteredContent.replace(regex, filter.replacement);
      }
    }

    // 사용자 경고 처리
    if (violations.length > 0 && userId) {
      // 현재 사용자 정보 조회
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('warnings_count, account_suspended')
        .eq('id', userId)
        .single();

      if (!userError && user && !user.account_suspended) {
        const newWarningsCount = (user.warnings_count || 0) + 1;

        // 경고 기록 추가
        await supabase
          .from('user_warnings')
          .insert({
            user_id: userId,
            warning_type: violations[0].type,
            warning_message: getWarningMessage(newWarningsCount),
            content: content
          });

        // 사용자 경고 횟수 업데이트
        await supabase
          .from('users')
          .update({ warnings_count: newWarningsCount })
          .eq('id', userId);

        // 3회 이상 경고시 계정 정지
        if (newWarningsCount >= 3) {
          await supabase
            .from('users')
            .update({
              account_suspended: true,
              suspended_at: new Date().toISOString(),
              suspension_reason: '부적절한 언어 사용으로 인한 자동 정지'
            })
            .eq('id', userId);

          return NextResponse.json({
            success: false,
            filtered: true,
            filteredContent,
            violations,
            warning: {
              count: newWarningsCount,
              message: '계정이 정지되었어요. 부모님께 연락해주세요.',
              suspended: true
            }
          });
        }

        return NextResponse.json({
          success: true,
          filtered: true,
          filteredContent,
          violations,
          warning: {
            count: newWarningsCount,
            message: getWarningMessage(newWarningsCount),
            suspended: false
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      filtered: violations.length > 0,
      filteredContent,
      violations
    });

  } catch (error) {
    console.error('콘텐츠 필터링 오류:', error);
    return NextResponse.json(
      { error: '콘텐츠 검사 중 문제가 발생했어요!' },
      { status: 500 }
    );
  }
}

function getWarningMessage(warningCount: number): string {
  switch (warningCount) {
    case 1:
      return '🟡 첫 번째 경고예요! 바른 말을 사용해주세요.';
    case 2:
      return '🟠 두 번째 경고예요! 한 번 더 경고받으면 게임을 할 수 없어요.';
    case 3:
      return '🔴 세 번째 경고로 계정이 정지되었어요. 부모님께 연락해주세요.';
    default:
      return '⚠️ 부적절한 언어가 감지되었어요.';
  }
}