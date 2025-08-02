import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';

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
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '100');

    // 사용자 검색 (이메일, 표시명, ID)
    const users = await db.prepare(`
      SELECT 
        u.id,
        u.email,
        u.display_name,
        u.is_guest,
        u.is_suspended,
        u.warning_count,
        u.created_at,
        u.last_login,
        COUNT(DISTINCT c.id) as character_count,
        MAX(c.base_score) as highest_score,
        SUM(c.wins) as total_wins,
        SUM(c.losses) as total_losses
      FROM users u
      LEFT JOIN characters c ON u.id = c.user_id AND c.is_bot = 0
      WHERE 
        u.email LIKE ? OR 
        u.display_name LIKE ? OR 
        u.id LIKE ?
      GROUP BY u.id
      ORDER BY MAX(c.base_score) DESC, u.created_at DESC
      LIMIT ?
    `).all(`%${query}%`, `%${query}%`, `%${query}%`, limit);

    return NextResponse.json({
      success: true,
      data: {
        users,
        query,
        count: users.length
      }
    });
  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json({
      success: false,
      error: '사용자 검색 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}