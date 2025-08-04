import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

// GET: 경고 내역 조회
export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const adminToken = request.headers.get('X-Admin-Token');
    if (!adminToken) {
      return NextResponse.json({
        success: false,
        error: '관리자 권한이 필요합니다'
      }, { status: 401 });
    }

    const admin = await db.prepare(`
      SELECT * FROM admin_users 
      WHERE auth_token = ?
    `).get(adminToken);

    if (!admin) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 관리자 토큰입니다'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = `
      SELECT 
        w.*,
        u.display_name,
        u.email,
        u.is_guest,
        c.character_name
      FROM warnings w
      JOIN users u ON w.user_id = u.id
      LEFT JOIN characters c ON w.character_id = c.id
    `;

    const params = [];
    if (userId) {
      query += ` WHERE w.user_id = ?`;
      params.push(userId);
    }

    query += ` ORDER BY w.created_at DESC LIMIT ?`;
    params.push(limit);

    const warnings = await db.prepare(query).all(...params);

    // 경고 유형별 통계
    const stats = await db.prepare(`
      SELECT 
        warning_type,
        COUNT(*) as count
      FROM warnings
      GROUP BY warning_type
      ORDER BY count DESC
    `).all();

    return NextResponse.json({
      success: true,
      data: {
        warnings,
        stats
      }
    });
  } catch (error) {
    console.error('Warnings fetch error:', error);
    return NextResponse.json({
      success: false,
      error: '경고 내역을 불러오는 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}