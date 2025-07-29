import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 관리자 토큰 검증 함수
function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.slice(7);
  return token && token.length > 0;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // 관리자 권한 검증
    if (!verifyAdminToken(request)) {
      return NextResponse.json({
        success: false,
        error: '관리자 권한이 필요합니다'
      }, { status: 401 });
    }

    const { userId } = params;

    // 사용자 정보 조회
    const user = db.prepare(`
      SELECT 
        u.*,
        COUNT(DISTINCT c.id) as character_count,
        COUNT(DISTINCT w.id) as warning_count_total,
        COUNT(DISTINCT CASE WHEN c.is_active = 1 THEN c.id END) as active_characters
      FROM users u
      LEFT JOIN characters c ON u.id = c.user_id
      LEFT JOIN warnings w ON u.id = w.user_id
      WHERE u.id = ?
      GROUP BY u.id
    `).get(userId) as any;

    if (!user) {
      return NextResponse.json({
        success: false,
        error: '사용자를 찾을 수 없습니다'
      }, { status: 404 });
    }

    // 사용자의 캐릭터 목록
    const characters = db.prepare(`
      SELECT 
        c.*,
        a.name as animal_name,
        a.korean_name,
        a.emoji,
        a.category,
        (c.wins + c.losses) as total_battles,
        CASE 
          WHEN (c.wins + c.losses) > 0 
          THEN ROUND(CAST(c.wins AS REAL) / (c.wins + c.losses) * 100, 2) 
          ELSE 0 
        END as win_rate
      FROM characters c
      JOIN animals a ON c.animal_id = a.id
      WHERE c.user_id = ?
      ORDER BY c.base_score DESC, c.elo_score DESC
    `).all(userId);

    // 최근 배틀 기록 (50개)
    const recentBattles = db.prepare(`
      SELECT 
        b.*,
        ac.character_name as attacker_name,
        dc.character_name as defender_name,
        aa.emoji as attacker_emoji,
        da.emoji as defender_emoji,
        au.display_name as attacker_owner,
        du.display_name as defender_owner,
        CASE 
          WHEN ac.user_id = ? THEN 'attacker'
          WHEN dc.user_id = ? THEN 'defender'
          ELSE 'none'
        END as user_role
      FROM battles b
      JOIN characters ac ON b.attacker_id = ac.id
      JOIN characters dc ON b.defender_id = dc.id
      JOIN animals aa ON ac.animal_id = aa.id
      JOIN animals da ON dc.animal_id = da.id
      JOIN users au ON ac.user_id = au.id
      JOIN users du ON dc.user_id = du.id
      WHERE ac.user_id = ? OR dc.user_id = ?
      ORDER BY b.created_at DESC
      LIMIT 50
    `).all(userId, userId, userId, userId);

    // 경고 기록
    const warnings = db.prepare(`
      SELECT 
        w.*,
        c.character_name
      FROM warnings w
      LEFT JOIN characters c ON w.character_id = c.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `).all(userId);

    // 활동 로그 (최근 30일)
    const activityLogs = db.prepare(`
      SELECT 
        *
      FROM admin_logs
      WHERE admin_id = ? AND datetime(created_at) > datetime('now', '-30 days')
      ORDER BY created_at DESC
      LIMIT 100
    `).all(userId);

    // 통계 계산
    const battleStats = db.prepare(`
      SELECT 
        COUNT(DISTINCT b.id) as total_battles,
        COUNT(DISTINCT CASE WHEN b.winner_id = c.id THEN b.id END) as total_wins,
        COUNT(DISTINCT CASE WHEN b.winner_id != c.id THEN b.id END) as total_losses,
        COUNT(DISTINCT CASE WHEN date(b.created_at) = date('now') THEN b.id END) as today_battles,
        COUNT(DISTINCT CASE WHEN datetime(b.created_at) > datetime('now', '-7 days') THEN b.id END) as week_battles
      FROM characters c
      LEFT JOIN battles b ON (b.attacker_id = c.id OR b.defender_id = c.id)
      WHERE c.user_id = ?
    `).get(userId) as any;

    return NextResponse.json({
      success: true,
      data: {
        user,
        characters,
        recentBattles,
        warnings,
        activityLogs,
        battleStats
      }
    });
  } catch (error) {
    console.error('User detail error:', error);
    return NextResponse.json({
      success: false,
      error: '사용자 정보 조회 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}