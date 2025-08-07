-- 사용자 테이블
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    kakao_id VARCHAR(255) UNIQUE,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255),
    is_guest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 캐릭터 테이블
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(10) NOT NULL,
    battle_chat VARCHAR(100) NOT NULL,
    elo_score INTEGER DEFAULT 1000,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    is_npc BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 배틀 테이블
CREATE TABLE battles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attacker_id UUID REFERENCES characters(id),
    defender_id UUID REFERENCES characters(id),
    winner_id UUID REFERENCES characters(id),
    attacker_score INTEGER NOT NULL,
    defender_score INTEGER NOT NULL,
    battle_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 배틀 제한 테이블
CREATE TABLE battle_restrictions (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    daily_battle_count INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 연속 배틀 추적 테이블
CREATE TABLE consecutive_battles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    opponent_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    battle_type VARCHAR(10) CHECK (battle_type IN ('attack', 'defense')),
    count INTEGER DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(character_id, opponent_id, battle_type)
);

-- 게임 설정 테이블
CREATE TABLE game_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    daily_battle_limit INTEGER DEFAULT 10,
    defensive_battle_limit INTEGER DEFAULT 5,
    attack_battle_limit INTEGER DEFAULT 3,
    base_score INTEGER DEFAULT 100,
    elo_multiplier DECIMAL(3,2) DEFAULT 1.5,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

-- 관리자 계정 (admin/1234)
INSERT INTO users (username, password_hash, is_guest) 
VALUES ('admin', '$2a$10$YourHashedPasswordHere', FALSE);

-- 인덱스
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_elo_score ON characters(elo_score DESC);
CREATE INDEX idx_battles_created_at ON battles(created_at DESC);
CREATE INDEX idx_battle_restrictions_reset ON battle_restrictions(last_reset_date);