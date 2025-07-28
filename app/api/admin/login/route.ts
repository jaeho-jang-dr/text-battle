import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
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
    const adminUser = db.prepare(`
      SELECT id, username, password_hash, display_name, permissions
      FROM admin_users
      WHERE username = ? AND is_active = 1
    `).get(username) as any;

    if (!adminUser) {
      return NextResponse.json({
        success: false,
        error: '잘못된 사용자명 또는 비밀번호입니다'
      }, { status: 401 });
    }

    // 비밀번호 확인
    const isValidPassword = bcrypt.compareSync(password, adminUser.password_hash);
    
    if (!isValidPassword) {
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
    db.prepare(`
      UPDATE admin_users
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(adminUser.id);

    // 로그 기록
    db.prepare(`
      INSERT INTO admin_logs (id, admin_id, action_type, details)
      VALUES (?, ?, ?, ?)
    `).run(uuidv4(), adminUser.id, 'admin_login', JSON.stringify({ username }));

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
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({
      success: false,
      error: '로그인 처리 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}