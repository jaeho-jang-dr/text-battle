import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

// 캐릭터 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { characterId: string } }
) {
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

    const characterId = parseInt(params.characterId);
    
    // 캐릭터 소유권 확인
    const character = db.prepare(`
      SELECT user_id FROM characters WHERE id = ?
    `).get(characterId) as { user_id: number } | undefined;

    if (!character) {
      return NextResponse.json(
        { success: false, error: '캐릭터를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (character.user_id !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: '다른 사용자의 캐릭터는 삭제할 수 없습니다' },
        { status: 403 }
      );
    }

    // 캐릭터 삭제
    db.prepare('DELETE FROM characters WHERE id = ?').run(characterId);

    return NextResponse.json({
      success: true,
      message: '캐릭터가 삭제되었습니다'
    });
    
  } catch (error) {
    console.error('Character deletion error:', error);
    return NextResponse.json(
      { success: false, error: '캐릭터 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}