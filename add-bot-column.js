const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'kid-text-battle.db');
const db = new Database(dbPath);

console.log('🤖 대기 계정 시스템 업데이트 중...');

try {
  // is_bot 컬럼이 이미 있는지 확인
  const columns = db.prepare("PRAGMA table_info(characters)").all();
  const hasBotColumn = columns.some(col => col.name === 'is_bot');
  
  if (!hasBotColumn) {
    // is_bot 컬럼 추가
    db.prepare('ALTER TABLE characters ADD COLUMN is_bot INTEGER DEFAULT 0').run();
    console.log('✅ is_bot 컬럼 추가 완료');
  } else {
    console.log('ℹ️ is_bot 컬럼이 이미 존재합니다');
  }
  
  // 샘플 봇 캐릭터 생성 (대기 계정)
  const botCharacters = [
    { email: 'bot1@kidtextbattle.com', name: '연습용 사자', animalId: 1 },
    { email: 'bot2@kidtextbattle.com', name: '훈련용 코끼리', animalId: 2 },
    { email: 'bot3@kidtextbattle.com', name: '대기중 펭귄', animalId: 3 },
    { email: 'bot4@kidtextbattle.com', name: '연습 돌고래', animalId: 4 },
    { email: 'bot5@kidtextbattle.com', name: 'AI 유니콘', animalId: 7 }
  ];
  
  const { v4: uuidv4 } = require('uuid');
  
  // 봇 사용자 생성
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, email, is_guest, display_name)
    VALUES (?, ?, 0, ?)
  `);
  
  const insertCharacter = db.prepare(`
    INSERT INTO characters (
      id, user_id, animal_id, character_name, battle_text,
      base_score, elo_score, wins, losses, is_bot
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);
  
  const getUserId = db.prepare('SELECT id FROM users WHERE email = ?');
  
  botCharacters.forEach((bot, index) => {
    // 사용자 생성
    const userId = uuidv4();
    insertUser.run(userId, bot.email, `봇 ${index + 1}`);
    
    // 캐릭터 생성
    const characterId = uuidv4();
    const baseScore = 1000 + Math.floor(Math.random() * 500);
    const eloScore = 1300 + Math.floor(Math.random() * 400);
    const wins = Math.floor(Math.random() * 20);
    const losses = Math.floor(Math.random() * 15);
    
    insertCharacter.run(
      characterId,
      userId,
      bot.animalId,
      bot.name,
      '안녕! 나는 연습용 캐릭터야. 함께 배틀하자!',
      baseScore,
      eloScore,
      wins,
      losses
    );
    
    console.log(`✅ 봇 캐릭터 생성: ${bot.name}`);
  });
  
  // 기존 샘플 캐릭터들도 봇으로 표시
  db.prepare(`
    UPDATE characters 
    SET is_bot = 1 
    WHERE user_id IN (
      SELECT id FROM users 
      WHERE email LIKE 'sample%@kidtextbattle.com'
    )
  `).run();
  
  console.log('✅ 기존 샘플 캐릭터를 봇으로 표시');
  
  // 통계 확인
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(is_bot) as bots,
      SUM(1 - is_bot) as players
    FROM characters
    WHERE is_active = 1
  `).get();
  
  console.log(`\n📊 캐릭터 통계:`);
  console.log(`   전체: ${stats.total}개`);
  console.log(`   봇: ${stats.bots}개`);
  console.log(`   플레이어: ${stats.players}개`);
  
} catch (error) {
  console.error('❌ 오류:', error.message);
} finally {
  db.close();
}

console.log('\n🎉 대기 계정 시스템 업데이트 완료!');