const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'kid-text-battle.db');
const db = new Database(dbPath);

console.log('🤖 봇 배틀 테스트 시작...\n');

try {
  // 봇 캐릭터 찾기
  const botCharacters = db.prepare(`
    SELECT c.*, a.korean_name, a.emoji 
    FROM characters c
    JOIN animals a ON c.animal_id = a.id
    WHERE c.is_bot = 1
    LIMIT 5
  `).all();
  
  console.log('📋 봇 캐릭터 목록:');
  botCharacters.forEach((bot, index) => {
    console.log(`${index + 1}. ${bot.emoji} ${bot.character_name} - ELO: ${bot.elo_score}`);
  });
  
  // 일반 캐릭터 찾기
  const playerCharacter = db.prepare(`
    SELECT c.*, a.korean_name, a.emoji 
    FROM characters c
    JOIN animals a ON c.animal_id = a.id
    WHERE c.is_bot = 0
    LIMIT 1
  `).get();
  
  if (playerCharacter) {
    console.log(`\n🎮 플레이어 캐릭터: ${playerCharacter.emoji} ${playerCharacter.character_name}`);
    console.log(`   오늘 배틀 횟수: ${playerCharacter.active_battles_today}/10`);
    
    // API 테스트 URL 생성
    console.log('\n📡 배틀 API 테스트:');
    console.log(`POST http://localhost:3008/api/battles`);
    console.log(`Body: {`);
    console.log(`  "attackerId": "${playerCharacter.id}",`);
    console.log(`  "defenderId": "${botCharacters[0].id}" // 봇 캐릭터`);
    console.log(`}`);
    console.log('\n💡 봇과의 배틀은 일일 제한에 포함되지 않습니다!');
  }
  
  // 봇 배틀 통계
  const botBattles = db.prepare(`
    SELECT COUNT(*) as count
    FROM battles b
    JOIN characters c ON b.defender_id = c.id
    WHERE c.is_bot = 1
  `).get();
  
  console.log(`\n📊 봇 배틀 통계:`);
  console.log(`   총 봇 배틀 수: ${botBattles.count}회`);
  
} catch (error) {
  console.error('❌ 오류:', error.message);
} finally {
  db.close();
}

console.log('\n✅ 테스트 완료!');