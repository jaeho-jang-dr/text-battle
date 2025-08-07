import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 토큰입니다' },
        { status: 401 }
      );
    }

    // URL 파라미터에서 characterId 가져오기
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');
    
    if (!characterId) {
      return NextResponse.json(
        { success: false, error: '캐릭터 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // 캐릭터 소유권 확인
    const character = db.prepare(`
      SELECT user_id FROM characters WHERE id = ?
    `).get(parseInt(characterId)) as { user_id: number } | undefined;

    if (!character) {
      return NextResponse.json(
        { success: false, error: '캐릭터를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (character.user_id !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: '다른 사용자의 캐릭터 히스토리는 볼 수 없습니다' },
        { status: 403 }
      );
    }

    // 배틀 히스토리 조회
    const battles = db.prepare(`
      SELECT 
        b.*,
        ac.character_name as attacker_name,
        ac.animal_id as attacker_animal_id,
        aa.emoji as attacker_emoji,
        aa.korean_name as attacker_animal_name,
        dc.character_name as defender_name,
        dc.animal_id as defender_animal_id,
        da.emoji as defender_emoji,
        da.korean_name as defender_animal_name
      FROM battles b
      JOIN characters ac ON b.attacker_id = ac.id
      JOIN animals aa ON ac.animal_id = aa.id
      JOIN characters dc ON b.defender_id = dc.id
      JOIN animals da ON dc.animal_id = da.id
      WHERE b.attacker_id = ? OR b.defender_id = ?
      ORDER BY b.created_at DESC
      LIMIT 50
    `).all(parseInt(characterId), parseInt(characterId)) as any[];

    // 결과 포맷팅
    const formattedBattles = battles.map(battle => {
      const isAttacker = battle.attacker_id === parseInt(characterId);
      const won = (isAttacker && battle.winner === 'attacker') || (!isAttacker && battle.winner === 'defender');
      
      return {
        id: battle.id,
        isAttacker,
        won,
        myCharacter: {
          name: isAttacker ? battle.attacker_name : battle.defender_name,
          emoji: isAttacker ? battle.attacker_emoji : battle.defender_emoji,
          animalName: isAttacker ? battle.attacker_animal_name : battle.defender_animal_name,
          scoreChange: isAttacker ? battle.attacker_score_change : battle.defender_score_change
        },
        opponent: {
          name: isAttacker ? battle.defender_name : battle.attacker_name,
          emoji: isAttacker ? battle.defender_emoji : battle.attacker_emoji,
          animalName: isAttacker ? battle.defender_animal_name : battle.attacker_animal_name,
          scoreChange: isAttacker ? battle.defender_score_change : battle.attacker_score_change
        },
        judgment: battle.judgment,
        reasoning: battle.reasoning,
        encouragement: battle.encouragement,
        createdAt: battle.created_at
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedBattles
    });
    
  } catch (error) {
    console.error('Battle history error:', error);
    return NextResponse.json(
      { success: false, error: '배틀 히스토리 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}