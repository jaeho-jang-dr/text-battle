const Database = require('better-sqlite3');
const path = require('path');

// 데이터베이스 경로
const dbPath = path.join(__dirname, '..', 'kid-text-battle.db');
const db = new Database(dbPath);

// 로그 기록 함수
function logCleanup(message, details = {}) {
  console.log(`[${new Date().toISOString()}] ${message}`, details);
  
  // 관리자 로그에도 기록
  try {
    const logId = 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    db.prepare(`
      INSERT INTO admin_logs (id, action_type, target_type, details, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(
      logId,
      'automatic_cleanup',
      'system',
      JSON.stringify({
        message,
        ...details,
        timestamp: new Date().toISOString()
      })
    );
  } catch (err) {
    console.error('Failed to write admin log:', err);
  }
}

// 게스트 정리 함수
function cleanupOldGuests() {
  console.log('Starting guest cleanup process...');
  
  try {
    // 24시간 이상 된 게스트 찾기
    const oldGuests = db.prepare(`
      SELECT 
        u.id, 
        u.display_name, 
        u.created_at,
        COUNT(DISTINCT c.id) as character_count,
        COUNT(DISTINCT b.id) as battle_count
      FROM users u
      LEFT JOIN characters c ON u.id = c.user_id AND c.is_active = 1
      LEFT JOIN battles b ON (c.id = b.attacker_id OR c.id = b.defender_id)
      WHERE u.is_guest = 1 
      AND datetime(u.created_at) < datetime('now', '-1 day')
      GROUP BY u.id
    `).all();
    
    if (oldGuests.length === 0) {
      logCleanup('No old guest accounts to clean up');
      return;
    }
    
    logCleanup(`Found ${oldGuests.length} old guest accounts to clean up`);
    
    // 트랜잭션으로 정리
    const cleanupTransaction = db.transaction(() => {
      let totalCharacters = 0;
      let totalBattles = 0;
      
      for (const guest of oldGuests) {
        totalCharacters += guest.character_count;
        totalBattles += guest.battle_count;
        
        // 캐릭터 비활성화
        db.prepare(`
          UPDATE characters 
          SET is_active = 0 
          WHERE user_id = ?
        `).run(guest.id);
        
        // 경고 기록 삭제
        db.prepare(`
          DELETE FROM warnings 
          WHERE user_id = ?
        `).run(guest.id);
        
        // 사용자 삭제
        db.prepare(`
          DELETE FROM users 
          WHERE id = ?
        `).run(guest.id);
        
        console.log(`- Removed guest: ${guest.display_name} (created: ${guest.created_at})`);
      }
      
      return { totalCharacters, totalBattles };
    });
    
    const stats = cleanupTransaction();
    
    logCleanup('Guest cleanup completed', {
      removed_users: oldGuests.length,
      removed_characters: stats.totalCharacters,
      total_battles: stats.totalBattles
    });
    
    // 데이터베이스 최적화
    console.log('Optimizing database...');
    db.pragma('vacuum');
    db.pragma('analyze');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    logCleanup('Cleanup failed', { error: error.message });
  }
}

// 통계 업데이트
function updateGuestStats() {
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_guests,
        COUNT(CASE WHEN datetime(created_at) < datetime('now', '-1 day') THEN 1 END) as old_guests,
        COUNT(CASE WHEN datetime(created_at) >= datetime('now', '-1 day') THEN 1 END) as new_guests
      FROM users
      WHERE is_guest = 1
    `).get();
    
    // 관리자 설정에 통계 저장
    db.prepare(`
      INSERT OR REPLACE INTO admin_settings (id, setting_key, setting_value, updated_at)
      VALUES (
        (SELECT id FROM admin_settings WHERE setting_key = 'guest_stats'),
        'guest_stats',
        ?,
        datetime('now')
      )
    `).run(JSON.stringify({
      ...stats,
      last_cleanup: new Date().toISOString()
    }));
    
    console.log('Guest statistics updated:', stats);
    
  } catch (error) {
    console.error('Failed to update guest stats:', error);
  }
}

// 메인 실행
function main() {
  console.log('=== Guest Cleanup Service ===');
  console.log(`Time: ${new Date().toISOString()}`);
  
  // 정리 실행
  cleanupOldGuests();
  
  // 통계 업데이트
  updateGuestStats();
  
  console.log('=== Cleanup Complete ===\n');
}

// 스크립트 실행
main();

// 프로세스 종료
db.close();