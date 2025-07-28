// 배틀 에러 상세 확인

const sqlite3 = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'kid-text-battle.db');
const db = new sqlite3(dbPath);

// 새로 생성된 캐릭터 확인
console.log('📊 새로 생성된 캐릭터 확인:\n');
const newChars = db.prepare(`
  SELECT c.*, a.emoji, a.korean_name
  FROM characters c
  JOIN animals a ON c.animal_id = a.id
  WHERE c.character_name IN ('용감한 사자왕', '강력한 호랑이')
`).all();

newChars.forEach(char => {
  console.log(`${char.emoji} ${char.character_name} (${char.korean_name})`);
  console.log(`   - ID: ${char.id}`);
  console.log(`   - 배틀 텍스트: ${char.battle_text}`);
  console.log(`   - 점수: ${char.base_score} (ELO: ${char.elo_score})`);
  console.log(`   - 생성일: ${char.created_at}\n`);
});

// 최근 배틀 확인
console.log('⚔️ 최근 배틀 기록:\n');
const recentBattles = db.prepare(`
  SELECT * FROM battles 
  ORDER BY created_at DESC 
  LIMIT 5
`).all();

if (recentBattles.length === 0) {
  console.log('최근 배틀 기록이 없습니다.');
} else {
  recentBattles.forEach(battle => {
    console.log(`배틀 ID: ${battle.id}`);
    console.log(`   - 승자: ${battle.winner}`);
    console.log(`   - 판정: ${battle.judgment}`);
    console.log(`   - 생성일: ${battle.created_at}\n`);
  });
}

// 전체 캐릭터 수
const totalChars = db.prepare('SELECT COUNT(*) as count FROM characters WHERE is_active = 1').get();
console.log(`\n📈 전체 활성 캐릭터 수: ${totalChars.count}개`);

db.close();