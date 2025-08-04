import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

// GET: 배틀 로그 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const adminToken = request.headers.get('X-Admin-Token');
    if (!adminToken) {
      return NextResponse.json({
        success: false,
        error: '관리자 권한이 필요합니다'
      }, { status: 401 });
    }

    // 관리자 토큰 검증
    const admin = await db.prepare(`
      SELECT * FROM admin_users 
      WHERE auth_token = ?
    `).get(adminToken);

    if (!admin) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 관리자 토큰입니다'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    const filterType = searchParams.get('filterType'); // 'all', 'warnings', 'suspended', 'guest'
    const searchTerm = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // 기본 쿼리
    let whereConditions = [];
    let queryParams = [];

    // 필터 적용
    if (filterType === 'warnings') {
      whereConditions.push(`u.warning_count > 0`);
    } else if (filterType === 'suspended') {
      whereConditions.push(`u.is_suspended = 1`);
    } else if (filterType === 'guest') {
      whereConditions.push(`u.is_guest = 1`);
    }

    // 검색어 적용
    if (searchTerm) {
      whereConditions.push(`(
        u.display_name LIKE ? OR 
        u.email LIKE ? OR 
        ac.character_name LIKE ? OR 
        dc.character_name LIKE ? OR
        b.ai_judgment LIKE ?
      )`);
      const searchPattern = `%${searchTerm}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // 날짜 필터
    if (dateFrom) {
      whereConditions.push(`date(b.created_at) >= date(?)`);
      queryParams.push(dateFrom);
    }
    if (dateTo) {
      whereConditions.push(`date(b.created_at) <= date(?)`);
      queryParams.push(dateTo);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // 전체 개수 조회
    const countQuery = `
      SELECT COUNT(DISTINCT b.id) as total
      FROM battles b
      JOIN characters ac ON b.attacker_id = ac.id
      JOIN characters dc ON b.defender_id = dc.id
      JOIN users u ON (ac.user_id = u.id OR dc.user_id = u.id)
      ${whereClause}
    `;
    const totalResult = await db.prepare(countQuery).get(...queryParams);
    const total = totalResult.total;

    // 배틀 로그 조회
    const logsQuery = `
      SELECT 
        b.*,
        ac.character_name as attacker_name,
        ac.battle_text as attacker_battle_text,
        ac.is_bot as attacker_is_bot,
        dc.character_name as defender_name,
        dc.battle_text as defender_battle_text,
        dc.is_bot as defender_is_bot,
        au.id as attacker_user_id,
        au.display_name as attacker_user_name,
        au.email as attacker_email,
        au.is_guest as attacker_is_guest,
        au.warning_count as attacker_warnings,
        au.is_suspended as attacker_suspended,
        du.id as defender_user_id,
        du.display_name as defender_user_name,
        du.email as defender_email,
        du.is_guest as defender_is_guest,
        du.warning_count as defender_warnings,
        du.is_suspended as defender_suspended,
        aa.emoji as attacker_emoji,
        da.emoji as defender_emoji
      FROM battles b
      JOIN characters ac ON b.attacker_id = ac.id
      JOIN characters dc ON b.defender_id = dc.id
      JOIN users au ON ac.user_id = au.id
      JOIN users du ON dc.user_id = du.id
      JOIN animals aa ON ac.animal_id = aa.id
      JOIN animals da ON dc.animal_id = da.id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(limit, offset);
    const logs = await db.prepare(logsQuery).all(...queryParams);

    // 경고 및 문제 사용자 통계
    const problemUsers = await db.prepare(`
      SELECT 
        u.id,
        u.display_name,
        u.email,
        u.is_guest,
        u.warning_count,
        u.is_suspended,
        u.created_at,
        COUNT(DISTINCT c.id) as character_count,
        COUNT(DISTINCT b.id) as battle_count,
        MAX(b.created_at) as last_battle
      FROM users u
      LEFT JOIN characters c ON u.id = c.user_id AND c.is_active = 1
      LEFT JOIN battles b ON (c.id = b.attacker_id OR c.id = b.defender_id)
      WHERE u.warning_count > 0 OR u.is_suspended = 1
      GROUP BY u.id
      ORDER BY u.warning_count DESC, u.is_suspended DESC
      LIMIT 20
    `).all();

    // 게스트 사용자 통계 (24시간 이상 된 게스트)
    const oldGuestUsers = await db.prepare(`
      SELECT 
        COUNT(*) as count,
        MIN(created_at) as oldest,
        MAX(created_at) as newest
      FROM users
      WHERE is_guest = 1 
      AND datetime(created_at) < datetime('now', '-1 day')
    `).get();

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        problemUsers,
        oldGuestUsers,
        filters: {
          filterType,
          searchTerm,
          dateFrom,
          dateTo
        }
      }
    });
  } catch (error) {
    console.error('Battle logs fetch error:', error);
    return NextResponse.json({
      success: false,
      error: '배틀 로그를 불러오는 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}

// DELETE: 문제 사용자 제거 또는 게스트 정리
export async function DELETE(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const adminToken = request.headers.get('X-Admin-Token');
    if (!adminToken) {
      return NextResponse.json({
        success: false,
        error: '관리자 권한이 필요합니다'
      }, { status: 401 });
    }

    const admin = await db.prepare(`
      SELECT * FROM admin_users 
      WHERE auth_token = ?
    `).get(adminToken);

    if (!admin) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 관리자 토큰입니다'
      }, { status: 401 });
    }

    const { action, userId } = await request.json();

    if (action === 'remove-user') {
      // 특정 사용자 제거
      if (!userId) {
        return NextResponse.json({
          success: false,
          error: '사용자 ID가 필요합니다'
        }, { status: 400 });
      }

      // 사용자와 관련 데이터 삭제 (트랜잭션)
      const deleteUser = db.transaction(() => {
        // 배틀 기록은 유지하되, 캐릭터와 사용자 정보만 삭제
        db.prepare(`UPDATE characters SET is_active = 0 WHERE user_id = ?`).run(userId);
        db.prepare(`DELETE FROM warnings WHERE user_id = ?`).run(userId);
        db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);
      });

      deleteUser();

      // 관리자 로그 기록
      await db.prepare(`
        INSERT INTO admin_logs (id, admin_id, action_type, target_type, target_id, details, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        admin.id,
        'remove_user',
        'user',
        userId,
        JSON.stringify({ reason: 'Problematic user removed by admin' })
      );

      return NextResponse.json({
        success: true,
        message: '사용자가 제거되었습니다'
      });

    } else if (action === 'cleanup-guests') {
      // 24시간 이상 된 게스트 계정 정리
      const cleanupGuests = db.transaction(() => {
        // 게스트 사용자들의 ID 목록 가져오기
        const oldGuests = db.prepare(`
          SELECT id FROM users 
          WHERE is_guest = 1 
          AND datetime(created_at) < datetime('now', '-1 day')
        `).all();

        let removedCount = 0;
        for (const guest of oldGuests) {
          // 캐릭터 비활성화
          db.prepare(`UPDATE characters SET is_active = 0 WHERE user_id = ?`).run(guest.id);
          // 사용자 삭제
          db.prepare(`DELETE FROM users WHERE id = ?`).run(guest.id);
          removedCount++;
        }

        return removedCount;
      });

      const removedCount = cleanupGuests();

      // 관리자 로그 기록
      await db.prepare(`
        INSERT INTO admin_logs (id, admin_id, action_type, target_type, details, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `).run(
        'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        admin.id,
        'cleanup_guests',
        'system',
        JSON.stringify({ removed_count: removedCount })
      );

      return NextResponse.json({
        success: true,
        message: `${removedCount}개의 오래된 게스트 계정이 정리되었습니다`
      });
    }

    return NextResponse.json({
      success: false,
      error: '유효하지 않은 작업입니다'
    }, { status: 400 });

  } catch (error) {
    console.error('Admin action error:', error);
    return NextResponse.json({
      success: false,
      error: '작업 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}