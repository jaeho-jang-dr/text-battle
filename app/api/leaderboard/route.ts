import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiResponse, errorResponse, kidLog } from '@/lib/api-helpers';

// 🏆 리더보드 조회 API - 최고의 플레이어들을 만나보세요!
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100'); // 100등까지 표시
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // 리더보드 데이터 조회
    // 사용자별 통계를 계산하여 가져옴
    const { data: leaderboardData, error, count } = await supabase
      .from('users')
      .select(`
        id,
        username,
        avatar,
        created_at,
        user_animals!inner(
          battles_won,
          battles_lost
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: true }) // 임시 정렬
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('리더보드 조회 오류:', error);
      return errorResponse('리더보드를 불러오는 중 문제가 발생했어요! 🤔', 500);
    }

    if (!leaderboardData || leaderboardData.length === 0) {
      return apiResponse(
        {
          leaderboard: [],
          totalCount: 0,
          currentPage: page,
          totalPages: 0,
          message: '아직 랭킹이 없어요! 첫 번째 챔피언이 되어보세요! 🏆'
        },
        '리더보드가 비어있어요!',
        200
      );
    }

    // 각 사용자의 통계 계산
    const leaderboard = leaderboardData.map(user => {
      // 사용자의 모든 동물들의 승패 합계 계산
      const totalWins = user.user_animals.reduce((sum: number, animal: any) => sum + (animal.battles_won || 0), 0);
      const totalLosses = user.user_animals.reduce((sum: number, animal: any) => sum + (animal.battles_lost || 0), 0);
      const totalBattles = totalWins + totalLosses;
      const winRate = totalBattles > 0 ? Math.round((totalWins / totalBattles) * 100) : 0;

      return {
        id: user.id,
        username: user.username,
        avatar: user.avatar || '🦁',
        wins: totalWins,
        losses: totalLosses,
        totalBattles,
        winRate
      };
    })
    // 승리 수와 승률로 정렬 (승리가 많은 순, 같으면 승률이 높은 순)
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.winRate - a.winRate;
    })
    // 요청한 수만큼 선택 (limit)
    .slice(0, limit);

    // 순위별 응원 메시지
    const getRankMessage = (rank: number): string => {
      if (rank === 1) return '🥇 최고의 챔피언이에요!';
      if (rank === 2) return '🥈 정말 대단해요!';
      if (rank === 3) return '🥉 멋진 실력이에요!';
      if (rank <= 10) return '🌟 TOP 10 플레이어!';
      return '💪 계속 노력하면 1등이 될 수 있어요!';
    };

    // 순위 추가
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      rankMessage: getRankMessage(index + 1)
    }));

    kidLog('리더보드 조회', 'anonymous', { 
      page, 
      limit,
      totalEntries: leaderboard.length 
    });

    // 재미있는 통계 추가
    const funStats = {
      totalPlayers: count || 0,
      totalBattlesPlayed: leaderboard.reduce((sum, entry) => sum + entry.totalBattles, 0),
      averageWinRate: Math.round(
        leaderboard.reduce((sum, entry) => sum + entry.winRate, 0) / (leaderboard.length || 1)
      ),
      topPlayerWins: leaderboard[0]?.wins || 0
    };

    return apiResponse(
      {
        leaderboard: rankedLeaderboard,
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        funStats,
        tips: [
          '🎮 매일 연습하면 실력이 늘어요!',
          '📝 창의적인 텍스트를 써보세요!',
          '🦁 다양한 동물 친구들과 함께해요!',
          '💡 전략적으로 생각해보세요!'
        ]
      },
      '리더보드를 불러왔어요! 🏆',
      200
    );

  } catch (error) {
    console.error('리더보드 API 에러:', error);
    return errorResponse('리더보드를 불러오는 중 문제가 발생했어요! 😢', 500);
  }
}

// 🎯 특정 사용자의 순위 조회 API
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return errorResponse('사용자 정보가 필요해요! 🤔', 400);
    }

    // 전체 사용자 통계 조회
    const { data: allUsers, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        avatar,
        user_animals(
          battles_won,
          battles_lost
        )
      `);

    if (error) {
      console.error('사용자 순위 조회 오류:', error);
      return errorResponse('순위를 확인하는 중 문제가 발생했어요! 🤔', 500);
    }

    // 각 사용자의 통계 계산 및 정렬
    const rankings = allUsers?.map(user => {
      const totalWins = user.user_animals.reduce((sum: number, animal: any) => sum + (animal.battles_won || 0), 0);
      const totalLosses = user.user_animals.reduce((sum: number, animal: any) => sum + (animal.battles_lost || 0), 0);
      const totalBattles = totalWins + totalLosses;
      const winRate = totalBattles > 0 ? Math.round((totalWins / totalBattles) * 100) : 0;

      return {
        id: user.id,
        username: user.username,
        wins: totalWins,
        losses: totalLosses,
        totalBattles,
        winRate
      };
    })
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.winRate - a.winRate;
    }) || [];

    // 사용자의 순위 찾기
    const userRank = rankings.findIndex(user => user.id === userId) + 1;
    const userData = rankings.find(user => user.id === userId);

    if (!userData || userRank === 0) {
      return apiResponse(
        {
          rank: null,
          totalPlayers: rankings.length,
          message: '아직 배틀을 하지 않았어요! 첫 배틀을 시작해보세요! 🎮'
        },
        '순위 정보가 없어요!',
        200
      );
    }

    // 순위별 격려 메시지
    let encouragement = '';
    if (userRank === 1) {
      encouragement = '🏆 와! 당신이 최고의 챔피언이에요!';
    } else if (userRank <= 3) {
      encouragement = '🎉 TOP 3에 들었어요! 정말 대단해요!';
    } else if (userRank <= 10) {
      encouragement = '⭐ TOP 10 플레이어! 멋져요!';
    } else if (userRank <= 25) {
      encouragement = '💪 TOP 25 안에 들었어요! 잘하고 있어요!';
    } else if (userRank <= 50) {
      encouragement = '✨ TOP 50 플레이어! 조금만 더 하면 TOP 25에요!';
    } else if (userRank <= 100) {
      encouragement = '🎈 TOP 100 안에 들었어요! 계속 노력해요!';
    } else {
      encouragement = '🌟 계속 노력하면 꼭 1등이 될 거예요!';
    }

    return apiResponse(
      {
        rank: userRank,
        totalPlayers: rankings.length,
        userData,
        encouragement,
        ranksToNext: userRank > 1 ? {
          toTop10: Math.max(0, userRank - 10),
          toTop3: Math.max(0, userRank - 3),
          toFirst: userRank - 1
        } : null
      },
      `현재 ${userRank}등이에요! ${encouragement}`,
      200
    );

  } catch (error) {
    console.error('사용자 순위 조회 에러:', error);
    return errorResponse('순위를 확인하는 중 문제가 발생했어요! 😢', 500);
  }
}