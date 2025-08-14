import { NextRequest, NextResponse } from 'next/server';
import { adminOnly } from '@/lib/admin-auth-nextauth';
import { memoryStore } from '@/lib/db/memory-store';

export const GET = adminOnly(async (request: NextRequest) => {
  try {
    
    // 통계 계산
    const totalUsers = memoryStore.users.size;
    const totalCharacters = memoryStore.characters.size;
    const totalBattles = memoryStore.battles.size;
    
    // 활성 플레이어 (최근 24시간 이내 배틀한 사용자)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activePlayers = new Set();
    
    Array.from(memoryStore.battles.values()).forEach(battle => {
      if (battle.createdAt > oneDayAgo) {
        const char1 = memoryStore.characters.get(battle.player1Id);
        const char2 = memoryStore.characters.get(battle.player2Id);
        
        if (char1 && !char1.isNPC) activePlayers.add(char1.userId);
        if (char2 && !char2.isNPC) activePlayers.add(char2.userId);
      }
    });
    
    return NextResponse.json({
      totalUsers,
      totalCharacters,
      totalBattles,
      activePlayers: activePlayers.size
    });
    
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
});