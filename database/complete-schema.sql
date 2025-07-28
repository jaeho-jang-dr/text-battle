-- Kid Text Battle 전체 데이터베이스 스키마

-- 기존 테이블 삭제 (의존성 순서대로)
DROP TABLE IF EXISTS battles CASCADE;
DROP TABLE IF EXISTS warnings CASCADE;
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS characters CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS admin_settings CASCADE;

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

-- 인덱스 생성
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_scores ON characters(base_score DESC, elo_score DESC);
CREATE INDEX idx_battles_created_at ON battles(created_at DESC);
CREATE INDEX idx_battles_attacker ON battles(attacker_id);
CREATE INDEX idx_battles_defender ON battles(defender_id);
CREATE INDEX idx_warnings_user_id ON warnings(user_id);

-- 함수: 캐릭터 수 제한 체크
CREATE OR REPLACE FUNCTION check_character_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM characters WHERE user_id = NEW.user_id AND is_active = TRUE) >= 3 THEN
    RAISE EXCEPTION '한 계정당 최대 3개의 캐릭터만 만들 수 있습니다.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거: 캐릭터 생성 시 제한 체크
CREATE TRIGGER enforce_character_limit
BEFORE INSERT ON characters
FOR EACH ROW
EXECUTE FUNCTION check_character_limit();

-- 함수: 일일 배틀 횟수 리셋
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

-- 함수: 배틀 후 점수 업데이트
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

-- 트리거: 배틀 생성 시 점수 업데이트
CREATE TRIGGER trigger_update_battle_scores
AFTER INSERT ON battles
FOR EACH ROW
EXECUTE FUNCTION update_battle_scores();

-- 뷰: 리더보드
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

-- Row Level Security (RLS) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE warnings ENABLE ROW LEVEL SECURITY;

-- RLS 정책들
-- 사용자는 자신의 정보만 볼 수 있음
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::TEXT = id::TEXT OR id IN (
    SELECT id FROM users WHERE email = 'admin@kidtextbattle.com'
  ));

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::TEXT = id::TEXT);

-- 캐릭터는 모두가 볼 수 있지만, 수정은 소유자만
CREATE POLICY "Anyone can view characters" ON characters
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own characters" ON characters
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id::TEXT);

CREATE POLICY "Users can update own characters" ON characters
  FOR UPDATE USING (auth.uid()::TEXT = user_id::TEXT);

-- 배틀 기록은 모두 볼 수 있음
CREATE POLICY "Anyone can view battles" ON battles
  FOR SELECT USING (true);

-- 경고는 본인 것만 볼 수 있음
CREATE POLICY "Users can view own warnings" ON warnings
  FOR SELECT USING (auth.uid()::TEXT = user_id::TEXT);

-- 초기 관리자 설정 삽입
INSERT INTO admin_settings (setting_key, setting_value) VALUES
('admin_password', '$2a$10$rBV2JDeWW3.vKyeQcM8fFu4RoMZiVertNVDLE3L7lKwLW5LPR4lSa'), -- bcrypt hash of '1234'
('profanity_filter_enabled', 'true'),
('ten_commandments_filter_enabled', 'true'),
('max_warnings_before_suspension', '3'),
('daily_active_battle_limit', '10'),
('min_elo_difference_for_match', '200'),
('base_score_change', '50'),
('elo_k_factor', '32');

-- 초기 관리자 계정 생성
INSERT INTO users (email, is_guest, display_name) VALUES
('admin@kidtextbattle.com', FALSE, '관리자');