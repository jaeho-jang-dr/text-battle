import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: '사용자명과 비밀번호를 입력해주세요'
      }, { status: 400 });
    }

    // 관리자 사용자 확인
    try {
      const adminUser = db.prepare(`
        SELECT id, username, display_name, permissions
        FROM admin_users
        WHERE username = ? AND is_active = 1
      `).get(username) as any;

      if (!adminUser) {
        return NextResponse.json({
          success: false,
          error: '잘못된 사용자명 또는 비밀번호입니다'
        }, { status: 401 });
      }

      // 간단한 비밀번호 확인 (개발용)
      // 주의: 실제 프로덕션에서는 bcrypt 또는 다른 해시 방법 사용 권장
      if (username !== 'admin' || password !== '1234') {
        return NextResponse.json({
          success: false,
          error: '잘못된 사용자명 또는 비밀번호입니다'
        }, { status: 401 });
      }

      // 로그인 토큰 생성
      const token = uuidv4();
      const tokenExpiry = new Date();
      tokenExpiry.setDate(tokenExpiry.getDate() + 7); // 7일 유효

      // 관리자 로그인 기록
      try {
        db.prepare(`
          UPDATE admin_users
          SET last_login = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(adminUser.id);
      } catch (updateError) {
        console.error('Admin user update error:', updateError);
      }

      // 로그 기록 - admin_logs 테이블이 있는 경우에만
      try {
        const logId = uuidv4();
        db.prepare(`
          INSERT INTO admin_logs (id, admin_id, action_type, target_type, details, created_at)
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(logId, adminUser.id, 'admin_login', 'admin_action', JSON.stringify({ username }));
      } catch (logError) {
        console.error('Admin log error (non-critical):', logError);
        // 로그 실패는 critical하지 않으므로 계속 진행
      }

      return NextResponse.json({
        success: true,
        data: {
          adminUser: {
            id: adminUser.id,
            username: adminUser.username,
            displayName: adminUser.display_name,
            permissions: adminUser.permissions
          },
          token,
          expiresAt: tokenExpiry.toISOString()
        }
      });
    } catch (dbError: any) {
      console.error('Database query error:', dbError);
      
      // 테이블이 없는 경우 기본 관리자 로그인 허용
      if (dbError.message && dbError.message.includes('no such table')) {
        if (username === 'admin' && password === '1234') {
          const token = uuidv4();
          const tokenExpiry = new Date();
          tokenExpiry.setDate(tokenExpiry.getDate() + 7);

          return NextResponse.json({
            success: true,
            data: {
              adminUser: {
                id: 'default-admin',
                username: 'admin',
                displayName: '시스템 관리자',
                permissions: 'all'
              },
              token,
              expiresAt: tokenExpiry.toISOString()
            }
          });
        }
      }

      return NextResponse.json({
        success: false,
        error: '로그인 처리 중 오류가 발생했습니다'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({
      success: false,
      error: '로그인 처리 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}