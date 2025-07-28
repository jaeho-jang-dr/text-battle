import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('데이터베이스 설정 시작...');

    // 1. UUID 확장 활성화
    const { error: uuidError } = await supabase.rpc('create_extension_if_not_exists', {
      extension_name: 'uuid-ossp'
    });
    
    if (uuidError && !uuidError.message.includes('already exists')) {
      console.error('UUID 확장 오류:', uuidError);
    }

    // 2. 기존 테이블 삭제 (의존성 순서대로)
    const dropTables = [
      'DROP TABLE IF EXISTS battles CASCADE',
      'DROP TABLE IF EXISTS warnings CASCADE',
      'DROP TABLE IF EXISTS admin_logs CASCADE',
      'DROP TABLE IF EXISTS characters CASCADE',
      'DROP TABLE IF EXISTS users CASCADE',
      'DROP TABLE IF EXISTS admin_settings CASCADE'
    ];

    for (const query of dropTables) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: query });
      if (error) console.error('테이블 삭제 오류:', error);
    }

    // 3. 테이블 생성
    const createTables = `
      -- 사용자 테이블
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE,
        is_guest BOOLEAN DEFAULT FALSE,
        display_name VARCHAR(100),
        warning_count INTEGER DEFAULT 0,
        is_suspended BOOLEAN DEFAULT FALSE,
        suspended_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        login_token VARCHAR(255) UNIQUE,
        token_expires_at TIMESTAMP WITH TIME ZONE
      );

      -- 캐릭터 테이블
      CREATE TABLE characters (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        animal_id INTEGER NOT NULL REFERENCES animals(id),
        character_name VARCHAR(100) NOT NULL,
        battle_text TEXT,
        base_score INTEGER DEFAULT 1000,
        elo_score INTEGER DEFAULT 1500,
        active_battles_today INTEGER DEFAULT 0,
        passive_battles_today INTEGER DEFAULT 0,
        total_active_battles INTEGER DEFAULT 0,
        total_passive_battles INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_battle_reset TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 배틀 테이블
      CREATE TABLE battles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        attacker_id UUID NOT NULL REFERENCES characters(id),
        defender_id UUID NOT NULL REFERENCES characters(id),
        battle_type VARCHAR(20) NOT NULL CHECK (battle_type IN ('active', 'passive')),
        winner_id UUID REFERENCES characters(id),
        attacker_score_change INTEGER DEFAULT 0,
        defender_score_change INTEGER DEFAULT 0,
        attacker_elo_change INTEGER DEFAULT 0,
        defender_elo_change INTEGER DEFAULT 0,
        ai_judgment TEXT,
        ai_reasoning TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 경고 테이블
      CREATE TABLE warnings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        warning_type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        character_id UUID REFERENCES characters(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 관리자 설정 테이블
      CREATE TABLE admin_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 관리자 로그 테이블
      CREATE TABLE admin_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        admin_id UUID REFERENCES users(id),
        action_type VARCHAR(100) NOT NULL,
        target_type VARCHAR(50),
        target_id UUID,
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const { error: createError } = await supabase.rpc('exec_sql', { sql_query: createTables });
    if (createError) {
      console.error('테이블 생성 오류:', createError);
      throw createError;
    }

    // 4. 인덱스 생성
    const createIndexes = [
      'CREATE INDEX idx_characters_user_id ON characters(user_id)',
      'CREATE INDEX idx_characters_scores ON characters(base_score DESC, elo_score DESC)',
      'CREATE INDEX idx_battles_created_at ON battles(created_at DESC)',
      'CREATE INDEX idx_battles_attacker ON battles(attacker_id)',
      'CREATE INDEX idx_battles_defender ON battles(defender_id)',
      'CREATE INDEX idx_warnings_user_id ON warnings(user_id)'
    ];

    for (const query of createIndexes) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: query });
      if (error) console.error('인덱스 생성 오류:', error);
    }

    // 5. 함수 및 트리거 생성
    const createFunctions = `
      -- 캐릭터 수 제한 체크 함수
      CREATE OR REPLACE FUNCTION check_character_limit()
      RETURNS TRIGGER AS $$
      BEGIN
        IF (SELECT COUNT(*) FROM characters WHERE user_id = NEW.user_id AND is_active = TRUE) >= 3 THEN
          RAISE EXCEPTION '한 계정당 최대 3개의 캐릭터만 만들 수 있습니다.';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- 트리거 생성
      DROP TRIGGER IF EXISTS enforce_character_limit ON characters;
      CREATE TRIGGER enforce_character_limit
      BEFORE INSERT ON characters
      FOR EACH ROW
      EXECUTE FUNCTION check_character_limit();

      -- 일일 배틀 횟수 리셋 함수
      CREATE OR REPLACE FUNCTION reset_daily_battles()
      RETURNS void AS $$
      BEGIN
        UPDATE characters
        SET active_battles_today = 0,
            passive_battles_today = 0,
            last_battle_reset = CURRENT_TIMESTAMP
        WHERE DATE(last_battle_reset) < CURRENT_DATE;
      END;
      $$ LANGUAGE plpgsql;

      -- 배틀 후 점수 업데이트 함수
      CREATE OR REPLACE FUNCTION update_battle_scores()
      RETURNS TRIGGER AS $$
      BEGIN
        -- 공격자 점수 업데이트
        UPDATE characters
        SET base_score = base_score + NEW.attacker_score_change,
            elo_score = elo_score + NEW.attacker_elo_change,
            wins = CASE WHEN NEW.winner_id = NEW.attacker_id THEN wins + 1 ELSE wins END,
            losses = CASE WHEN NEW.winner_id = NEW.defender_id THEN losses + 1 ELSE losses END,
            total_active_battles = total_active_battles + 1,
            active_battles_today = active_battles_today + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.attacker_id;

        -- 방어자 점수 업데이트
        UPDATE characters
        SET base_score = base_score + NEW.defender_score_change,
            elo_score = elo_score + NEW.defender_elo_change,
            wins = CASE WHEN NEW.winner_id = NEW.defender_id THEN wins + 1 ELSE wins END,
            losses = CASE WHEN NEW.winner_id = NEW.attacker_id THEN losses + 1 ELSE losses END,
            total_passive_battles = total_passive_battles + 1,
            passive_battles_today = passive_battles_today + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.defender_id;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- 트리거 생성
      DROP TRIGGER IF EXISTS trigger_update_battle_scores ON battles;
      CREATE TRIGGER trigger_update_battle_scores
      AFTER INSERT ON battles
      FOR EACH ROW
      EXECUTE FUNCTION update_battle_scores();
    `;

    const { error: functionError } = await supabase.rpc('exec_sql', { sql_query: createFunctions });
    if (functionError) {
      console.error('함수/트리거 생성 오류:', functionError);
    }

    // 6. 뷰 생성
    const createView = `
      CREATE OR REPLACE VIEW leaderboard AS
      SELECT 
        c.id,
        c.character_name,
        c.base_score,
        c.elo_score,
        c.wins,
        c.losses,
        c.total_active_battles + c.total_passive_battles as total_battles,
        CASE 
          WHEN (c.wins + c.losses) > 0 
          THEN ROUND((c.wins::NUMERIC / (c.wins + c.losses)) * 100, 2) 
          ELSE 0 
        END as win_rate,
        a.name as animal_name,
        a.korean_name as animal_korean_name,
        a.emoji as animal_emoji,
        u.display_name as player_name,
        ROW_NUMBER() OVER (ORDER BY c.base_score DESC, c.elo_score DESC) as rank
      FROM characters c
      JOIN animals a ON c.animal_id = a.id
      JOIN users u ON c.user_id = u.id
      WHERE c.is_active = TRUE AND u.is_suspended = FALSE
      ORDER BY c.base_score DESC, c.elo_score DESC;
    `;

    const { error: viewError } = await supabase.rpc('exec_sql', { sql_query: createView });
    if (viewError) {
      console.error('뷰 생성 오류:', viewError);
    }

    // 7. 초기 관리자 설정 삽입
    const { error: settingsError } = await supabase
      .from('admin_settings')
      .insert([
        { setting_key: 'admin_password', setting_value: '$2a$10$rBV2JDeWW3.vKyeQcM8fFu4RoMZiVertNVDLE3L7lKwLW5LPR4lSa' },
        { setting_key: 'profanity_filter_enabled', setting_value: 'true' },
        { setting_key: 'ten_commandments_filter_enabled', setting_value: 'true' },
        { setting_key: 'max_warnings_before_suspension', setting_value: '3' },
        { setting_key: 'daily_active_battle_limit', setting_value: '10' },
        { setting_key: 'min_elo_difference_for_match', setting_value: '200' },
        { setting_key: 'base_score_change', setting_value: '50' },
        { setting_key: 'elo_k_factor', setting_value: '32' }
      ]);

    if (settingsError) {
      console.error('관리자 설정 오류:', settingsError);
    }

    // 8. 초기 관리자 계정 생성
    const { error: adminError } = await supabase
      .from('users')
      .insert({
        email: 'admin@kidtextbattle.com',
        is_guest: false,
        display_name: '관리자'
      });

    if (adminError && !adminError.message.includes('duplicate')) {
      console.error('관리자 계정 생성 오류:', adminError);
    }

    // 9. 샘플 데이터 생성
    await createSampleData();

    return NextResponse.json({
      success: true,
      message: '데이터베이스 설정이 완료되었습니다!'
    });

  } catch (error) {
    console.error('데이터베이스 설정 오류:', error);
    return NextResponse.json({
      success: false,
      error: '데이터베이스 설정 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}

// 샘플 데이터 생성 함수
async function createSampleData() {
  try {
    // 샘플 사용자 생성
    const sampleUsers = [
      { email: 'sample1@kidtextbattle.com', is_guest: false, display_name: '용감한사자' },
      { email: 'sample2@kidtextbattle.com', is_guest: false, display_name: '날쌘독수리' },
      { email: 'sample3@kidtextbattle.com', is_guest: false, display_name: '지혜로운부엉이' },
      { email: 'sample4@kidtextbattle.com', is_guest: false, display_name: '강력한곰' },
      { email: 'sample5@kidtextbattle.com', is_guest: false, display_name: '빠른치타' }
    ];

    const { data: users } = await supabase
      .from('users')
      .insert(sampleUsers)
      .select();

    if (!users || users.length === 0) return;

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

    await supabase
      .from('characters')
      .insert(sampleCharacters);

    console.log('샘플 데이터 생성 완료');
  } catch (error) {
    console.error('샘플 데이터 생성 오류:', error);
  }
}