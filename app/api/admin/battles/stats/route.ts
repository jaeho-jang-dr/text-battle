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
    const range = searchParams.get('range') || 'week';

    // 날짜 조건 설정
    let dateCondition = '';
    switch (range) {
      case 'today':
        dateCondition = "AND date(b.created_at) = date('now')";
        break;
      case 'week':
        dateCondition = "AND datetime(b.created_at) > datetime('now', '-7 days')";
        break;
      case 'month':
        dateCondition = "AND datetime(b.created_at) > datetime('now', '-30 days')";
        break;
      case 'all':
      default:
        dateCondition = '';
    }

    // 상위 100명의 배틀 통계
    const battleStats = await db.prepare(`
      WITH battle_stats AS (
        SELECT 
          c.id,
          c.character_name,
          a.emoji,
          u.display_name as owner_name,
          COUNT(DISTINCT b.id) as total_battles,
          COUNT(DISTINCT CASE WHEN b.winner_id = c.id THEN b.id END) as wins,
          COUNT(DISTINCT CASE WHEN b.winner_id != c.id THEN b.id END) as losses,
          AVG(CASE 
            WHEN b.attacker_id = c.id THEN b.attacker_score_change
            WHEN b.defender_id = c.id THEN b.defender_score_change
          END) as avg_score_change
        FROM characters c
        JOIN animals a ON c.animal_id = a.id
        JOIN users u ON c.user_id = u.id
        LEFT JOIN battles b ON (b.attacker_id = c.id OR b.defender_id = c.id) ${dateCondition}
        WHERE c.is_bot = 0 AND c.is_active = 1
        GROUP BY c.id
        HAVING total_battles > 0
      ),
      most_faced AS (
        SELECT 
          c1.id as character_id,
          c2.character_name as opponent_name,
          COUNT(*) as face_count,
          ROW_NUMBER() OVER (PARTITION BY c1.id ORDER BY COUNT(*) DESC) as rn
        FROM battles b
        JOIN characters c1 ON (b.attacker_id = c1.id OR b.defender_id = c1.id)
        JOIN characters c2 ON (
          (b.attacker_id = c2.id AND b.defender_id = c1.id) OR 
          (b.defender_id = c2.id AND b.attacker_id = c1.id)
        )
        WHERE c1.id != c2.id ${dateCondition}
        GROUP BY c1.id, c2.id
      )
      SELECT 
        bs.*,
        CASE 
          WHEN bs.total_battles > 0 
          THEN ROUND(CAST(bs.wins AS REAL) / bs.total_battles * 100, 2) 
          ELSE 0 
        END as win_rate,
        COALESCE(mf.opponent_name, '없음') as most_faced_opponent,
        COALESCE(mf.face_count, 0) as most_faced_count
      FROM battle_stats bs
      LEFT JOIN most_faced mf ON bs.id = mf.character_id AND mf.rn = 1
      ORDER BY bs.total_battles DESC, bs.wins DESC
      LIMIT 100
    `).all();

    return NextResponse.json({
      success: true,
      data: {
        battleStats,
        range
      }
    });
  } catch (error) {
    console.error('Battle stats error:', error);
    return NextResponse.json({
      success: false,
      error: '배틀 통계 조회 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}