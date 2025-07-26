-- Kid Text Battle 데이터베이스 스키마

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  age INTEGER CHECK (age >= 7 AND age <= 15),
  avatar VARCHAR(50) DEFAULT '🙂',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 동물 마스터 데이터
CREATE TABLE IF NOT EXISTS animals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  korean_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('current', 'legend', 'prehistoric')),
  emoji VARCHAR(10) NOT NULL,
  description TEXT NOT NULL,
  habitat VARCHAR(255) NOT NULL,
  food VARCHAR(255) NOT NULL,
  speciality VARCHAR(255) NOT NULL,
  fun_fact TEXT NOT NULL,
  power INTEGER DEFAULT 50 CHECK (power >= 0 AND power <= 100),
  defense INTEGER DEFAULT 50 CHECK (defense >= 0 AND defense <= 100),
  speed INTEGER DEFAULT 50 CHECK (speed >= 0 AND speed <= 100),
  battle_cry VARCHAR(255) NOT NULL
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

-- 인덱스 생성
CREATE INDEX idx_battles_player1 ON battles(player1_id);
CREATE INDEX idx_battles_player2 ON battles(player2_id);
CREATE INDEX idx_battles_winner ON battles(winner_id);
CREATE INDEX idx_user_animals_user ON user_animals(user_id);

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