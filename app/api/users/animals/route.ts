import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiResponse, errorResponse, checkAuth, validateRequest, kidLog } from '@/lib/api-helpers';

// 🐾 내 동물 컬렉션 조회 API - 나의 동물 친구들을 만나요!
export async function GET(req: NextRequest) {
  try {
    const auth = checkAuth(req);
    if (!auth) {
      return errorResponse('unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const rarity = searchParams.get('rarity');

    // 사용자의 동물 컬렉션 조회
    let query = supabase
      .from('user_animals')
      .select(`
        *,
        animals (
          id,
          name,
          korean_name,
          category,
          sub_category,
          emoji,
          description,
          kid_description,
          habitat,
          food,
          speciality,
          fun_fact,
          power,
          defense,
          speed,
          intelligence,
          battle_cry,
          rarity
        )
      `)
      .eq('user_id', auth.userId);

    // 필터링 적용
    if (category) {
      query = query.eq('animals.category', category);
    }
    if (rarity) {
      query = query.eq('animals.rarity', rarity);
    }

    // 정렬 옵션
    const validSortOptions = ['created_at', 'level', 'experience', 'battles_won'];
    if (validSortOptions.includes(sortBy)) {
      query = query.order(sortBy, { ascending: order === 'asc' });
    }

    // 페이지네이션
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: userAnimals, error, count } = await supabase
      .from('user_animals')
      .select('*', { count: 'exact' })
      .eq('user_id', auth.userId);

    if (error) {
      console.error('동물 컬렉션 조회 오류:', error);
      return errorResponse('동물 친구들을 불러오는 중 문제가 발생했어요!', 500);
    }

    // 각 동물의 상세 정보 포맷팅
    const formattedAnimals = userAnimals?.map(ua => {
      const totalBattles = ua.battles_won + ua.battles_lost;
      const winRate = totalBattles > 0 
        ? Math.round((ua.battles_won / totalBattles) * 100) 
        : 0;

      // 레벨업까지 필요한 경험치 계산
      const expForNextLevel = calculateExpForLevel(ua.level + 1);
      const currentLevelExp = calculateExpForLevel(ua.level);
      const expProgress = ua.experience - currentLevelExp;
      const expNeeded = expForNextLevel - currentLevelExp;
      const levelProgress = Math.round((expProgress / expNeeded) * 100);

      return {
        id: ua.id,
        animalId: ua.animal_id,
        nickname: ua.nickname || ua.animals?.korean_name,
        level: ua.level,
        experience: ua.experience,
        nextLevelExp: expForNextLevel,
        levelProgress: `${levelProgress}%`,
        stats: {
          battlesWon: ua.battles_won,
          battlesLost: ua.battles_lost,
          totalBattles,
          winRate: `${winRate}%`
        },
        animal: ua.animals,
        collectedAt: ua.created_at,
        powerLevel: calculatePowerLevel(ua.animals, ua.level)
      };
    }) || [];

    // 컬렉션 통계
    const collectionStats = {
      total: count || 0,
      byCategory: {
        current: userAnimals?.filter(ua => ua.animals?.category === 'current').length || 0,
        mythical: userAnimals?.filter(ua => ua.animals?.category === 'mythical').length || 0,
        prehistoric: userAnimals?.filter(ua => ua.animals?.category === 'prehistoric').length || 0,
        custom: userAnimals?.filter(ua => ua.animals?.category === 'custom').length || 0
      },
      byRarity: {
        common: userAnimals?.filter(ua => ua.animals?.rarity === 'common').length || 0,
        rare: userAnimals?.filter(ua => ua.animals?.rarity === 'rare').length || 0,
        epic: userAnimals?.filter(ua => ua.animals?.rarity === 'epic').length || 0,
        legendary: userAnimals?.filter(ua => ua.animals?.rarity === 'legendary').length || 0
      },
      totalLevel: userAnimals?.reduce((sum, ua) => sum + ua.level, 0) || 0,
      totalBattles: userAnimals?.reduce((sum, ua) => sum + ua.battles_won + ua.battles_lost, 0) || 0
    };

    return apiResponse(
      {
        animals: formattedAnimals,
        stats: collectionStats,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        },
        tips: [
          '🌟 동물의 레벨이 올라가면 더 강해져요!',
          '🎯 각 동물마다 특별한 능력이 있어요!',
          '💡 닉네임을 지어주면 더 애착이 생겨요!',
          '🏆 승리하면 경험치를 많이 얻을 수 있어요!'
        ]
      },
      `${count || 0}마리의 동물 친구가 있어요! 🐾`
    );

  } catch (error) {
    console.error('동물 컬렉션 조회 에러:', error);
    return errorResponse('동물 친구들을 불러오는 중 문제가 발생했어요!', 500);
  }
}

// 🎁 새 동물 추가 API - 새로운 동물 친구를 영입해요!
export async function POST(req: NextRequest) {
  try {
    const auth = checkAuth(req);
    if (!auth) {
      return errorResponse('unauthorized', 401);
    }

    const { valid, data, error } = await validateRequest(req, {});
    if (!valid) {
      return errorResponse(error || 'badRequest', 400);
    }

    const { animalId, nickname } = data;

    if (!animalId) {
      return errorResponse('동물을 선택해주세요! 🦁', 400);
    }

    // 동물 정보 확인
    const { data: animal } = await supabase
      .from('animals')
      .select('*')
      .eq('id', animalId)
      .single();

    if (!animal) {
      return errorResponse('존재하지 않는 동물이에요! 🤔', 404);
    }

    // 이미 보유 중인지 확인
    const { data: existing } = await supabase
      .from('user_animals')
      .select('id')
      .eq('user_id', auth.userId)
      .eq('animal_id', animalId)
      .single();

    if (existing) {
      return errorResponse('이미 이 동물 친구가 있어요! 🐾', 400);
    }

    // 닉네임 검증
    if (nickname && (nickname.length < 1 || nickname.length > 20)) {
      return errorResponse('닉네임은 1자 이상 20자 이하로 지어주세요! 📝', 400);
    }

    // 새 동물 추가
    const { data: newUserAnimal, error: insertError } = await supabase
      .from('user_animals')
      .insert([{
        user_id: auth.userId,
        animal_id: animalId,
        nickname: nickname || null,
        level: 1,
        experience: 0,
        battles_won: 0,
        battles_lost: 0
      }])
      .select(`
        *,
        animals (*)
      `)
      .single();

    if (insertError) {
      console.error('동물 추가 오류:', insertError);
      return errorResponse('동물을 추가하는 중 문제가 발생했어요!', 500);
    }

    kidLog('동물 추가', auth.userId, { 
      animalId,
      animalName: animal.korean_name,
      nickname 
    });

    // 희귀도에 따른 축하 메시지
    const celebrationMessages = {
      common: '새로운 친구가 생겼어요! 🎉',
      rare: '희귀한 동물이에요! 정말 운이 좋아요! 🌟',
      epic: '와! 에픽 동물이에요! 대단해요! 🎊',
      legendary: '전설의 동물이에요! 정말 특별해요! 🏆✨'
    };

    return apiResponse(
      {
        userAnimal: newUserAnimal,
        message: celebrationMessages[animal.rarity as keyof typeof celebrationMessages] || '새로운 친구가 생겼어요!',
        animalInfo: {
          name: animal.korean_name,
          emoji: animal.emoji,
          rarity: animal.rarity,
          description: animal.kid_description
        },
        tips: [
          '💪 배틀에서 승리하면 경험치를 얻어요!',
          '🎯 각 동물의 특성을 잘 활용해보세요!',
          '📝 닉네임을 지어주면 더 특별해져요!'
        ]
      },
      `${animal.emoji} ${nickname || animal.korean_name}가(이) 당신의 친구가 되었어요!`,
      201
    );

  } catch (error) {
    console.error('동물 추가 에러:', error);
    return errorResponse('동물을 추가하는 중 문제가 발생했어요!', 500);
  }
}

// 🏷️ 동물 정보 수정 API - 닉네임 변경 등
export async function PUT(req: NextRequest) {
  try {
    const auth = checkAuth(req);
    if (!auth) {
      return errorResponse('unauthorized', 401);
    }

    const { valid, data, error } = await validateRequest(req, {});
    if (!valid) {
      return errorResponse(error || 'badRequest', 400);
    }

    const { userAnimalId, nickname } = data;

    if (!userAnimalId) {
      return errorResponse('수정할 동물을 선택해주세요! 🦁', 400);
    }

    // 소유권 확인
    const { data: userAnimal } = await supabase
      .from('user_animals')
      .select('*, animals(*)')
      .eq('id', userAnimalId)
      .eq('user_id', auth.userId)
      .single();

    if (!userAnimal) {
      return errorResponse('이 동물은 당신의 친구가 아니에요! 🤔', 404);
    }

    // 닉네임 검증
    if (nickname !== undefined) {
      if (nickname && (nickname.length < 1 || nickname.length > 20)) {
        return errorResponse('닉네임은 1자 이상 20자 이하로 지어주세요! 📝', 400);
      }
    }

    // 업데이트
    const { data: updated, error: updateError } = await supabase
      .from('user_animals')
      .update({
        nickname: nickname || null
      })
      .eq('id', userAnimalId)
      .select('*, animals(*)')
      .single();

    if (updateError) {
      console.error('동물 정보 수정 오류:', updateError);
      return errorResponse('동물 정보를 수정하는 중 문제가 발생했어요!', 500);
    }

    kidLog('동물 닉네임 변경', auth.userId, { 
      userAnimalId,
      oldNickname: userAnimal.nickname,
      newNickname: nickname 
    });

    const displayName = nickname || updated.animals.korean_name;
    
    return apiResponse(
      {
        userAnimal: updated,
        message: nickname 
          ? `이제 ${updated.animals.emoji} ${displayName}(이)라고 불러요!`
          : `닉네임을 지워서 원래 이름인 ${displayName}(으)로 돌아갔어요!`,
        tips: [
          '💭 언제든 닉네임을 바꿀 수 있어요!',
          '🎨 창의적인 닉네임을 지어보세요!',
          '💝 애정을 가지고 키우면 더 강해져요!'
        ]
      },
      '동물 정보가 수정되었어요! ✨',
      200
    );

  } catch (error) {
    console.error('동물 정보 수정 에러:', error);
    return errorResponse('동물 정보를 수정하는 중 문제가 발생했어요!', 500);
  }
}

// 레벨별 필요 경험치 계산
function calculateExpForLevel(level: number): number {
  // 레벨이 올라갈수록 필요 경험치 증가
  return level * level * 100;
}

// 동물의 전투력 계산
function calculatePowerLevel(animal: any, level: number): number {
  if (!animal) return 0;
  
  const baseStats = animal.power + animal.defense + animal.speed + animal.intelligence;
  const levelBonus = level * 10;
  const rarityMultiplier = {
    common: 1,
    rare: 1.2,
    epic: 1.5,
    legendary: 2
  };
  
  return Math.round(baseStats * (rarityMultiplier[animal.rarity as keyof typeof rarityMultiplier] || 1) + levelBonus);
}