import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: 관리자 통계 조회
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({
        success: false,
        error: '인증이 필요합니다'
      }, { status: 401 });
    }

    // 사용자 확인
    const user = db.prepare(`
      SELECT * FROM users 
      WHERE login_token = ? 
      AND datetime(token_expires_at) > datetime('now')
    `).get(token) as any;

    if (!user) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 토큰입니다'
      }, { status: 401 });
    }

    // 관리자 확인
    if (user.email !== 'admin@kidtextbattle.com') {
      return NextResponse.json({
        success: false,
        error: '관리자 권한이 필요합니다'
      }, { status: 403 });
    }

    // 통계 수집
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    const totalCharacters = db.prepare('SELECT COUNT(*) as count FROM characters WHERE is_active = 1').get() as { count: number };
    const totalBattles = db.prepare('SELECT COUNT(*) as count FROM battles').get() as { count: number };
    const activeUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_suspended = 0').get() as { count: number };
    const suspendedUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_suspended = 1').get() as { count: number };
    
    // 오늘 배틀 수
    const todayBattles = db.prepare(`
      SELECT COUNT(*) as count FROM battles 
      WHERE date(created_at) = date('now')
    `).get() as { count: number };

    // 평균 ELO
    const avgElo = db.prepare(`
      SELECT AVG(elo_score) as avg FROM characters 
      WHERE is_active = 1
    `).get() as { avg: number };

    // 상위 캐릭터
    const topCharacters = db.prepare(`
      SELECT 
        c.*,
        a.emoji,
        a.korean_name,
        u.email as owner_email,
        u.display_name as owner_name,
        (c.wins + c.losses) as total_battles
      FROM characters c
      JOIN animals a ON c.animal_id = a.id
      JOIN users u ON c.user_id = u.id
      WHERE c.is_active = 1
      ORDER BY c.elo_score DESC
      LIMIT 10
    `).all();

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsers.count,
        totalCharacters: totalCharacters.count,
        totalBattles: totalBattles.count,
        activeUsers: activeUsers.count,
        suspendedUsers: suspendedUsers.count,
        todayBattles: todayBattles.count,
        averageElo: Math.round(avgElo.avg || 1500),
        topCharacters
      }
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({
      success: false,
      error: '통계를 불러오는 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}