import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { filterCharacterName, filterBattleText } from '@/lib/filters/content-filter';
import { logUserAction } from '@/lib/activity-tracker';
import { v4 as uuidv4 } from 'uuid';

// GET: 사용자의 캐릭터 목록 조회
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const excludeUserId = searchParams.get('excludeUserId');

    // 공개 프로필 조회 (userId 제공 시)
    if (userId) {
      const characters = db.prepare(`
        SELECT 
          c.*,
          a.id as animal_id,
          a.name as animal_name,
          a.korean_name,
          a.emoji,
          a.category,
          a.description
        FROM characters c
        JOIN animals a ON c.animal_id = a.id
        WHERE c.user_id = ? AND c.is_active = 1
        ORDER BY c.created_at ASC
      `).all(userId);

      const formattedCharacters = characters.map((char: any) => ({
        ...char,
        baseScore: char.base_score || 1000,
        wins: char.wins || 0,
        losses: char.losses || 0,
        animal: {
          id: char.animal_id,
          name: char.animal_name,
          koreanName: char.korean_name,
          emoji: char.emoji,
          category: char.category,
          description: char.description
        },
        activeBattlesToday: char.active_battles_today || 0
      }));

      return NextResponse.json({
        success: true,
        data: formattedCharacters
      });
    }

    // 대전 상대 찾기 (excludeUserId 제공 시)
    if (excludeUserId) {
      const opponents = db.prepare(`
        SELECT 
          c.*,
          a.id as animal_id,
          a.name as animal_name,
          a.korean_name,
          a.emoji,
          a.category,
          u.display_name as owner_name
        FROM characters c
        JOIN animals a ON c.animal_id = a.id
        JOIN users u ON c.user_id = u.id
        WHERE c.user_id != ? 
        AND c.is_active = 1
        AND u.is_suspended = 0
        ORDER BY c.base_score DESC
        LIMIT 20
      `).all(excludeUserId);

      const formattedOpponents = opponents.map((char: any) => ({
        ...char,
        baseScore: char.base_score || 1000,
        wins: char.wins || 0,
        losses: char.losses || 0,
        animal: {
          id: char.animal_id,
          name: char.animal_name,
          koreanName: char.korean_name,
          emoji: char.emoji,
          category: char.category
        },
        ownerName: char.owner_name
      }));

      return NextResponse.json({
        success: true,
        data: formattedOpponents
      });
    }

    // 자신의 캐릭터 조회 (토큰 필요)
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
    `).get(token);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 토큰입니다'
      }, { status: 401 });
    }

    // 사용자의 모든 캐릭터 조회 (배틀 텍스트 포함)
    const characters = db.prepare(`
      SELECT 
        c.*,
        a.id as animal_id,
        a.name as animal_name,
        a.korean_name,
        a.emoji,
        a.category,
        a.description
      FROM characters c
      JOIN animals a ON c.animal_id = a.id
      WHERE c.user_id = ? AND c.is_active = 1
      ORDER BY c.created_at ASC
    `).all(user.id);

    // 각 캐릭터의 오늘 배틀 횟수 확인
    const charactersWithStatus = characters.map((char: any) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastReset = new Date(char.last_battle_reset);
      lastReset.setHours(0, 0, 0, 0);
      
      // 새로운 날이면 카운터가 리셋됨
      const todayBattles = lastReset < today ? 0 : char.active_battles_today;
      const canBattleToday = todayBattles < 10;
      
      return {
        ...char,
        baseScore: char.base_score || 1000,
        wins: char.wins || 0,
        losses: char.losses || 0,
        animal: {
          id: char.animal_id,
          name: char.animal_name,
          koreanName: char.korean_name,
          emoji: char.emoji,
          category: char.category,
          description: char.description
        },
        activeBattlesToday: char.active_battles_today || 0,
        todayBattles,
        canBattleToday,
        remainingBattles: Math.max(0, 10 - todayBattles)
      };
    });

    return NextResponse.json({
      success: true,
      data: charactersWithStatus
    });
  } catch (error) {
    console.error('Characters fetch error:', error);
    return NextResponse.json({
      success: false,
      error: '캐릭터 목록을 불러오는 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    `).get(token);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 토큰입니다'
      }, { status: 401 });
    }

    // 정지된 계정 확인
    if (user.is_suspended) {
      return NextResponse.json({
        success: false,
        error: '계정이 정지되었습니다'
      }, { status: 403 });
    }

    const { animalId, characterName, battleText } = await request.json();

    // 캐릭터 이름 필터링
    const nameFilter = filterCharacterName(characterName);
    if (!nameFilter.isClean) {
      // 경고 기록
      await recordWarning(user.id, 'character_name', characterName, nameFilter.warningType);
      
      return NextResponse.json({
        success: false,
        error: nameFilter.violations[0]
      }, { status: 400 });
    }

    // 배틀 텍스트 필터링
    const textFilter = filterBattleText(battleText);
    if (!textFilter.isClean) {
      // 경고 기록
      await recordWarning(user.id, 'battle_text', battleText, textFilter.warningType);
      
      return NextResponse.json({
        success: false,
        error: textFilter.violations[0]
      }, { status: 400 });
    }

    // 캐릭터 수 확인
    const charCount = db.prepare(
      'SELECT COUNT(*) as count FROM characters WHERE user_id = ? AND is_active = 1'
    ).get(user.id) as { count: number };

    if (charCount.count >= 3) {
      return NextResponse.json({
        success: false,
        error: '캐릭터는 최대 3개까지만 만들 수 있습니다'
      }, { status: 400 });
    }

    // 캐릭터 생성
    const characterId = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO characters (
        id, user_id, animal_id, character_name, battle_text
      ) VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(characterId, user.id, animalId, characterName, battleText);
    
    // 로그 기록
    logUserAction(user.id, 'character_created', {
      characterId,
      characterName,
      animalId
    });

    // 생성된 캐릭터 조회
    const character = db.prepare(`
      SELECT c.*, a.*,
        c.id as id, c.character_name,
        a.id as animal_id, a.name as animal_name
      FROM characters c
      JOIN animals a ON c.animal_id = a.id
      WHERE c.id = ?
    `).get(characterId);

    // 동물 데이터 구조 정리
    character.animal = {
      id: character.animal_id,
      name: character.animal_name,
      koreanName: character.korean_name,
      emoji: character.emoji,
      category: character.category
    };
    character.activeBattlesToday = character.active_battles_today;

    return NextResponse.json({
      success: true,
      data: character
    });
  } catch (error) {
    console.error('Character creation error:', error);
    return NextResponse.json({
      success: false,
      error: '캐릭터 생성 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}

// 경고 기록 함수
async function recordWarning(userId: string, type: string, content: string, warningType?: string) {
  try {
    // 경고 추가
    const warningId = uuidv4();
    db.prepare(`
      INSERT INTO warnings (id, user_id, warning_type, content)
      VALUES (?, ?, ?, ?)
    `).run(warningId, userId, warningType || type, content);

    // 경고 횟수 확인
    const warningCount = db.prepare(
      'SELECT COUNT(*) as count FROM warnings WHERE user_id = ?'
    ).get(userId) as { count: number };

    // 3회 이상이면 계정 정지
    if (warningCount.count >= 3) {
      db.prepare(`
        UPDATE users 
        SET warning_count = ?, is_suspended = 1, suspended_reason = ?
        WHERE id = ?
      `).run(
        warningCount.count,
        `부적절한 내용 반복 사용 (경고 ${warningCount.count}회)`,
        userId
      );

      // 관리자 로그 기록
      const logId = uuidv4();
      db.prepare(`
        INSERT INTO admin_logs (id, action_type, target_type, target_id, details)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        logId,
        'auto_suspension',
        'user',
        userId,
        JSON.stringify({
          warning_count: warningCount.count,
          last_violation: content
        })
      );
    } else {
      // 경고 횟수만 업데이트
      db.prepare(
        'UPDATE users SET warning_count = ? WHERE id = ?'
      ).run(warningCount.count, userId);
    }
  } catch (error) {
    console.error('Warning record error:', error);
  }
}