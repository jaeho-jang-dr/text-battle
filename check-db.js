// 데이터베이스 내용 확인 스크립트
const Database = require('better-sqlite3');
const db = new Database('kid-text-battle.db');

console.log('📊 Kid Text Battle 데이터베이스 현황\n');

// 테이블별 레코드 수 확인
const tables = ['users', 'characters', 'animals', 'battles', 'warnings', 'admin_settings'];

tables.forEach(table => {
  const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
  console.log(`${table}: ${count.count}개`);
});

console.log('\n🦁 샘플 캐릭터 목록:');
const characters = db.prepare(`
  SELECT c.character_name, a.korean_name, a.emoji, c.base_score, u.display_name
  FROM characters c
  JOIN animals a ON c.animal_id = a.id
  JOIN users u ON c.user_id = u.id
  ORDER BY c.base_score DESC
`).all();

characters.forEach((char, index) => {
  console.log(`${index + 1}. ${char.emoji} ${char.character_name} (${char.korean_name}) - ${char.base_score}점 [${char.display_name}]`);
});

db.close();