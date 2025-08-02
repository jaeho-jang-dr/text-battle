import { neon } from '@neondatabase/serverless';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Database connection
let sql: ReturnType<typeof neon>;

// Initialize database connection
export function getDb() {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    sql = neon(databaseUrl);
  }
  return sql;
}

// Helper function to get a single row
export async function getOne<T>(query: string, params: any[] = []): Promise<T | undefined> {
  const db = getDb();
  const result = await db(query, params);
  return result[0] as T | undefined;
}

// Helper function to get all rows
export async function getAll<T>(query: string, params: any[] = []): Promise<T[]> {
  const db = getDb();
  const result = await db(query, params);
  return result as T[];
}

// Helper function to run a query that modifies data
export async function run(query: string, params: any[] = []): Promise<void> {
  const db = getDb();
  await db(query, params);
}

// Transaction helper
export async function transaction<T>(
  callback: (sql: ReturnType<typeof neon>) => Promise<T>
): Promise<T> {
  const db = getDb();
  // Neon serverless doesn't support traditional transactions in the same way
  // For now, we'll execute operations directly
  // In production, you might want to use a connection pool with proper transaction support
  return callback(db);
}

// Database initialization
export async function initializeDatabase() {
  console.log('🔧 PostgreSQL 데이터베이스 초기화 시작...');
  const db = getDb();

  try {
    // Enable UUID extension
    await db`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Create tables
    await db`
      -- 사용자 테이블
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
        login_token TEXT UNIQUE,
        token_expires_at TIMESTAMP
      )
    `;

    await db`
      -- 동물 테이블
      CREATE TABLE IF NOT EXISTS animals (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        korean_name TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('current', 'mythical', 'prehistoric')),
        description TEXT,
        abilities TEXT,
        emoji TEXT,
        image_url TEXT,
        color TEXT,
        attack_power INTEGER DEFAULT 50,
        strength INTEGER DEFAULT 50,
        speed INTEGER DEFAULT 50,
        energy INTEGER DEFAULT 50
      )
    `;

    await db`
      -- 캐릭터 테이블
      CREATE TABLE IF NOT EXISTS characters (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        animal_id INTEGER NOT NULL,
        character_name TEXT NOT NULL,
        battle_text TEXT,
        base_score INTEGER DEFAULT 1000,
        elo_score INTEGER DEFAULT 1500,
        active_battles_today INTEGER DEFAULT 0,
        passive_battles_today INTEGER DEFAULT 0,
        total_active_battles INTEGER DEFAULT 0,
        total_passive_battles INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        is_bot BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_battle_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (animal_id) REFERENCES animals(id)
      )
    `;

    await db`
      -- 배틀 테이블
      CREATE TABLE IF NOT EXISTS battles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        attacker_id UUID NOT NULL,
        defender_id UUID NOT NULL,
        battle_type TEXT NOT NULL CHECK (battle_type IN ('active', 'passive')),
        winner_id UUID,
        attacker_score_change INTEGER DEFAULT 0,
        defender_score_change INTEGER DEFAULT 0,
        attacker_elo_change INTEGER DEFAULT 0,
        defender_elo_change INTEGER DEFAULT 0,
        ai_judgment TEXT,
        ai_reasoning TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (attacker_id) REFERENCES characters(id),
        FOREIGN KEY (defender_id) REFERENCES characters(id),
        FOREIGN KEY (winner_id) REFERENCES characters(id)
      )
    `;

    await db`
      -- 경고 테이블
      CREATE TABLE IF NOT EXISTS warnings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        warning_type TEXT NOT NULL,
        content TEXT NOT NULL,
        character_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (character_id) REFERENCES characters(id)
      )
    `;

    await db`
      -- 관리자 설정 테이블
      CREATE TABLE IF NOT EXISTS admin_settings (
        id SERIAL PRIMARY KEY,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await db`
      -- 관리자 사용자 테이블
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name TEXT,
        permissions TEXT DEFAULT 'all',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await db`
      -- 관리자 로그 테이블
      CREATE TABLE IF NOT EXISTS admin_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        admin_id UUID,
        action_type TEXT NOT NULL,
        target_type TEXT,
        target_id TEXT,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id)
      )
    `;

    // Create indexes
    await db`CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id)`;
    await db`CREATE INDEX IF NOT EXISTS idx_characters_scores ON characters(base_score DESC, elo_score DESC)`;
    await db`CREATE INDEX IF NOT EXISTS idx_battles_created_at ON battles(created_at DESC)`;
    await db`CREATE INDEX IF NOT EXISTS idx_battles_attacker ON battles(attacker_id)`;
    await db`CREATE INDEX IF NOT EXISTS idx_battles_defender ON battles(defender_id)`;
    await db`CREATE INDEX IF NOT EXISTS idx_warnings_user_id ON warnings(user_id)`;

    // Create leaderboard view
    await db`
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
          THEN ROUND(CAST(c.wins AS DECIMAL) / (c.wins + c.losses) * 100, 2) 
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
      WHERE c.is_active = true AND u.is_suspended = false
      ORDER BY c.base_score DESC, c.elo_score DESC
    `;

    console.log('✅ 테이블 생성 완료');

    // Check and insert initial data
    await insertInitialData(db);

    console.log('✅ PostgreSQL 데이터베이스 초기화 완료!');
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 중 오류:', error);
    throw error;
  }
}

// Insert initial data
async function insertInitialData(db: ReturnType<typeof neon>) {
  // Check if animals exist
  const animalCount = await db`SELECT COUNT(*) as count FROM animals`;
  
  if (animalCount[0].count === 0) {
    console.log('🦁 동물 데이터 삽입 중...');
    
    const animals = [
      // 현존 동물
      [1, 'Lion', '사자', 'current', '백수의 왕! 용감하고 강한 동물이에요', '강력한 포효, 리더십, 무리 사냥', '🦁', null, '#FFD700'],
      [2, 'Elephant', '코끼리', 'current', '지구에서 가장 큰 육지 동물이에요', '강력한 코, 뛰어난 기억력, 지혜', '🐘', null, '#A9A9A9'],
      [3, 'Penguin', '펭귄', 'current', '날지 못하지만 수영을 잘하는 새예요', '빠른 수영, 추위 저항, 팀워크', '🐧', null, '#000000'],
      [4, 'Dolphin', '돌고래', 'current', '똑똑하고 친근한 바다 친구예요', '초음파 탐지, 높은 지능, 빠른 수영', '🐬', null, '#4169E1'],
      [5, 'Tiger', '호랑이', 'current', '정글의 은밀한 사냥꾼', '은신술, 강력한 도약, 날카로운 발톱', '🐅', null, '#FF8C00'],
      [6, 'Panda', '판다', 'current', '대나무를 좋아하는 평화로운 곰', '대나무 소화, 귀여운 외모, 나무 타기', '🐼', null, '#000000'],
      
      // 전설의 동물
      [7, 'Unicorn', '유니콘', 'mythical', '이마에 뿔이 하나 달린 마법의 말이에요', '치유의 뿔, 마법 능력, 순간이동', '🦄', null, '#E6E6FA'],
      [8, 'Dragon', '드래곤', 'mythical', '불을 뿜는 거대한 날개 달린 도마뱀이에요', '불 뿜기, 비행, 보물 수호', '🐉', null, '#FF4500'],
      [9, 'Phoenix', '불사조', 'mythical', '불에서 다시 태어나는 신비한 새예요', '부활 능력, 치유의 눈물, 화염 조종', '🔥', null, '#FFA500'],
      [10, 'Pegasus', '페가수스', 'mythical', '날개 달린 천상의 말', '하늘 비행, 번개 속도, 신성한 보호', '🐴', null, '#FFFFFF'],
      [11, 'Griffin', '그리핀', 'mythical', '독수리와 사자가 합쳐진 수호자', '날카로운 시야, 강력한 비행, 보물 감지', '🦅', null, '#DAA520'],
      
      // 고생대 동물
      [12, 'Tyrannosaurus', '티라노사우루스', 'prehistoric', '가장 무서운 육식 공룡이에요', '엄청나게 강한 턱 힘을 가졌어요', '🦖', null, '#8B4513'],
      [13, 'Triceratops', '트리케라톱스', 'prehistoric', '뿔이 세 개 달린 초식 공룡이에요', '뿔로 자신을 지킬 수 있어요', '🦕', null, '#228B22'],
      [14, 'Pteranodon', '프테라노돈', 'prehistoric', '하늘을 나는 거대한 익룡이에요', '날개를 펴면 7미터나 돼요', '🦅', null, '#4682B4'],
      [15, 'Dimetrodon', '디메트로돈', 'prehistoric', '등에 큰 돛이 달린 고생대 파충류예요', '등의 돛으로 체온을 조절했어요', '🦎', null, '#DC143C'],
      [16, 'Anomalocaris', '아노말로카리스', 'prehistoric', '고생대 바다의 최강 포식자예요', '큰 집게로 먹이를 잡았어요', '🦐', null, '#FF6347'],
      [17, 'Trilobite', '삼엽충', 'prehistoric', '세 부분으로 나뉜 고생대 절지동물이에요', '복잡한 겹눈을 가졌어요', '🪲', null, '#708090'],
      [18, 'Dunkleosteus', '둔클레오스테우스', 'prehistoric', '장갑으로 둘러싸인 거대한 물고기예요', '이빨 대신 날카로운 뼈판을 가졌어요', '🐟', null, '#2F4F4F'],
      [19, 'Meganeura', '메가네우라', 'prehistoric', '독수리만큼 큰 고생대 잠자리예요', '날개 길이가 70cm나 됐어요', '🦟', null, '#00CED1'],
      [20, 'Arthropleura', '아스로플레우라', 'prehistoric', '자동차만큼 긴 거대한 노래기예요', '길이가 2.5미터나 됐어요', '🐛', null, '#8B4513']
    ];

    for (const animal of animals) {
      await db`
        INSERT INTO animals (id, name, korean_name, category, description, abilities, emoji, image_url, color)
        VALUES (${animal[0]}, ${animal[1]}, ${animal[2]}, ${animal[3]}, ${animal[4]}, ${animal[5]}, ${animal[6]}, ${animal[7]}, ${animal[8]})
      `;
    }
    
    console.log('✅ 동물 데이터 삽입 완료');
  }

  // Check and create admin settings
  const settingCount = await db`SELECT COUNT(*) as count FROM admin_settings`;
  
  if (settingCount[0].count === 0) {
    console.log('⚙️ 관리자 설정 생성 중...');
    
    const settings = [
      ['admin_password', await bcrypt.hash('1234', 10)],
      ['profanity_filter_enabled', 'true'],
      ['ten_commandments_filter_enabled', 'true'],
      ['max_warnings_before_suspension', '3'],
      ['daily_active_battle_limit', '10'],
      ['min_elo_difference_for_match', '200'],
      ['base_score_change', '50'],
      ['elo_k_factor', '32']
    ];

    for (const [key, value] of settings) {
      await db`
        INSERT INTO admin_settings (setting_key, setting_value)
        VALUES (${key}, ${value})
      `;
    }
    
    console.log('✅ 관리자 설정 완료');
  }

  // Create admin user
  const adminUser = await db`SELECT id FROM users WHERE email = 'admin@kidtextbattle.com'`;
  
  if (adminUser.length === 0) {
    console.log('👤 관리자 계정 생성 중...');
    
    await db`
      INSERT INTO users (id, email, is_guest, display_name)
      VALUES (${uuidv4()}, 'admin@kidtextbattle.com', false, '관리자')
    `;
    
    console.log('✅ 관리자 계정 생성 완료');
  }

  // Create admin users
  const adminUserCount = await db`SELECT COUNT(*) as count FROM admin_users`;
  
  if (adminUserCount[0].count === 0) {
    console.log('🦄 관리자 사용자 생성 중...');
    
    await db`
      INSERT INTO admin_users (id, username, password_hash, display_name)
      VALUES (${uuidv4()}, 'admin', ${await bcrypt.hash('1234', 10)}, '시스템 관리자')
    `;
    
    console.log('✅ 관리자 사용자 생성 완료 (username: admin, password: 1234)');
  }
}

// Export database instance for compatibility
export const db = {
  prepare: (query: string) => ({
    get: async (...params: any[]) => getOne(query, params),
    all: async (...params: any[]) => getAll(query, params),
    run: async (...params: any[]) => run(query, params)
  }),
  exec: async (query: string) => run(query),
  transaction: transaction
};