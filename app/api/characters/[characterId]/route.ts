import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

// GET: 캐릭터 상세 정보 조회 (공개)
export async function GET(
  request: NextRequest,
  { params }: { params: { characterId: string } }
) {
  try {
    const characterId = params.characterId;

    // 캐릭터 정보와 동물 정보 함께 조회
    const character = await db.prepare(`
      SELECT 
        c.*,
        a.korean_name,
        a.name as english_name,
        a.emoji,
        a.category,
        a.description,
        a.attack_power,
        a.strength,
        a.speed,
        a.energy
      FROM characters c
      JOIN animals a ON c.animal_id = a.id
      WHERE c.id = ? AND c.is_active = 1
    `).get(characterId);

    if (!character) {
      return NextResponse.json({
        success: false,
        error: '캐릭터를 찾을 수 없습니다'
      }, { status: 404 });
    }

    // 응답 형식에 맞게 데이터 정리
    const characterData = {
      id: character.id,
      characterName: character.character_name,
      battleText: character.battle_text || '',
      baseScore: character.base_score,
      eloScore: character.elo_score,
      wins: character.wins,
      losses: character.losses,
      activeBattlesToday: character.active_battles_today,
      totalActiveBattles: character.total_active_battles,
      totalPassiveBattles: character.total_passive_battles,
      isBot: character.is_bot === 1,
      createdAt: character.created_at,
      animal: {
        id: character.animal_id,
        koreanName: character.korean_name,
        englishName: character.english_name,
        emoji: character.emoji,
        category: character.category,
        description: character.description,
        attack_power: character.attack_power,
        strength: character.strength,
        speed: character.speed,
        energy: character.energy
      }
    };

    return NextResponse.json({
      success: true,
      data: characterData
    });
  } catch (error) {
    console.error('Character fetch error:', error);
    return NextResponse.json({
      success: false,
      error: '캐릭터 정보를 불러오는 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}

// DELETE: 캐릭터 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { characterId: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: '인증이 필요합니다'
      }, { status: 401 });
    }

    // 사용자 확인
    const user = await db.prepare(`
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

    const characterId = params.characterId;

    // 캐릭터 소유권 확인
    const character = await db.prepare(`
      SELECT * FROM characters 
      WHERE id = ? AND user_id = ?
    `).get(characterId, user.id);

    if (!character) {
      return NextResponse.json({
        success: false,
        error: '캐릭터를 찾을 수 없거나 권한이 없습니다'
      }, { status: 404 });
    }

    // 진행 중인 배틀은 없으므로 이 체크는 제거합니다.
    // SQLite 구조상 배틀은 즉시 완료되므로 pending 상태가 없습니다.

    // 소프트 삭제 (is_active를 0으로 설정)
    const result = await db.prepare(`
      UPDATE characters 
      SET is_active = 0, updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).run(characterId, user.id);

    if (result.changes > 0) {
      // 남은 캐릭터 수 확인
      const remainingCharacters = await db.prepare(`
        SELECT COUNT(*) as count FROM characters 
        WHERE user_id = ? AND is_active = 1
      `).get(user.id);

      return NextResponse.json({
        success: true,
        message: '캐릭터가 삭제되었습니다',
        data: {
          deletedCharacterId: characterId,
          remainingCharacters: remainingCharacters.count
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: '캐릭터 삭제에 실패했습니다'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Character delete error:', error);
    return NextResponse.json({
      success: false,
      error: '캐릭터 삭제 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}