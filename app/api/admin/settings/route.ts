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

    // 모든 설정 조회
    const settings = await db.prepare(`
      SELECT * FROM admin_settings
      ORDER BY setting_key
    `).all();

    return NextResponse.json({
      success: true,
      data: {
        settings
      }
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({
      success: false,
      error: '설정 조회 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 관리자 권한 검증
    if (!verifyAdminToken(request)) {
      return NextResponse.json({
        success: false,
        error: '관리자 권한이 필요합니다'
      }, { status: 401 });
    }

    const { key, value } = await request.json();

    if (!key || value === undefined) {
      return NextResponse.json({
        success: false,
        error: '설정 키와 값이 필요합니다'
      }, { status: 400 });
    }

    // 설정 업데이트
    await db.prepare(`
      UPDATE admin_settings
      SET setting_value = ?, updated_at = CURRENT_TIMESTAMP
      WHERE setting_key = ?
    `).run(value, key);

    // 로그 기록
    const logId = Math.random().toString(36).substring(7);
    db.prepare(`
      INSERT INTO admin_logs (id, admin_id, action_type, target_type, details, created_at)
      VALUES (?, 'admin', 'setting_updated', 'setting', ?, CURRENT_TIMESTAMP)
    `).run(logId, JSON.stringify({ key, value }));

    return NextResponse.json({
      success: true,
      data: {
        key,
        value
      }
    });
  } catch (error) {
    console.error('Setting update error:', error);
    return NextResponse.json({
      success: false,
      error: '설정 업데이트 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}