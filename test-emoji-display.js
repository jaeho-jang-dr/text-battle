const Database = require('better-sqlite3');
const db = new Database('kid-text-battle.db');

console.log('🎨 캐릭터 이모지 표시 테스트\n');

try {
  // 캐릭터와 동물 정보 조회
  const characters = db.prepare(`
    SELECT 
      c.id,
      c.character_name,
      c.active_battles_today,
      a.emoji,
      a.korean_name,
      a.name as english_name,
      u.email
    FROM characters c
    JOIN animals a ON c.animal_id = a.id
    JOIN users u ON c.user_id = u.id
    WHERE c.is_active = 1
    LIMIT 10
  `).all();

  console.log('📋 캐릭터 목록 (이모지 포함):');
  characters.forEach((char, index) => {
    console.log(`${index + 1}. ${char.emoji} ${char.character_name}`);
    console.log(`   동물: ${char.korean_name} (${char.english_name})`);
    console.log(`   오늘 배틀: ${char.active_battles_today}/10`);
    console.log(`   소유자: ${char.email || '게스트'}`);
    console.log('');
  });

  // 동물 목록 확인
  const animals = db.prepare('SELECT * FROM animals ORDER BY category, id').all();
  
  console.log('\n🦁 동물 이모지 목록:');
  let currentCategory = '';
  animals.forEach(animal => {
    if (animal.category !== currentCategory) {
      currentCategory = animal.category;
      console.log(`\n[${currentCategory}]`);
    }
    console.log(`  ${animal.emoji} ${animal.korean_name} (${animal.name})`);
  });

} catch (error) {
  console.error('❌ 오류:', error.message);
} finally {
  db.close();
}

console.log('\n✅ 테스트 완료!');