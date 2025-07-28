-- Kid Text Battle - 동물 데이터베이스만 포함된 스키마

-- 동물 테이블
CREATE TABLE IF NOT EXISTS animals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  korean_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('current', 'mythical', 'prehistoric')),
  emoji VARCHAR(10) NOT NULL,
  description TEXT NOT NULL,
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_animals_category ON animals(category);
CREATE INDEX idx_animals_rarity ON animals(rarity);