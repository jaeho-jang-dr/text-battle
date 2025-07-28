import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({
        success: false,
        error: '인증 토큰이 없습니다'
      }, { status: 401 });
    }

    // 토큰으로 사용자 조회
    const user = db.prepare(`
      SELECT * FROM users 
      WHERE login_token = ? 
      AND datetime(token_expires_at) > datetime('now')
    `).get(token);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 토큰입니다'
      }, { status: 401 });
    }

    // 캐릭터 조회
    const characters = db.prepare(`
      SELECT c.*, a.*,
        c.id as id, c.character_name,
        a.id as animal_id, a.name as animal_name
      FROM characters c
      JOIN animals a ON c.animal_id = a.id
      WHERE c.user_id = ?
    `).all(user.id);

    // 사용자 데이터에 캐릭터 추가
    user.characters = characters.map(char => ({
      ...char,
      animal: {
        id: char.animal_id,
        name: char.animal_name,
        koreanName: char.korean_name,
        emoji: char.emoji,
        category: char.category
      },
      activeBattlesToday: char.active_battles_today
    }));

    // 정지된 계정 확인
    if (user.is_suspended) {
      return NextResponse.json({
        success: false,
        error: '계정이 정지되었습니다',
        suspendedReason: user.suspended_reason
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({
      success: false,
      error: '인증 확인 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}