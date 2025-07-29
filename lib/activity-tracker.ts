import { db } from './db';

export function updateUserActivity(userId: string) {
  try {
    // 사용자의 마지막 로그인 시간 업데이트
    db.prepare(`
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(userId);
  } catch (error) {
    console.error('Activity update error:', error);
  }
}

export function logUserAction(userId: string, action: string, details?: any) {
  try {
    // 사용자 활동 로그 (admin_logs 테이블 활용)
    const logId = Math.random().toString(36).substring(7);
    db.prepare(`
      INSERT INTO admin_logs (id, admin_id, action_type, target_type, details, created_at)
      VALUES (?, ?, ?, 'user_action', ?, CURRENT_TIMESTAMP)
    `).run(logId, userId, action, JSON.stringify(details || {}));
  } catch (error) {
    console.error('Action logging error:', error);
  }
}