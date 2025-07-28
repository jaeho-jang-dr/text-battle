import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 테스트용 엔드포인트 - 샘플 데이터 생성
export async function POST() {
  try {
    // 이미 샘플 데이터가 있는지 확인
    const { data: existingSample } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'sample1@kidtextbattle.com')
      .single();

    if (existingSample) {
      return NextResponse.json({
        success: false,
        message: '샘플 데이터가 이미 존재합니다'
      });
    }

    // 샘플 사용자 생성
    const sampleUsers = [
      { email: 'sample1@kidtextbattle.com', is_guest: false, display_name: '용감한사자' },
      { email: 'sample2@kidtextbattle.com', is_guest: false, display_name: '날쌘독수리' },
      { email: 'sample3@kidtextbattle.com', is_guest: false, display_name: '지혜로운부엉이' },
      { email: 'sample4@kidtextbattle.com', is_guest: false, display_name: '강력한곰' },
      { email: 'sample5@kidtextbattle.com', is_guest: false, display_name: '빠른치타' }
    ];

    const { data: users, error: userError } = await supabase
      .from('users')
      .insert(sampleUsers)
      .select();

    if (userError) throw userError;

    // 샘플 캐릭터 생성
    const sampleCharacters = [
      {
        user_id: users[0].id,
        animal_id: 1, // 사자
        character_name: '황금갈기',
        battle_text: '나는 정글의 왕! 용감하고 강력한 사자다. 모든 동물들이 나를 존경한다. 내 포효 소리는 온 초원을 울린다!',
        base_score: 2850,
        elo_score: 1820,
        wins: 45,
        losses: 5
      },
      {
        user_id: users[1].id,
        animal_id: 6, // 유니콘
        character_name: '무지개뿔',
        battle_text: '마법의 숲에서 온 신비로운 유니콘! 내 뿔은 무지개빛으로 빛나고 치유의 힘을 가지고 있어. 순수한 마음만이 나를 볼 수 있지!',
        base_score: 2600,
        elo_score: 1750,
        wins: 38,
        losses: 7
      },
      {
        user_id: users[2].id,
        animal_id: 11, // 티라노사우루스
        character_name: '다이노킹',
        battle_text: '백악기 최강의 포식자! 거대한 이빨과 강력한 턱으로 모든 것을 부순다. 나는 공룡의 왕이다! 라오오오어!',
        base_score: 2400,
        elo_score: 1680,
        wins: 32,
        losses: 8
      },
      {
        user_id: users[3].id,
        animal_id: 7, // 드래곤
        character_name: '불꽃날개',
        battle_text: '하늘을 지배하는 전설의 드래곤! 내 입에서 나오는 불꽃은 모든 것을 태운다. 보물을 지키는 수호자이자 하늘의 제왕!',
        base_score: 2200,
        elo_score: 1620,
        wins: 28,
        losses: 12
      },
      {
        user_id: users[4].id,
        animal_id: 4, // 돌고래
        character_name: '파도타기',
        battle_text: '바다의 친구 돌고래! 똑똑하고 재빠르게 파도를 가르며 헤엄친다. 내 클릭 소리로 모든 것을 알 수 있어! 바다의 수호자!',
        base_score: 2000,
        elo_score: 1580,
        wins: 25,
        losses: 15
      }
    ];

    const { data: characters, error: charError } = await supabase
      .from('characters')
      .insert(sampleCharacters)
      .select();

    if (charError) throw charError;

    // 몇 개의 샘플 배틀 생성
    const battles = [
      {
        attacker_id: characters[0].id,
        defender_id: characters[1].id,
        battle_type: 'active',
        winner_id: characters[0].id,
        attacker_score_change: 50,
        defender_score_change: -50,
        attacker_elo_change: 25,
        defender_elo_change: -25,
        ai_judgment: '황금갈기의 용감함과 리더십이 무지개뿔의 마법을 압도했다. 정글의 왕다운 카리스마로 승리!'
      },
      {
        attacker_id: characters[2].id,
        defender_id: characters[3].id,
        battle_type: 'active',
        winner_id: characters[2].id,
        attacker_score_change: 50,
        defender_score_change: -50,
        attacker_elo_change: 28,
        defender_elo_change: -28,
        ai_judgment: '다이노킹의 압도적인 힘이 불꽃날개의 화염을 뚫고 승리했다. 공룡의 제왕답게 강력한 모습!'
      }
    ];

    const { error: battleError } = await supabase
      .from('battles')
      .insert(battles);

    if (battleError) throw battleError;

    return NextResponse.json({
      success: true,
      message: '샘플 데이터가 성공적으로 생성되었습니다',
      data: {
        users: users.length,
        characters: characters.length,
        battles: battles.length
      }
    });
  } catch (error) {
    console.error('Sample data creation error:', error);
    return NextResponse.json({
      success: false,
      error: '샘플 데이터 생성 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}