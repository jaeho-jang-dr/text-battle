import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiResponse, errorResponse, checkAuth, validateRequest, kidLog } from '@/lib/api-helpers';
import { animalsData } from '@/data/animals-extended';

// 🦁 동물 목록 조회 API - 모든 동물 친구들을 만나보세요!
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const rarity = searchParams.get('rarity');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 필터링
    let filteredAnimals = [...animalsData];

    if (category) {
      filteredAnimals = filteredAnimals.filter(a => a.category === category);
    }

    if (rarity) {
      filteredAnimals = filteredAnimals.filter(a => a.rarity === rarity);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredAnimals = filteredAnimals.filter(a => 
        a.name.toLowerCase().includes(searchLower) ||
        a.korean_name.includes(search) ||
        a.kid_description.includes(search)
      );
    }

    // 페이지네이션
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAnimals = filteredAnimals.slice(startIndex, endIndex);

    // 통계 정보
    const stats = {
      total: filteredAnimals.length,
      byCategory: {
        current: filteredAnimals.filter(a => a.category === 'current').length,
        mythical: filteredAnimals.filter(a => a.category === 'mythical').length,
        prehistoric: filteredAnimals.filter(a => a.category === 'prehistoric').length,
        custom: filteredAnimals.filter(a => a.category === 'custom').length,
      },
      byRarity: {
        common: filteredAnimals.filter(a => a.rarity === 'common').length,
        rare: filteredAnimals.filter(a => a.rarity === 'rare').length,
        epic: filteredAnimals.filter(a => a.rarity === 'epic').length,
        legendary: filteredAnimals.filter(a => a.rarity === 'legendary').length,
      }
    };

    return apiResponse(
      {
        animals: paginatedAnimals,
        pagination: {
          page,
          limit,
          total: filteredAnimals.length,
          totalPages: Math.ceil(filteredAnimals.length / limit),
          hasNext: endIndex < filteredAnimals.length,
          hasPrev: page > 1
        },
        stats,
        tip: '💡 희귀한 동물일수록 더 특별한 능력을 가지고 있어요!'
      },
      `${filteredAnimals.length}마리의 동물 친구들을 찾았어요! 🎉`
    );

  } catch (error) {
    console.error('동물 목록 조회 에러:', error);
    return errorResponse('동물 친구들을 불러오는 중 문제가 발생했어요!', 500);
  }
}

// 🎨 커스텀 동물 생성 API - 나만의 동물을 만들어요!
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

    const {
      name,
      korean_name,
      emoji,
      description,
      kid_description,
      habitat,
      food,
      speciality,
      fun_fact,
      battle_cry,
      power = 50,
      defense = 50,
      speed = 50,
      intelligence = 50
    } = data;

    // 필수 필드 확인
    if (!name || !korean_name || !emoji || !kid_description) {
      return errorResponse('동물의 기본 정보를 모두 입력해주세요! 📝', 400);
    }

    // 스탯 검증 (0-100)
    const stats = { power, defense, speed, intelligence };
    for (const [stat, value] of Object.entries(stats)) {
      if (value < 0 || value > 100) {
        return errorResponse(`${stat} 능력치는 0에서 100 사이여야 해요! 📊`, 400);
      }
    }

    // 스탯 합계 제한 (너무 강한 동물 방지)
    const totalStats = power + defense + speed + intelligence;
    if (totalStats > 300) {
      return errorResponse('능력치 합계가 너무 높아요! 총합은 300을 넘을 수 없어요 ⚖️', 400);
    }

    // 커스텀 동물 생성
    const { data: newAnimal, error: createError } = await supabase
      .from('animals')
      .insert([{
        name,
        korean_name,
        category: 'custom',
        sub_category: '플레이어 창작',
        emoji,
        description: description || kid_description,
        kid_description,
        habitat: habitat || '상상의 세계',
        food: food || '사랑과 우정',
        speciality: speciality || '특별한 능력',
        fun_fact: fun_fact || '아직 발견 중!',
        power,
        defense,
        speed,
        intelligence,
        battle_cry: battle_cry || `${korean_name}의 힘!`,
        rarity: 'epic', // 커스텀 동물은 기본적으로 에픽
        unlock_level: 1,
        created_by: auth.userId,
        is_approved: false, // 관리자 승인 대기
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      console.error('동물 생성 오류:', createError);
      return errorResponse('동물을 만드는 중 문제가 발생했어요!', 500);
    }

    kidLog('커스텀 동물 생성', auth.userId, { animalName: korean_name });

    return apiResponse(
      {
        animal: newAnimal,
        message: `${emoji} ${korean_name}가 태어났어요!`,
        status: '관리자 승인을 기다리고 있어요 ⏳',
        tips: [
          '✨ 승인되면 다른 친구들도 만날 수 있어요!',
          '🎨 더 창의적인 동물을 만들어보세요!',
          '🏆 특별한 동물은 업적을 받을 수 있어요!'
        ]
      },
      `멋진 동물 ${korean_name}를 만들었어요! 🎨`,
      201
    );

  } catch (error) {
    console.error('커스텀 동물 생성 에러:', error);
    return errorResponse('동물을 만드는 중 문제가 발생했어요!', 500);
  }
}

// 동물 상세 정보는 [id]/route.ts에서 처리