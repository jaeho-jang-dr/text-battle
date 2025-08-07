import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: 리더보드 조회 (TOP 25)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'elo'; // 'elo' or 'base'
    const category = searchParams.get('category'); // 동물 카테고리 필터

    // 정렬 기준
    const orderColumn = sortBy === 'base' ? 'c.base_score' : 'c.elo_score';

    // 기본 쿼리
    const query = `
      SELECT 
        c.id,
        c.character_name,
        c.base_score,
        c.elo_score,
        c.wins,
        c.losses,
        c.total_active_battles,
        c.total_passive_battles,
        c.created_at,
        c.is_bot,
        a.id as animal_id,
        a.korean_name,
        a.name as english_name,
        a.emoji as icon,
        a.category,
        u.id as user_id,
        u.display_name,
        u.is_guest
      FROM characters c
      JOIN animals a ON c.animal_id = a.id
      JOIN users u ON c.user_id = u.id
      WHERE c.is_active = 1 AND u.is_suspended = 0
      ORDER BY ${orderColumn} DESC
      LIMIT 100
    `;

    const allCharacters = db.prepare(query).all() as any[];

    // 카테고리 필터링 (클라이언트 사이드)
    let characters = allCharacters || [];
    if (category && category !== 'all') {
      characters = characters.filter(char => char.category === category);
    }

    // 순위 계산 및 통계 추가
    const leaderboard = characters.slice(0, 25).map((character, index) => {
      const totalBattles = character.total_active_battles + character.total_passive_battles;
      const winRate = totalBattles > 0 
        ? Math.round((character.wins / totalBattles) * 100) 
        : 0;

      return {
        rank: index + 1,
        id: character.id,
        characterName: character.character_name,
        animalName: character.korean_name || '알 수 없음',
        animalIcon: character.icon || '🐾',
        animalCategory: character.category || 'unknown',
        playerName: character.display_name || '익명',
        isGuest: character.is_guest === 1,
        isBot: character.is_bot === 1,
        baseScore: character.base_score,
        eloScore: character.elo_score,
        wins: character.wins,
        losses: character.losses,
        totalBattles,
        winRate,
        createdAt: character.created_at
      };
    });

    // 전체 통계
    const stats = {
      totalCharacters: allCharacters?.length || 0,
      averageElo: Math.round(
        (allCharacters?.reduce((sum, char) => sum + char.elo_score, 0) || 0) / 
        (allCharacters?.length || 1)
      ),
      highestElo: allCharacters?.[0]?.elo_score || 1500,
      mostPopularAnimal: getMostPopularAnimal(allCharacters || [])
    };

    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        stats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json({
      success: false,
      error: '리더보드를 불러오는 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}

// 가장 인기 있는 동물 찾기
function getMostPopularAnimal(characters: any[]) {
  const animalCounts: Record<string, number> = {};
  
  characters.forEach(char => {
    const animalName = char.korean_name || '알 수 없음';
    animalCounts[animalName] = (animalCounts[animalName] || 0) + 1;
  });

  let mostPopular = { name: '없음', count: 0 };
  Object.entries(animalCounts).forEach(([name, count]) => {
    if (count > mostPopular.count) {
      mostPopular = { name, count };
    }
  });

  return mostPopular;
}