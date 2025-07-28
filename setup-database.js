// 데이터베이스 설정 스크립트
// 실행: node setup-database.js

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.log('NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_KEY를 .env.local에 설정해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Kid Text Battle 데이터베이스 설정 시작...\n');

  try {
    // 1. 관리자 설정 생성
    console.log('1️⃣ 관리자 설정 확인...');
    const { data: existingSettings } = await supabase
      .from('admin_settings')
      .select('id')
      .eq('setting_key', 'admin_password')
      .single();

    if (!existingSettings) {
      console.log('   📝 관리자 설정 생성 중...');
      
      const settings = [
        { setting_key: 'admin_password', setting_value: '$2a$10$rBV2JDeWW3.vKyeQcM8fFu4RoMZiVertNVDLE3L7lKwLW5LPR4lSa' },
        { setting_key: 'profanity_filter_enabled', setting_value: 'true' },
        { setting_key: 'ten_commandments_filter_enabled', setting_value: 'true' },
        { setting_key: 'max_warnings_before_suspension', setting_value: '3' },
        { setting_key: 'daily_active_battle_limit', setting_value: '10' },
        { setting_key: 'min_elo_difference_for_match', setting_value: '200' },
        { setting_key: 'base_score_change', setting_value: '50' },
        { setting_key: 'elo_k_factor', setting_value: '32' }
      ];

      const { error } = await supabase
        .from('admin_settings')
        .insert(settings);

      if (error) throw error;
      console.log('   ✅ 관리자 설정 완료');
    } else {
      console.log('   ℹ️  관리자 설정이 이미 존재합니다');
    }

    // 2. 관리자 계정 생성
    console.log('\n2️⃣ 관리자 계정 확인...');
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@kidtextbattle.com')
      .single();

    if (!existingAdmin) {
      console.log('   👤 관리자 계정 생성 중...');
      
      const { error } = await supabase
        .from('users')
        .insert({
          email: 'admin@kidtextbattle.com',
          is_guest: false,
          display_name: '관리자'
        });

      if (error) throw error;
      console.log('   ✅ 관리자 계정 생성 완료');
    } else {
      console.log('   ℹ️  관리자 계정이 이미 존재합니다');
    }

    // 3. 샘플 데이터 생성
    console.log('\n3️⃣ 샘플 데이터 확인...');
    const { data: existingSamples } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'sample1@kidtextbattle.com')
      .single();

    if (!existingSamples) {
      console.log('   🎮 샘플 데이터 생성 중...');
      
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
      console.log('   ✅ 샘플 사용자 5명 생성 완료');

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
          losses: 5,
          total_active_battles: 50,
          total_passive_battles: 20
        },
        {
          user_id: users[1].id,
          animal_id: 6, // 유니콘
          character_name: '무지개뿔',
          battle_text: '마법의 숲에서 온 신비로운 유니콘! 내 뿔은 무지개빛으로 빛나고 치유의 힘을 가지고 있어. 순수한 마음만이 나를 볼 수 있지!',
          base_score: 2600,
          elo_score: 1750,
          wins: 38,
          losses: 7,
          total_active_battles: 45,
          total_passive_battles: 15
        },
        {
          user_id: users[2].id,
          animal_id: 11, // 티라노사우루스
          character_name: '다이노킹',
          battle_text: '백악기 최강의 포식자! 거대한 이빨과 강력한 턱으로 모든 것을 부순다. 나는 공룡의 왕이다! 라오오오어!',
          base_score: 2400,
          elo_score: 1680,
          wins: 32,
          losses: 8,
          total_active_battles: 40,
          total_passive_battles: 18
        },
        {
          user_id: users[3].id,
          animal_id: 7, // 드래곤
          character_name: '불꽃날개',
          battle_text: '하늘을 지배하는 전설의 드래곤! 내 입에서 나오는 불꽃은 모든 것을 태운다. 보물을 지키는 수호자이자 하늘의 제왕!',
          base_score: 2200,
          elo_score: 1620,
          wins: 28,
          losses: 12,
          total_active_battles: 40,
          total_passive_battles: 10
        },
        {
          user_id: users[4].id,
          animal_id: 4, // 돌고래
          character_name: '파도타기',
          battle_text: '바다의 친구 돌고래! 똑똑하고 재빠르게 파도를 가르며 헤엄친다. 내 클릭 소리로 모든 것을 알 수 있어! 바다의 수호자!',
          base_score: 2000,
          elo_score: 1580,
          wins: 25,
          losses: 15,
          total_active_battles: 40,
          total_passive_battles: 12
        }
      ];

      const { error: charError } = await supabase
        .from('characters')
        .insert(sampleCharacters);

      if (charError) throw charError;
      console.log('   ✅ 샘플 캐릭터 5개 생성 완료');
    } else {
      console.log('   ℹ️  샘플 데이터가 이미 존재합니다');
    }

    console.log('\n✅ 데이터베이스 설정이 모두 완료되었습니다!');
    console.log('\n📌 다음 단계:');
    console.log('1. npm run dev로 개발 서버를 시작하세요');
    console.log('2. http://localhost:3000에서 게임을 테스트하세요');
    console.log('3. 관리자 페이지: 우측 하단 유니콘 아이콘 클릭 (비밀번호: 1234)');

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    console.log('\n💡 해결 방법:');
    console.log('1. Supabase 대시보드에서 complete-schema.sql을 먼저 실행했는지 확인하세요');
    console.log('2. .env.local 파일에 올바른 Supabase 키가 설정되어 있는지 확인하세요');
  }
}

// 스크립트 실행
setupDatabase();