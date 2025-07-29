import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { filterEmail } from '@/lib/filters/content-filter';
import { updateUserActivity } from '@/lib/activity-tracker';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { email, isGuest } = await request.json();

    // 게스트 로그인
    if (isGuest) {
      const token = uuidv4();
      const tokenExpiresAt = new Date();
      tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 30); // 30일 유효

      const userId = uuidv4();
      const displayName = `게스트_${Math.floor(Math.random() * 10000)}`;
      
      const stmt = db.prepare(`
        INSERT INTO users (id, is_guest, display_name, login_token, token_expires_at)
        VALUES (?, 1, ?, ?, ?)
      `);
      
      stmt.run(userId, displayName, token, tokenExpiresAt.toISOString());
      
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      
      // 활동 추적
      updateUserActivity(userId);

      return NextResponse.json({
        success: true,
        data: {
          user,
          token,
          isNewUser: true
        }
      });
    }

    // 이메일 로그인
    if (!email) {
      return NextResponse.json({
        success: false,
        error: '이메일을 입력해주세요'
      }, { status: 400 });
    }

    // 이메일 필터링
    const emailFilter = filterEmail(email);
    if (!emailFilter.isClean) {
      return NextResponse.json({
        success: false,
        error: emailFilter.violations[0]
      }, { status: 400 });
    }

    // 기존 사용자 확인
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    const token = uuidv4();
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 30);

    if (existingUser) {
      // 기존 사용자 - 토큰 업데이트
      const stmt = db.prepare(`
        UPDATE users 
        SET login_token = ?, token_expires_at = ?, last_login = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      
      stmt.run(token, tokenExpiresAt.toISOString(), existingUser.id);
      
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(existingUser.id);
      
      // 활동 추적
      updateUserActivity(existingUser.id);

      return NextResponse.json({
        success: true,
        data: {
          user,
          token,
          isNewUser: false
        }
      });
    } else {
      // 신규 사용자
      const userId = uuidv4();
      const stmt = db.prepare(`
        INSERT INTO users (id, email, is_guest, login_token, token_expires_at)
        VALUES (?, ?, 0, ?, ?)
      `);
      
      stmt.run(userId, email, token, tokenExpiresAt.toISOString());
      
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      
      // 활동 추적
      updateUserActivity(userId);

      return NextResponse.json({
        success: true,
        data: {
          user,
          token,
          isNewUser: true
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: '로그인 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}