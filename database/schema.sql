-- Kid Text Battle 데이터베이스 스키마

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  age INTEGER CHECK (age >= 7 AND age <= 15),
  avatar VARCHAR(50) DEFAULT '🙂',
  role VARCHAR(20) DEFAULT 'player' CHECK (role IN ('player', 'admin', 'parent')),
  parent_email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  play_time_limit INTEGER DEFAULT 60, -- 일일 플레이 시간 제한 (분)
  today_play_time INTEGER DEFAULT 0, -- 오늘 플레이한 시간 (분)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 동물 마스터 데이터
CREATE TABLE IF NOT EXISTS animals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  korean_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('current', 'mythical', 'prehistoric', 'custom')),
  sub_category VARCHAR(50), -- 세부 분류 (포유류, 조류, 파충류 등)
  emoji VARCHAR(10) NOT NULL,
  description TEXT NOT NULL,
  kid_description TEXT NOT NULL, -- 아이들을 위한 쉬운 설명
  habitat VARCHAR(255) NOT NULL,
  food VARCHAR(255) NOT NULL,
  speciality VARCHAR(255) NOT NULL,
  fun_fact TEXT NOT NULL,
  power INTEGER DEFAULT 50 CHECK (power >= 0 AND power <= 100),
  defense INTEGER DEFAULT 50 CHECK (defense >= 0 AND defense <= 100),
  speed INTEGER DEFAULT 50 CHECK (speed >= 0 AND speed <= 100),
  intelligence INTEGER DEFAULT 50 CHECK (intelligence >= 0 AND intelligence <= 100),
  battle_cry VARCHAR(255) NOT NULL,
  rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  unlock_level INTEGER DEFAULT 1,
  created_by UUID REFERENCES users(id), -- 커스텀 동물의 창작자
  is_approved BOOLEAN DEFAULT true, -- 커스텀 동물 승인 여부
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사용자 동물 컬렉션
CREATE TABLE IF NOT EXISTS user_animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  animal_id INTEGER REFERENCES animals(id),
  nickname VARCHAR(100),
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 100),
  experience INTEGER DEFAULT 0 CHECK (experience >= 0),
  battles_won INTEGER DEFAULT 0 CHECK (battles_won >= 0),
  battles_lost INTEGER DEFAULT 0 CHECK (battles_lost >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, animal_id)
);

-- 배틀 기록
CREATE TABLE IF NOT EXISTS battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id UUID REFERENCES users(id),
  player2_id UUID REFERENCES users(id),
  player1_animal_id INTEGER REFERENCES animals(id),
  player2_animal_id INTEGER REFERENCES animals(id),
  winner_id UUID REFERENCES users(id),
  battle_log JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 리더보드 뷰
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  u.id,
  u.username,
  u.avatar,
  COALESCE(COUNT(CASE WHEN b.winner_id = u.id THEN 1 END), 0) as wins,
  COALESCE(COUNT(CASE WHEN b.winner_id != u.id AND (b.player1_id = u.id OR b.player2_id = u.id) THEN 1 END), 0) as losses,
  COALESCE(COUNT(CASE WHEN b.player1_id = u.id OR b.player2_id = u.id THEN 1 END), 0) as total_battles,
  CASE 
    WHEN COUNT(CASE WHEN b.player1_id = u.id OR b.player2_id = u.id THEN 1 END) = 0 THEN 0
    ELSE ROUND(
      COUNT(CASE WHEN b.winner_id = u.id THEN 1 END)::NUMERIC / 
      COUNT(CASE WHEN b.player1_id = u.id OR b.player2_id = u.id THEN 1 END) * 100, 
      2
    )
  END as win_rate
FROM users u
LEFT JOIN battles b ON u.id IN (b.player1_id, b.player2_id)
GROUP BY u.id, u.username, u.avatar
ORDER BY wins DESC, win_rate DESC
LIMIT 25;

-- 도움말 시스템
CREATE TABLE IF NOT EXISTS help_contents (
  id SERIAL PRIMARY KEY,
  page VARCHAR(100) NOT NULL,
  section VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  emoji VARCHAR(10),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 플레이 세션 추적
CREATE TABLE IF NOT EXISTS play_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  parent_approved BOOLEAN DEFAULT false
);

-- 부모 승인 요청
CREATE TABLE IF NOT EXISTS parent_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_email VARCHAR(255) NOT NULL,
  approval_type VARCHAR(50) NOT NULL, -- 'registration', 'play_time_extension', 'custom_animal'
  approval_data JSONB,
  token VARCHAR(255) UNIQUE NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

-- 업적 시스템
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  requirement_type VARCHAR(50) NOT NULL, -- 'battles_won', 'animals_collected', 'play_days', etc
  requirement_value INTEGER NOT NULL,
  reward_type VARCHAR(50), -- 'animal', 'avatar', 'title'
  reward_data JSONB
);

-- 사용자 업적
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER REFERENCES achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- 인덱스 생성
CREATE INDEX idx_battles_player1 ON battles(player1_id);
CREATE INDEX idx_battles_player2 ON battles(player2_id);
CREATE INDEX idx_battles_winner ON battles(winner_id);
CREATE INDEX idx_user_animals_user ON user_animals(user_id);
CREATE INDEX idx_animals_category ON animals(category);
CREATE INDEX idx_animals_rarity ON animals(rarity);
CREATE INDEX idx_help_contents_page ON help_contents(page);
CREATE INDEX idx_play_sessions_user ON play_sessions(user_id);
CREATE INDEX idx_parent_approvals_token ON parent_approvals(token);

-- RLS (Row Level Security) 정책
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 볼 수 있음
CREATE POLICY "Users can view own profile" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 사용자는 자신의 동물만 관리할 수 있음
CREATE POLICY "Users can manage own animals" ON user_animals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view all animals" ON user_animals
  FOR SELECT USING (true);

-- 배틀은 모두 볼 수 있지만 생성은 참가자만
CREATE POLICY "Anyone can view battles" ON battles
  FOR SELECT USING (true);

CREATE POLICY "Users can create own battles" ON battles
  FOR INSERT WITH CHECK (auth.uid() IN (player1_id, player2_id));