import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { filterBattleText } from '@/lib/filters/content-filter';
import { logUserAction } from '@/lib/activity-tracker';

export async function PATCH(
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

    // 캐릭터 소유권 확인
    const character = await db.prepare(`
      SELECT * FROM characters 
      WHERE id = ? AND user_id = ? AND is_active = 1
    `).get(params.characterId, user.id);

    if (!character) {
      return NextResponse.json({
        success: false,
        error: '캐릭터를 찾을 수 없거나 권한이 없습니다'
      }, { status: 404 });
    }

    const { battleText } = await request.json();

    // 배틀 텍스트 검증
    if (!battleText || battleText.length < 10 || battleText.length > 100) {
      return NextResponse.json({
        success: false,
        error: '배틀 텍스트는 10자 이상 100자 이하로 작성해주세요'
      }, { status: 400 });
    }

    // 콘텐츠 필터링
    const textFilter = filterBattleText(battleText);
    if (!textFilter.isClean) {
      // 경고 처리
      const warningStmt = await db.prepare(`
        INSERT INTO warnings (id, user_id, warning_type, content, character_id)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      const warningId = `warn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      warningStmt.run(
        warningId,
        user.id,
        textFilter.warningType || 'inappropriate_content',
        battleText,
        params.characterId
      );

      // 사용자 경고 카운트 증가
      await db.prepare(`
        UPDATE users 
        SET warning_count = warning_count + 1 
        WHERE id = ?
      `).run(user.id);

      // 3회 경고 시 정지
      const updatedUser = await db.prepare('SELECT warning_count FROM users WHERE id = ?').get(user.id);
      if (updatedUser.warning_count >= 3) {
        await db.prepare(`
          UPDATE users 
          SET is_suspended = 1, 
              suspended_reason = '부적절한 내용 작성으로 인한 자동 정지' 
          WHERE id = ?
        `).run(user.id);
      }

      return NextResponse.json({
        success: false,
        error: textFilter.violations[0]
      }, { status: 400 });
    }

    // 배틀 텍스트 업데이트
    const updateStmt = await db.prepare(`
      UPDATE characters 
      SET battle_text = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    updateStmt.run(battleText, params.characterId);

    // 로그 기록
    await logUserAction(user.id, 'battle_text_updated', {
      characterId: params.characterId,
      characterName: character.character_name,
      oldText: character.battle_text,
      newText: battleText
    });

    return NextResponse.json({
      success: true,
      data: {
        characterId: params.characterId,
        battleText: battleText
      }
    });

  } catch (error) {
    console.error('Battle text update error:', error);
    return NextResponse.json({
      success: false,
      error: '배틀 텍스트 수정 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}