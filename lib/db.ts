import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// 데이터베이스 파일 경로
const dbPath = path.join(process.cwd(), 'kid-text-battle.db');

// 데이터베이스 인스턴스
export const db = new (Database as any)(dbPath);

// WAL 모드 활성화 (성능 향상)
db.pragma('journal_mode = WAL');

// 데이터베이스 초기화
export function initializeDatabase() {
  console.log('🔧 데이터베이스 초기화 시작...');

  // 테이블 생성
  db.exec(`
    -- 사용자 테이블
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      is_guest INTEGER DEFAULT 0,
      display_name TEXT,
      warning_count INTEGER DEFAULT 0,
      is_suspended INTEGER DEFAULT 0,
      suspended_reason TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_login TEXT DEFAULT CURRENT_TIMESTAMP,
      login_token TEXT UNIQUE,
      token_expires_at TEXT
    );

    -- 동물 테이블
    CREATE TABLE IF NOT EXISTS animals (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      korean_name TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('current', 'mythical', 'prehistoric')),
      description TEXT,
      abilities TEXT,
      emoji TEXT,
      image_url TEXT,
      color TEXT
    );

    -- 캐릭터 테이블
    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
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
      is_active INTEGER DEFAULT 1,
      is_bot INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_battle_reset TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (animal_id) REFERENCES animals(id)
    );

    -- 배틀 테이블
    CREATE TABLE IF NOT EXISTS battles (
      id TEXT PRIMARY KEY,
      attacker_id TEXT NOT NULL,
      defender_id TEXT NOT NULL,
      battle_type TEXT NOT NULL CHECK (battle_type IN ('active', 'passive')),
      winner_id TEXT,
      attacker_score_change INTEGER DEFAULT 0,
      defender_score_change INTEGER DEFAULT 0,
      attacker_elo_change INTEGER DEFAULT 0,
      defender_elo_change INTEGER DEFAULT 0,
      ai_judgment TEXT,
      ai_reasoning TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (attacker_id) REFERENCES characters(id),
      FOREIGN KEY (defender_id) REFERENCES characters(id),
      FOREIGN KEY (winner_id) REFERENCES characters(id)
    );

    -- 경고 테이블
    CREATE TABLE IF NOT EXISTS warnings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      warning_type TEXT NOT NULL,
      content TEXT NOT NULL,
      character_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (character_id) REFERENCES characters(id)
    );

    -- 관리자 설정 테이블
    CREATE TABLE IF NOT EXISTS admin_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- 관리자 사용자 테이블
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      permissions TEXT DEFAULT 'all',
      is_active INTEGER DEFAULT 1,
      last_login TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- 관리자 로그 테이블
    CREATE TABLE IF NOT EXISTS admin_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT,
      action_type TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      details TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id)
    );

    -- 인덱스 생성
    CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
    CREATE INDEX IF NOT EXISTS idx_characters_scores ON characters(base_score DESC, elo_score DESC);
    CREATE INDEX IF NOT EXISTS idx_battles_created_at ON battles(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_battles_attacker ON battles(attacker_id);
    CREATE INDEX IF NOT EXISTS idx_battles_defender ON battles(defender_id);
    CREATE INDEX IF NOT EXISTS idx_warnings_user_id ON warnings(user_id);

    -- 뷰: 리더보드
    CREATE VIEW IF NOT EXISTS leaderboard AS
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
        THEN ROUND(CAST(c.wins AS REAL) / (c.wins + c.losses) * 100, 2) 
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
    WHERE c.is_active = 1 AND u.is_suspended = 0
    ORDER BY c.base_score DESC, c.elo_score DESC;
  `);

  console.log('✅ 테이블 생성 완료');

  // 동물 데이터 확인 및 삽입
  const animalCountResult = db.prepare('SELECT COUNT(*) as count FROM animals').get();
  const animalCount = animalCountResult as { count: number } | undefined;
  
  if (!animalCount || animalCount.count === 0) {
    console.log('🦁 동물 데이터 삽입 중...');
    
    const insertAnimal = db.prepare(`
      INSERT INTO animals (id, name, korean_name, category, description, abilities, emoji, image_url, color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

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

    const insertMany = db.transaction((animals: any[]) => {
      for (const animal of animals) {
        insertAnimal.run(...animal);
      }
    });

    insertMany(animals);
    console.log('✅ 동물 데이터 삽입 완료');
  }

  // 관리자 설정 확인 및 생성
  const settingCountResult = db.prepare('SELECT COUNT(*) as count FROM admin_settings').get();
  const settingCount = settingCountResult as { count: number } | undefined;
  
  if (!settingCount || settingCount.count === 0) {
    console.log('⚙️ 관리자 설정 생성 중...');
    
    const insertSetting = db.prepare(`
      INSERT INTO admin_settings (setting_key, setting_value)
      VALUES (?, ?)
    `);

    const settings = [
      ['admin_password', bcrypt.hashSync('1234', 10)],
      ['profanity_filter_enabled', 'true'],
      ['ten_commandments_filter_enabled', 'true'],
      ['max_warnings_before_suspension', '3'],
      ['daily_active_battle_limit', '10'],
      ['min_elo_difference_for_match', '200'],
      ['base_score_change', '50'],
      ['elo_k_factor', '32']
    ];

    const insertManySettings = db.transaction((settings: any[]) => {
      for (const setting of settings) {
        insertSetting.run(...setting);
      }
    });

    insertManySettings(settings);
    console.log('✅ 관리자 설정 완료');
  }

  // 관리자 계정 확인 및 생성
  const adminUser = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@kidtextbattle.com');
  
  if (!adminUser) {
    console.log('👤 관리자 계정 생성 중...');
    
    db.prepare(`
      INSERT INTO users (id, email, is_guest, display_name)
      VALUES (?, ?, ?, ?)
    `).run(uuidv4(), 'admin@kidtextbattle.com', 0, '관리자');
    
    console.log('✅ 관리자 계정 생성 완료');
  }

  // 관리자 사용자 확인 및 생성
  const adminUserCountResult = db.prepare('SELECT COUNT(*) as count FROM admin_users').get();
  const adminUserCount = adminUserCountResult as { count: number } | undefined;
  
  if (!adminUserCount || adminUserCount.count === 0) {
    console.log('🦄 관리자 사용자 생성 중...');
    
    db.prepare(`
      INSERT INTO admin_users (id, username, password_hash, display_name)
      VALUES (?, ?, ?, ?)
    `).run(uuidv4(), 'admin', bcrypt.hashSync('1234', 10), '시스템 관리자');
    
    console.log('✅ 관리자 사용자 생성 완료 (username: admin, password: 1234)');
  }

  // 샘플 데이터 생성
  const sampleUser = db.prepare('SELECT id FROM users WHERE email = ?').get('sample1@kidtextbattle.com');
  
  if (!sampleUser) {
    console.log('🎮 샘플 데이터 생성 중...');
    createSampleData();
  }

  console.log('✅ 데이터베이스 초기화 완료!');
}

// 샘플 데이터 생성 함수
function createSampleData() {
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, is_guest, display_name)
    VALUES (?, ?, ?, ?)
  `);

  const insertCharacter = db.prepare(`
    INSERT INTO characters (
      id, user_id, animal_id, character_name, battle_text,
      base_score, elo_score, wins, losses,
      total_active_battles, total_passive_battles
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    // 샘플 사용자 생성
    const users = [
      { id: uuidv4(), email: 'sample1@kidtextbattle.com', display_name: '용감한사자' },
      { id: uuidv4(), email: 'sample2@kidtextbattle.com', display_name: '날쌘독수리' },
      { id: uuidv4(), email: 'sample3@kidtextbattle.com', display_name: '지혜로운부엉이' },
      { id: uuidv4(), email: 'sample4@kidtextbattle.com', display_name: '강력한곰' },
      { id: uuidv4(), email: 'sample5@kidtextbattle.com', display_name: '빠른치타' }
    ];

    for (const user of users) {
      insertUser.run(user.id, user.email, 0, user.display_name);
    }

    // 샘플 캐릭터 생성
    const characters = [
      {
        id: uuidv4(),
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
        id: uuidv4(),
        user_id: users[1].id,
        animal_id: 7, // 유니콘
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
        id: uuidv4(),
        user_id: users[2].id,
        animal_id: 12, // 티라노사우루스
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
        id: uuidv4(),
        user_id: users[3].id,
        animal_id: 8, // 드래곤
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
        id: uuidv4(),
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

    for (const char of characters) {
      insertCharacter.run(
        char.id, char.user_id, char.animal_id, char.character_name, char.battle_text,
        char.base_score, char.elo_score, char.wins, char.losses,
        char.total_active_battles, char.total_passive_battles
      );
    }
  });

  transaction();
  console.log('✅ 샘플 데이터 생성 완료');
}

// 데이터베이스 초기화 실행
initializeDatabase();