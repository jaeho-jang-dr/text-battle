-- PostgreSQL Migration Script for Kid Text Battle
-- Run this in your Lovable PostgreSQL database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create all tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  is_guest BOOLEAN DEFAULT false,
  display_name TEXT,
  warning_count INTEGER DEFAULT 0,
  is_suspended BOOLEAN DEFAULT false,
  suspended_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  login_token UUID UNIQUE,
  token_expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS animals (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  korean_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('current', 'mythical', 'prehistoric')),
  description TEXT,
  abilities TEXT,
  emoji TEXT,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  animal_id INTEGER REFERENCES animals(id),
  character_name TEXT NOT NULL,
  battle_text TEXT,
  base_score INTEGER DEFAULT 1000,
  elo_score INTEGER DEFAULT 1500,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  total_active_battles INTEGER DEFAULT 0,
  total_passive_battles INTEGER DEFAULT 0,
  active_battles_today INTEGER DEFAULT 0,
  last_battle_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  is_bot BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attacker_id UUID REFERENCES characters(id),
  defender_id UUID REFERENCES characters(id),
  battle_type TEXT CHECK (battle_type IN ('active', 'passive')),
  winner_id UUID,
  attacker_score_change INTEGER,
  defender_score_change INTEGER,
  attacker_elo_change INTEGER,
  defender_elo_change INTEGER,
  ai_judgment TEXT,
  ai_reasoning TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  permissions TEXT DEFAULT 'all',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_settings (
  id SERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS warnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  warning_type TEXT,
  warning_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_animal_id ON characters(animal_id);
CREATE INDEX idx_battles_attacker_id ON battles(attacker_id);
CREATE INDEX idx_battles_defender_id ON battles(defender_id);
CREATE INDEX idx_battles_created_at ON battles(created_at DESC);
CREATE INDEX idx_warnings_user_id ON warnings(user_id);

-- Create leaderboard view
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
    WHEN (c.total_active_battles + c.total_passive_battles) > 0 
    THEN ROUND((c.wins::numeric / (c.total_active_battles + c.total_passive_battles)) * 100, 2)
    ELSE 0
  END as win_rate,
  c.created_at,
  c.is_bot,
  a.korean_name as animal_name,
  a.emoji as animal_icon,
  a.category as animal_category,
  u.display_name as player_name,
  u.is_guest,
  RANK() OVER (ORDER BY c.elo_score DESC) as rank
FROM characters c
JOIN animals a ON c.animal_id = a.id
JOIN users u ON c.user_id = u.id
WHERE c.is_active = true AND u.is_suspended = false;

-- Insert animals data
INSERT INTO animals (name, korean_name, category, emoji, description, abilities) VALUES
-- 현존 동물
('Lion', '사자', 'current', '🦁', '초원의 왕', '강력한 포효'),
('Elephant', '코끼리', 'current', '🐘', '지혜로운 거인', '긴 코 공격'),
('Penguin', '펭귄', 'current', '🐧', '얼음 위의 신사', '미끄럼 공격'),
('Dolphin', '돌고래', 'current', '🐬', '바다의 천재', '음파 공격'),
('Tiger', '호랑이', 'current', '🐅', '정글의 제왕', '날카로운 발톱'),
('Panda', '판다', 'current', '🐼', '평화로운 전사', '대나무 막대기'),
-- 전설의 동물
('Unicorn', '유니콘', 'mythical', '🦄', '순수한 마법사', '치유의 뿔'),
('Dragon', '드래곤', 'mythical', '🐉', '하늘의 지배자', '화염 숨결'),
('Phoenix', '불사조', 'mythical', '🔥', '불멸의 존재', '부활의 날개'),
('Pegasus', '페가수스', 'mythical', '🐴', '날개 달린 말', '하늘 돌진'),
('Griffin', '그리핀', 'mythical', '🦅', '사자독수리', '맹금류의 시야'),
-- 고생대 동물
('Tyrannosaurus', '티라노사우루스', 'prehistoric', '🦖', '공룡의 왕', '강력한 턱'),
('Triceratops', '트리케라톱스', 'prehistoric', '🦕', '세 뿔의 전사', '돌진 공격'),
('Pteranodon', '프테라노돈', 'prehistoric', '🦅', '하늘의 공룡', '급강하 공격'),
('Brachiosaurus', '브라키오사우루스', 'prehistoric', '🦕', '긴 목의 거인', '꼬리 휘두르기'),
('Stegosaurus', '스테고사우루스', 'prehistoric', '🦕', '가시 갑옷 전사', '꼬리 가시');

-- Create default admin user (password: 1234)
-- Note: You should change this password immediately after deployment
INSERT INTO admin_users (username, password_hash, display_name) VALUES
('admin', '$2b$10$Bkp8KDEsC8Z1GbQYbAgss.FBsJgI/x9W.5z1Uw2c.r8aTenQUYzDq', '시스템 관리자');

-- Create sample bot users and characters
DO $$
DECLARE
  bot_user_id UUID;
  animal_id INTEGER;
BEGIN
  -- Bot 1: 연습용 사자
  INSERT INTO users (email, is_guest, display_name) 
  VALUES ('bot1@kidtextbattle.com', false, '봇 1') 
  RETURNING id INTO bot_user_id;
  
  SELECT id INTO animal_id FROM animals WHERE name = 'Lion' LIMIT 1;
  
  INSERT INTO characters (user_id, animal_id, character_name, battle_text, base_score, elo_score, wins, losses, is_bot)
  VALUES (bot_user_id, animal_id, '연습용 사자', '안녕! 나는 연습용 캐릭터야. 함께 배틀하자!', 1300, 1450, 10, 5, true);

  -- Bot 2: 훈련용 코끼리
  INSERT INTO users (email, is_guest, display_name) 
  VALUES ('bot2@kidtextbattle.com', false, '봇 2') 
  RETURNING id INTO bot_user_id;
  
  SELECT id INTO animal_id FROM animals WHERE name = 'Elephant' LIMIT 1;
  
  INSERT INTO characters (user_id, animal_id, character_name, battle_text, base_score, elo_score, wins, losses, is_bot)
  VALUES (bot_user_id, animal_id, '훈련용 코끼리', '나는 강력한 코끼리다! 내 코를 조심해!', 1200, 1400, 8, 7, true);

  -- Bot 3: 대기중 펭귄
  INSERT INTO users (email, is_guest, display_name) 
  VALUES ('bot3@kidtextbattle.com', false, '봇 3') 
  RETURNING id INTO bot_user_id;
  
  SELECT id INTO animal_id FROM animals WHERE name = 'Penguin' LIMIT 1;
  
  INSERT INTO characters (user_id, animal_id, character_name, battle_text, base_score, elo_score, wins, losses, is_bot)
  VALUES (bot_user_id, animal_id, '대기중 펭귄', '얼음 위에서 미끄러지며 싸울 거야!', 1150, 1350, 5, 10, true);

  -- Bot 4: AI 유니콘
  INSERT INTO users (email, is_guest, display_name) 
  VALUES ('bot4@kidtextbattle.com', false, '봇 4') 
  RETURNING id INTO bot_user_id;
  
  SELECT id INTO animal_id FROM animals WHERE name = 'Unicorn' LIMIT 1;
  
  INSERT INTO characters (user_id, animal_id, character_name, battle_text, base_score, elo_score, wins, losses, is_bot)
  VALUES (bot_user_id, animal_id, 'AI 유니콘', '마법의 힘으로 너를 이길 거야!', 1400, 1550, 15, 3, true);

  -- Bot 5: 연습 돌고래
  INSERT INTO users (email, is_guest, display_name) 
  VALUES ('bot5@kidtextbattle.com', false, '봇 5') 
  RETURNING id INTO bot_user_id;
  
  SELECT id INTO animal_id FROM animals WHERE name = 'Dolphin' LIMIT 1;
  
  INSERT INTO characters (user_id, animal_id, character_name, battle_text, base_score, elo_score, wins, losses, is_bot)
  VALUES (bot_user_id, animal_id, '연습 돌고래', '바다의 지혜로 승리할 거야!', 1100, 1300, 3, 12, true);
END $$;