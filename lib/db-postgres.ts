import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// PostgreSQL connection pool
let pool: Pool;

export function getDb() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }
  return pool;
}

// Database initialization for PostgreSQL
export async function initializeDatabase() {
  console.log('🔧 PostgreSQL 데이터베이스 초기화 시작...');
  const db = getDb();

  try {
    // Create tables
    await db.query(`
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Users table
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

      -- Animals table
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

      -- Characters table
      CREATE TABLE IF NOT EXISTS characters (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
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

      -- Battles table
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

      -- Admin users table
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name TEXT,
        permissions TEXT DEFAULT 'all',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );

      -- Admin settings table
      CREATE TABLE IF NOT EXISTS admin_settings (
        id SERIAL PRIMARY KEY,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Warnings table
      CREATE TABLE IF NOT EXISTS warnings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        character_id UUID REFERENCES characters(id),
        warning_type TEXT,
        warning_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

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
    `);

    // Seed animals data
    const animalsCount = await db.query('SELECT COUNT(*) FROM animals');
    if (parseInt(animalsCount.rows[0].count) === 0) {
      console.log('🦁 동물 데이터 초기화...');
      await seedAnimals(db);
    }

    // Create default admin
    const adminCount = await db.query('SELECT COUNT(*) FROM admin_users');
    if (parseInt(adminCount.rows[0].count) === 0) {
      console.log('👤 관리자 계정 생성...');
      await createDefaultAdmin(db);
    }

    console.log('✅ PostgreSQL 데이터베이스 초기화 완료!');
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 오류:', error);
    throw error;
  }
}

async function seedAnimals(db: Pool) {
  const animals = [
    // 현존 동물
    { name: 'Lion', korean_name: '사자', category: 'current', emoji: '🦁', description: '초원의 왕', abilities: '강력한 포효' },
    { name: 'Elephant', korean_name: '코끼리', category: 'current', emoji: '🐘', description: '지혜로운 거인', abilities: '긴 코 공격' },
    { name: 'Penguin', korean_name: '펭귄', category: 'current', emoji: '🐧', description: '얼음 위의 신사', abilities: '미끄럼 공격' },
    { name: 'Dolphin', korean_name: '돌고래', category: 'current', emoji: '🐬', description: '바다의 천재', abilities: '음파 공격' },
    { name: 'Tiger', korean_name: '호랑이', category: 'current', emoji: '🐅', description: '정글의 제왕', abilities: '날카로운 발톱' },
    { name: 'Panda', korean_name: '판다', category: 'current', emoji: '🐼', description: '평화로운 전사', abilities: '대나무 막대기' },
    // 전설의 동물
    { name: 'Unicorn', korean_name: '유니콘', category: 'mythical', emoji: '🦄', description: '순수한 마법사', abilities: '치유의 뿔' },
    { name: 'Dragon', korean_name: '드래곤', category: 'mythical', emoji: '🐉', description: '하늘의 지배자', abilities: '화염 숨결' },
    { name: 'Phoenix', korean_name: '불사조', category: 'mythical', emoji: '🔥', description: '불멸의 존재', abilities: '부활의 날개' },
    { name: 'Pegasus', korean_name: '페가수스', category: 'mythical', emoji: '🐴', description: '날개 달린 말', abilities: '하늘 돌진' },
    { name: 'Griffin', korean_name: '그리핀', category: 'mythical', emoji: '🦅', description: '사자독수리', abilities: '맹금류의 시야' },
    // 고생대 동물
    { name: 'Tyrannosaurus', korean_name: '티라노사우루스', category: 'prehistoric', emoji: '🦖', description: '공룡의 왕', abilities: '강력한 턱' },
    { name: 'Triceratops', korean_name: '트리케라톱스', category: 'prehistoric', emoji: '🦕', description: '세 뿔의 전사', abilities: '돌진 공격' },
    { name: 'Pteranodon', korean_name: '프테라노돈', category: 'prehistoric', emoji: '🦅', description: '하늘의 공룡', abilities: '급강하 공격' },
    { name: 'Brachiosaurus', korean_name: '브라키오사우루스', category: 'prehistoric', emoji: '🦕', description: '긴 목의 거인', abilities: '꼬리 휘두르기' },
    { name: 'Stegosaurus', korean_name: '스테고사우루스', category: 'prehistoric', emoji: '🦕', description: '가시 갑옷 전사', abilities: '꼬리 가시' }
  ];

  for (const animal of animals) {
    await db.query(
      'INSERT INTO animals (name, korean_name, category, emoji, description, abilities) VALUES ($1, $2, $3, $4, $5, $6)',
      [animal.name, animal.korean_name, animal.category, animal.emoji, animal.description, animal.abilities]
    );
  }
}

async function createDefaultAdmin(db: Pool) {
  const passwordHash = await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD || '1234', 10);
  await db.query(
    'INSERT INTO admin_users (username, password_hash, display_name) VALUES ($1, $2, $3)',
    ['admin', passwordHash, '시스템 관리자']
  );
}

// Helper function to run queries
export async function query(text: string, params?: any[]) {
  const db = getDb();
  return db.query(text, params);
}

// Helper function for transactions
export async function transaction(callback: (client: any) => Promise<void>) {
  const db = getDb();
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    await callback(client);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}