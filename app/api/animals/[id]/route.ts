import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiResponse, errorResponse } from '@/lib/api-helpers';
import { animalsData } from '@/data/animals-extended';

// 🦁 특정 동물 상세 정보 조회
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const animalId = parseInt(params.id);
    
    // 먼저 로컬 데이터에서 찾기
    const localAnimal = animalsData.find(a => a.unlock_level === animalId);
    
    if (localAnimal) {
      return apiResponse(
        {
          animal: { ...localAnimal, id: animalId },
          tips: [
            `💡 ${localAnimal.korean_name}의 특기: ${localAnimal.speciality}`,
            `🏠 서식지: ${localAnimal.habitat}`,
            `🍎 좋아하는 음식: ${localAnimal.food}`,
            `📚 재미있는 사실: ${localAnimal.fun_fact}`
          ]
        },
        `${localAnimal.emoji} ${localAnimal.korean_name}의 정보예요!`
      );
    }

    // 데이터베이스에서 찾기 (커스텀 동물 등)
    const { data: dbAnimal, error } = await supabase
      .from('animals')
      .select('*')
      .eq('id', animalId)
      .single();

    if (error || !dbAnimal) {
      return errorResponse('이 동물을 찾을 수 없어요! 🔍', 404);
    }

    return apiResponse(
      {
        animal: dbAnimal,
        tips: [
          `💡 ${dbAnimal.korean_name}의 특기: ${dbAnimal.speciality}`,
          `🏠 서식지: ${dbAnimal.habitat}`,
          `🍎 좋아하는 음식: ${dbAnimal.food}`,
          `📚 재미있는 사실: ${dbAnimal.fun_fact}`
        ],
        creator: dbAnimal.created_by ? '플레이어가 만든 특별한 동물이에요! 🎨' : undefined
      },
      `${dbAnimal.emoji} ${dbAnimal.korean_name}의 정보예요!`
    );

  } catch (error) {
    console.error('동물 상세 조회 에러:', error);
    return errorResponse('동물 정보를 불러오는 중 문제가 발생했어요!', 500);
  }
}