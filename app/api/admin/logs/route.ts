import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

// 관리자 토큰 검증 함수
function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.slice(7);
  return token && token.length > 0;
}

export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 검증
    if (!verifyAdminToken(request)) {
      return NextResponse.json({
        success: false,
        error: '관리자 권한이 필요합니다'
      }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all';

    // 로그 타입에 따른 필터링
    let typeCondition = '';
    switch (type) {
      case 'admin':
        typeCondition = "AND action_type IN ('admin_login', 'admin_action')";
        break;
      case 'user':
        typeCondition = "AND action_type IN ('user_login', 'character_created')";
        break;
      case 'battle':
        typeCondition = "AND action_type = 'battle_created'";
        break;
      case 'warning':
        typeCondition = "AND action_type IN ('warning_issued', 'user_suspended')";
        break;
      case 'all':
      default:
        typeCondition = '';
    }

    // 로그 조회 (최근 500개)
    const logs = await db.prepare(`
      SELECT 
        l.*,
        u.email as user_email,
        u.display_name as user_name
      FROM admin_logs l
      LEFT JOIN users u ON l.admin_id = u.id
      WHERE 1=1 ${typeCondition}
      ORDER BY l.created_at DESC
      LIMIT 500
    `).all();

    return NextResponse.json({
      success: true,
      data: {
        logs,
        type
      }
    });
  } catch (error) {
    console.error('Logs fetch error:', error);
    return NextResponse.json({
      success: false,
      error: '로그 조회 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}