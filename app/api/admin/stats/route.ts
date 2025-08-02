import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 관리자 토큰 검증 함수
function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.slice(7);
  // 간단한 토큰 검증 (실제로는 더 복잡한 검증 필요)
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

    // 전체 사용자 수
    const totalUsers = await db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    
    // 게스트와 일반 사용자 구분
    const guestUsers = await db.prepare('SELECT COUNT(*) as count FROM users WHERE is_guest = 1').get() as { count: number };
    const registeredUsers = await db.prepare('SELECT COUNT(*) as count FROM users WHERE is_guest = 0').get() as { count: number };
    
    // 활성 사용자 (최근 7일 이내 로그인)
    const activeUsers = await db.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE datetime(last_login) > datetime('now', '-7 days')
    `).get() as { count: number };
    
    // 정지된 사용자
    const suspendedUsers = await db.prepare('SELECT COUNT(*) as count FROM users WHERE is_suspended = 1').get() as { count: number };
    
    // 전체 캐릭터 수
    const totalCharacters = await db.prepare('SELECT COUNT(*) as count FROM characters WHERE is_bot = 0').get() as { count: number };
    const botCharacters = await db.prepare('SELECT COUNT(*) as count FROM characters WHERE is_bot = 1').get() as { count: number };
    
    // 전체 배틀 수
    const totalBattles = await db.prepare('SELECT COUNT(*) as count FROM battles').get() as { count: number };
    
    // 오늘의 배틀 수
    const todayBattles = await db.prepare(`
      SELECT COUNT(*) as count FROM battles 
      WHERE date(created_at) = date('now')
    `).get() as { count: number };
    
    // 이번 주 배틀 수
    const weekBattles = await db.prepare(`
      SELECT COUNT(*) as count FROM battles 
      WHERE datetime(created_at) > datetime('now', '-7 days')
    `).get() as { count: number };
    
    // 평균 ELO 점수
    const avgElo = await db.prepare(`
      SELECT AVG(elo_score) as avg FROM characters 
      WHERE is_bot = 0 AND is_active = 1
    `).get() as { avg: number };
    
    // 상위 10개 캐릭터
    const topCharacters = await db.prepare(`
      SELECT 
        c.id,
        c.character_name,
        c.base_score,
        c.elo_score,
        c.wins,
        c.losses,
        c.total_active_battles + c.total_passive_battles as total_battles,
        a.name as animal_name,
        a.korean_name,
        a.emoji,
        u.email as owner_email,
        u.display_name as owner_name,
        u.is_guest
      FROM characters c
      JOIN animals a ON c.animal_id = a.id
      JOIN users u ON c.user_id = u.id
      WHERE c.is_bot = 0 AND c.is_active = 1 AND u.is_suspended = 0
      ORDER BY c.base_score DESC, c.elo_score DESC
      LIMIT 10
    `).all();
    
    // 최근 20개 배틀
    const recentBattles = await db.prepare(`
      SELECT 
        b.id,
        b.created_at,
        b.battle_type,
        b.winner_id,
        ac.character_name as attacker_name,
        dc.character_name as defender_name,
        wc.character_name as winner_name,
        b.attacker_score_change,
        b.defender_score_change,
        b.attacker_elo_change,
        b.defender_elo_change,
        aa.emoji as attacker_emoji,
        da.emoji as defender_emoji,
        au.display_name as attacker_owner,
        du.display_name as defender_owner
      FROM battles b
      JOIN characters ac ON b.attacker_id = ac.id
      JOIN characters dc ON b.defender_id = dc.id
      LEFT JOIN characters wc ON b.winner_id = wc.id
      JOIN animals aa ON ac.animal_id = aa.id
      JOIN animals da ON dc.animal_id = da.id
      JOIN users au ON ac.user_id = au.id
      JOIN users du ON dc.user_id = du.id
      ORDER BY b.created_at DESC
      LIMIT 20
    `).all();
    
    // 경고 받은 사용자 목록
    const warningUsers = await db.prepare(`
      SELECT 
        u.id,
        u.email,
        u.display_name,
        u.warning_count,
        u.is_suspended,
        u.suspended_reason,
        COUNT(DISTINCT c.id) as character_count,
        COUNT(DISTINCT w.id) as total_warnings
      FROM users u
      LEFT JOIN characters c ON u.id = c.user_id
      LEFT JOIN warnings w ON u.id = w.user_id
      WHERE u.warning_count > 0
      GROUP BY u.id
      ORDER BY u.warning_count DESC
      LIMIT 20
    `).all();
    
    // 동물별 통계
    const animalStats = await db.prepare(`
      SELECT 
        a.id,
        a.name,
        a.korean_name,
        a.emoji,
        a.category,
        COUNT(c.id) as character_count,
        AVG(c.elo_score) as avg_elo,
        SUM(c.wins) as total_wins,
        SUM(c.losses) as total_losses
      FROM animals a
      LEFT JOIN characters c ON a.id = c.animal_id AND c.is_bot = 0
      GROUP BY a.id
      ORDER BY character_count DESC
    `).all();
    
    // 시간대별 배틀 통계 (최근 24시간)
    const hourlyBattles = await db.prepare(`
      SELECT 
        strftime('%H', created_at) as hour,
        COUNT(*) as count
      FROM battles
      WHERE datetime(created_at) > datetime('now', '-24 hours')
      GROUP BY hour
      ORDER BY hour
    `).all();
    
    // 일별 신규 사용자 (최근 30일)
    const dailyNewUsers = await db.prepare(`
      SELECT 
        date(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE datetime(created_at) > datetime('now', '-30 days')
      GROUP BY date
      ORDER BY date DESC
    `).all();
    
    // 현재 온라인 사용자 (최근 5분 이내 활동)
    const onlineUsers = await db.prepare(`
      SELECT 
        u.id,
        u.email,
        u.display_name,
        u.last_login,
        COUNT(DISTINCT c.id) as character_count
      FROM users u
      LEFT JOIN characters c ON u.id = c.user_id
      WHERE datetime(u.last_login) > datetime('now', '-5 minutes')
      GROUP BY u.id
      ORDER BY u.last_login DESC
    `).all();

    return NextResponse.json({
      success: true,
      data: {
        // 기본 통계
        totalUsers: totalUsers.count,
        guestUsers: guestUsers.count,
        registeredUsers: registeredUsers.count,
        activeUsers: activeUsers.count,
        suspendedUsers: suspendedUsers.count,
        onlineUsersCount: onlineUsers.length,
        
        // 캐릭터 통계
        totalCharacters: totalCharacters.count,
        botCharacters: botCharacters.count,
        
        // 배틀 통계
        totalBattles: totalBattles.count,
        todayBattles: todayBattles.count,
        weekBattles: weekBattles.count,
        
        // 평균값
        averageElo: Math.round(avgElo.avg || 1500),
        
        // 상세 데이터
        topCharacters,
        recentBattles,
        warningUsers,
        animalStats,
        hourlyBattles,
        dailyNewUsers,
        onlineUsers
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({
      success: false,
      error: '통계 조회 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}