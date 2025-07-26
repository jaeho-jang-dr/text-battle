import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiResponse, errorResponse, checkAuth, validateRequest, kidLog } from '@/lib/api-helpers';

// ⚔️ 배틀 생성 API - 신나는 배틀을 시작해요!
export async function POST(req: NextRequest) {
  try {
    // 인증 확인
    const auth = checkAuth(req);
    if (!auth) {
      return errorResponse('unauthorized', 401);
    }

    const { valid, data, error } = await validateRequest(req, {});
    if (!valid) {
      return errorResponse(error || 'badRequest', 400);
    }

    const { opponentId, playerAnimalId, battleText } = data;

    // 입력 검증
    if (!opponentId || !playerAnimalId || !battleText) {
      return errorResponse('배틀에 필요한 정보를 모두 입력해주세요! 📝', 400);
    }

    // 배틀 텍스트 길이 검증 (200자 제한)
    if (battleText.length > 200) {
      return errorResponse('배틀 텍스트는 200자까지만 쓸 수 있어요! ✏️', 400);
    }

    // 부적절한 단어 필터링
    const badWords = ['욕설', '나쁜말']; // 실제로는 더 많은 단어 리스트
    const hasBadWord = badWords.some(word => battleText.includes(word));
    if (hasBadWord) {
      return errorResponse('친구를 아프게 하는 말은 사용할 수 없어요! 😢', 400);
    }

    // 플레이어 동물 확인
    const { data: playerAnimal } = await supabase
      .from('user_animals')
      .select('*, animals(*)')
      .eq('id', playerAnimalId)
      .eq('user_id', auth.userId)
      .single();

    if (!playerAnimal) {
      return errorResponse('이 동물은 당신의 친구가 아니에요! 🦁', 404);
    }

    // 상대방 정보 확인
    const { data: opponent } = await supabase
      .from('users')
      .select('*')
      .eq('id', opponentId)
      .single();

    if (!opponent) {
      return errorResponse('상대를 찾을 수 없어요! 👻', 404);
    }

    // 상대방 동물 랜덤 선택
    const { data: opponentAnimals } = await supabase
      .from('user_animals')
      .select('*, animals(*)')
      .eq('user_id', opponentId);

    if (!opponentAnimals || opponentAnimals.length === 0) {
      return errorResponse('상대방이 동물을 가지고 있지 않아요! 🐾', 404);
    }

    const opponentAnimal = opponentAnimals[Math.floor(Math.random() * opponentAnimals.length)];

    // 배틀 로직 실행 (지능 스탯 포함!)
    const battleResult = calculateBattle(
      playerAnimal.animals,
      opponentAnimal.animals,
      battleText
    );

    // 배틀 기록 저장
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .insert([{
        player1_id: auth.userId,
        player2_id: opponentId,
        player1_animal_id: playerAnimal.animal_id,
        player2_animal_id: opponentAnimal.animal_id,
        winner_id: battleResult.winnerId,
        battle_log: battleResult.log,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (battleError) {
      console.error('배틀 기록 오류:', battleError);
    }

    // 동물 경험치 및 승패 업데이트
    const isPlayerWinner = battleResult.winnerId === auth.userId;
    
    await supabase
      .from('user_animals')
      .update({
        experience: playerAnimal.experience + (isPlayerWinner ? 50 : 20),
        battles_won: playerAnimal.battles_won + (isPlayerWinner ? 1 : 0),
        battles_lost: playerAnimal.battles_lost + (isPlayerWinner ? 0 : 1),
      })
      .eq('id', playerAnimalId);

    // 상대 동물도 업데이트
    await supabase
      .from('user_animals')
      .update({
        experience: opponentAnimal.experience + (isPlayerWinner ? 20 : 50),
        battles_won: opponentAnimal.battles_won + (isPlayerWinner ? 0 : 1),
        battles_lost: opponentAnimal.battles_lost + (isPlayerWinner ? 1 : 0),
      })
      .eq('id', opponentAnimal.id);

    kidLog('배틀 완료', auth.userId, { 
      battleId: battle?.id, 
      won: isPlayerWinner,
      opponent: opponent.username 
    });

    // 응답 메시지 생성
    const resultMessage = isPlayerWinner
      ? `🎉 축하해요! ${playerAnimal.animals.korean_name}가 승리했어요!`
      : `😢 아쉬워요! 다음엔 꼭 이길 거예요!`;

    const encouragement = isPlayerWinner
      ? ['대단해요!', '멋진 승리예요!', '최고예요!'][Math.floor(Math.random() * 3)]
      : ['괜찮아요!', '다음엔 더 잘할 거예요!', '포기하지 마세요!'][Math.floor(Math.random() * 3)];

    return apiResponse(
      {
        battle: {
          id: battle?.id,
          result: isPlayerWinner ? 'victory' : 'defeat',
          playerAnimal: {
            name: playerAnimal.animals.korean_name,
            emoji: playerAnimal.animals.emoji,
            expGained: isPlayerWinner ? 50 : 20
          },
          opponentAnimal: {
            name: opponentAnimal.animals.korean_name,
            emoji: opponentAnimal.animals.emoji
          },
          battleLog: battleResult.log,
          stats: battleResult.stats
        },
        message: resultMessage,
        encouragement,
        tips: [
          '💡 텍스트가 길고 창의적일수록 좋아요!',
          '🧠 지능이 높은 동물은 더 똑똑한 전략을 써요!',
          '⚡ 속도가 빠른 동물은 먼저 공격해요!',
          '🛡️ 방어력이 높으면 데미지를 적게 받아요!'
        ]
      },
      `배틀 완료! ${encouragement}`,
      201
    );

  } catch (error) {
    console.error('배틀 생성 에러:', error);
    return errorResponse('배틀 중 문제가 발생했어요!', 500);
  }
}

// 배틀 계산 로직 (지능 스탯 추가!)
function calculateBattle(playerAnimal: any, opponentAnimal: any, battleText: string) {
  const log = [];
  
  // 텍스트 점수 계산 (창의성, 길이 등)
  const textScore = Math.min(battleText.length / 2, 100); // 최대 100점
  const creativityBonus = (new Set(battleText.split('')).size / battleText.length) * 50; // 다양한 글자 사용 보너스
  
  // 스탯 기반 점수
  const playerStats = {
    power: playerAnimal.power + (textScore * 0.3),
    defense: playerAnimal.defense,
    speed: playerAnimal.speed,
    intelligence: playerAnimal.intelligence + creativityBonus
  };
  
  const opponentStats = {
    power: opponentAnimal.power,
    defense: opponentAnimal.defense,
    speed: opponentAnimal.speed,
    intelligence: opponentAnimal.intelligence
  };

  log.push({
    type: 'start',
    message: `${playerAnimal.emoji} ${playerAnimal.korean_name} VS ${opponentAnimal.emoji} ${opponentAnimal.korean_name}`,
    emoji: '⚔️'
  });

  // 속도 비교 - 누가 먼저 공격할지
  const playerFirst = playerStats.speed >= opponentStats.speed;
  
  // 지능 기반 전략 보너스
  const playerStrategyBonus = playerStats.intelligence * 0.2;
  const opponentStrategyBonus = opponentStats.intelligence * 0.2;

  // 데미지 계산
  let playerHP = 100 + playerStats.defense;
  let opponentHP = 100 + opponentStats.defense;

  // 첫 번째 공격
  if (playerFirst) {
    const damage = Math.max(10, playerStats.power + playerStrategyBonus - opponentStats.defense * 0.5);
    opponentHP -= damage;
    log.push({
      type: 'attack',
      attacker: playerAnimal.korean_name,
      damage: Math.round(damage),
      message: `${playerAnimal.korean_name}의 선제공격! ${Math.round(damage)}의 데미지!`,
      emoji: '💥'
    });
  } else {
    const damage = Math.max(10, opponentStats.power + opponentStrategyBonus - playerStats.defense * 0.5);
    playerHP -= damage;
    log.push({
      type: 'attack',
      attacker: opponentAnimal.korean_name,
      damage: Math.round(damage),
      message: `${opponentAnimal.korean_name}의 선제공격! ${Math.round(damage)}의 데미지!`,
      emoji: '💥'
    });
  }

  // 지능 기반 특수 공격
  if (playerStats.intelligence > 80) {
    const specialDamage = playerStats.intelligence * 0.5;
    opponentHP -= specialDamage;
    log.push({
      type: 'special',
      message: `${playerAnimal.korean_name}의 지능적인 전략! 추가 ${Math.round(specialDamage)} 데미지!`,
      emoji: '🧠'
    });
  }

  // 최종 HP 비교
  const playerWins = playerHP > opponentHP;
  
  log.push({
    type: 'result',
    message: playerWins 
      ? `${playerAnimal.korean_name}의 승리!` 
      : `${opponentAnimal.korean_name}의 승리!`,
    emoji: playerWins ? '🏆' : '😢'
  });

  return {
    winnerId: playerWins ? 'player' : 'opponent', // 실제로는 user ID를 반환
    log,
    stats: {
      playerFinalHP: Math.max(0, Math.round(playerHP)),
      opponentFinalHP: Math.max(0, Math.round(opponentHP)),
      textScore: Math.round(textScore),
      creativityBonus: Math.round(creativityBonus)
    }
  };
}

// 배틀 히스토리 조회 API
export async function GET(req: NextRequest) {
  try {
    const auth = checkAuth(req);
    if (!auth) {
      return errorResponse('unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // 사용자의 배틀 기록 조회
    const { data: battles, error, count } = await supabase
      .from('battles')
      .select(`
        *,
        player1:users!player1_id(username, avatar),
        player2:users!player2_id(username, avatar),
        player1_animal:animals!player1_animal_id(name, korean_name, emoji),
        player2_animal:animals!player2_animal_id(name, korean_name, emoji)
      `, { count: 'exact' })
      .or(`player1_id.eq.${auth.userId},player2_id.eq.${auth.userId}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('배틀 조회 오류:', error);
      return errorResponse('배틀 기록을 불러오는 중 문제가 발생했어요!', 500);
    }

    // 승률 계산
    const totalBattles = count || 0;
    const wins = battles?.filter(b => b.winner_id === auth.userId).length || 0;
    const winRate = totalBattles > 0 ? (wins / totalBattles * 100).toFixed(1) : 0;

    return apiResponse(
      {
        battles: battles?.map(battle => ({
          id: battle.id,
          date: battle.created_at,
          isWinner: battle.winner_id === auth.userId,
          myAnimal: battle.player1_id === auth.userId 
            ? battle.player1_animal 
            : battle.player2_animal,
          opponentAnimal: battle.player1_id === auth.userId 
            ? battle.player2_animal 
            : battle.player1_animal,
          opponent: battle.player1_id === auth.userId 
            ? battle.player2 
            : battle.player1,
        })),
        stats: {
          total: totalBattles,
          wins,
          losses: totalBattles - wins,
          winRate: `${winRate}%`
        },
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      },
      `${totalBattles}개의 배틀 기록을 찾았어요! 승률: ${winRate}% 🏆`
    );

  } catch (error) {
    console.error('배틀 히스토리 조회 에러:', error);
    return errorResponse('배틀 기록을 불러오는 중 문제가 발생했어요!', 500);
  }
}