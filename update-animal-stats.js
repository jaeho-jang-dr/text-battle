const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'kid-text-battle.db');
const db = new Database(dbPath);

// 동물별 고유 능력치 설정
const animalStats = {
  // 현존 동물들 (current)
  'Lion': { attack_power: 85, strength: 90, speed: 75, energy: 80 },
  'Elephant': { attack_power: 70, strength: 100, speed: 40, energy: 90 },
  'Penguin': { attack_power: 30, strength: 40, speed: 60, energy: 70 },
  'Dolphin': { attack_power: 45, strength: 60, speed: 90, energy: 85 },
  'Tiger': { attack_power: 90, strength: 85, speed: 80, energy: 75 },
  'Panda': { attack_power: 50, strength: 75, speed: 35, energy: 60 },
  'Eagle': { attack_power: 75, strength: 55, speed: 95, energy: 70 },
  'Giraffe': { attack_power: 40, strength: 70, speed: 55, energy: 65 },
  'Zebra': { attack_power: 35, strength: 60, speed: 85, energy: 75 },
  'Kangaroo': { attack_power: 65, strength: 70, speed: 70, energy: 80 },
  'Monkey': { attack_power: 45, strength: 50, speed: 80, energy: 90 },
  'Bear': { attack_power: 80, strength: 95, speed: 45, energy: 70 },
  'Wolf': { attack_power: 75, strength: 70, speed: 85, energy: 85 },
  'Fox': { attack_power: 55, strength: 45, speed: 75, energy: 70 },
  'Rabbit': { attack_power: 20, strength: 25, speed: 90, energy: 80 },
  'Turtle': { attack_power: 25, strength: 80, speed: 20, energy: 95 },
  'Octopus': { attack_power: 60, strength: 55, speed: 50, energy: 75 },
  'Whale': { attack_power: 85, strength: 100, speed: 60, energy: 100 },
  'Shark': { attack_power: 95, strength: 85, speed: 85, energy: 80 },
  'Crocodile': { attack_power: 90, strength: 90, speed: 30, energy: 85 },
  'Hippo': { attack_power: 85, strength: 95, speed: 35, energy: 80 },
  'Rhino': { attack_power: 80, strength: 95, speed: 50, energy: 75 },
  'Camel': { attack_power: 40, strength: 70, speed: 60, energy: 100 },
  'Llama': { attack_power: 30, strength: 50, speed: 65, energy: 85 },
  'Koala': { attack_power: 25, strength: 40, speed: 30, energy: 50 },
  'Sloth': { attack_power: 20, strength: 35, speed: 15, energy: 40 },
  'Otter': { attack_power: 40, strength: 45, speed: 70, energy: 80 },
  'Beaver': { attack_power: 35, strength: 55, speed: 45, energy: 75 },
  'Hedgehog': { attack_power: 30, strength: 35, speed: 50, energy: 60 },
  'Bat': { attack_power: 35, strength: 30, speed: 85, energy: 65 },
  'Raccoon': { attack_power: 45, strength: 50, speed: 65, energy: 75 },
  'Skunk': { attack_power: 40, strength: 35, speed: 45, energy: 55 },
  'Badger': { attack_power: 60, strength: 65, speed: 50, energy: 70 },
  'Swan': { attack_power: 35, strength: 45, speed: 65, energy: 60 },
  'Peacock': { attack_power: 40, strength: 40, speed: 55, energy: 65 },
  'Parrot': { attack_power: 30, strength: 35, speed: 75, energy: 70 },
  'Flamingo': { attack_power: 25, strength: 40, speed: 60, energy: 65 },
  'Turkey': { attack_power: 35, strength: 50, speed: 40, energy: 60 },
  'Duck': { attack_power: 25, strength: 35, speed: 65, energy: 70 },
  'Owl': { attack_power: 60, strength: 50, speed: 70, energy: 75 },
  'Chicken': { attack_power: 20, strength: 30, speed: 45, energy: 55 },
  'Pig': { attack_power: 45, strength: 65, speed: 35, energy: 70 },
  'Cow': { attack_power: 40, strength: 80, speed: 30, energy: 75 },
  'Goat': { attack_power: 35, strength: 55, speed: 60, energy: 80 },
  'Sheep': { attack_power: 20, strength: 45, speed: 50, energy: 65 },
  'Horse': { attack_power: 55, strength: 85, speed: 95, energy: 90 },
  'Dog': { attack_power: 50, strength: 60, speed: 75, energy: 85 },
  'Cat': { attack_power: 40, strength: 35, speed: 85, energy: 70 },
  'Mouse': { attack_power: 15, strength: 20, speed: 95, energy: 75 },
  'Hamster': { attack_power: 10, strength: 15, speed: 70, energy: 65 },
  
  // 전설의 동물들 (mythical) - 더 높은 능력치
  'Unicorn': { attack_power: 80, strength: 85, speed: 95, energy: 100 },
  'Dragon': { attack_power: 100, strength: 100, speed: 85, energy: 95 },
  'Phoenix': { attack_power: 90, strength: 70, speed: 90, energy: 100 },
  'Pegasus': { attack_power: 75, strength: 80, speed: 100, energy: 90 },
  'Griffin': { attack_power: 95, strength: 90, speed: 85, energy: 85 },
  'Mermaid': { attack_power: 65, strength: 60, speed: 80, energy: 90 },
  'Centaur': { attack_power: 85, strength: 85, speed: 90, energy: 85 },
  'Minotaur': { attack_power: 95, strength: 100, speed: 60, energy: 80 },
  'Sphinx': { attack_power: 80, strength: 85, speed: 70, energy: 95 },
  'Hydra': { attack_power: 100, strength: 95, speed: 50, energy: 100 },
  'Cerberus': { attack_power: 95, strength: 90, speed: 75, energy: 85 },
  'Kraken': { attack_power: 100, strength: 100, speed: 40, energy: 90 },
  'Basilisk': { attack_power: 90, strength: 70, speed: 85, energy: 80 },
  'Chimera': { attack_power: 95, strength: 85, speed: 80, energy: 85 },
  'Leprechaun': { attack_power: 40, strength: 35, speed: 90, energy: 95 },
  
  // 고생대 동물들 (prehistoric) - 다양한 능력치
  'Tyrannosaurus': { attack_power: 100, strength: 95, speed: 65, energy: 85 },
  'Triceratops': { attack_power: 75, strength: 90, speed: 45, energy: 80 },
  'Pteranodon': { attack_power: 65, strength: 50, speed: 90, energy: 75 },
  'Dimetrodon': { attack_power: 70, strength: 75, speed: 55, energy: 70 },
  'Anomalocaris': { attack_power: 60, strength: 55, speed: 70, energy: 65 },
  'Trilobite': { attack_power: 25, strength: 70, speed: 30, energy: 60 },
  'Dunkleosteus': { attack_power: 90, strength: 85, speed: 60, energy: 75 },
  'Meganeura': { attack_power: 50, strength: 40, speed: 95, energy: 70 },
  'Arthropleura': { attack_power: 55, strength: 80, speed: 40, energy: 85 },
  'Edaphosaurus': { attack_power: 60, strength: 70, speed: 50, energy: 75 },
  'Hallucigenia': { attack_power: 30, strength: 35, speed: 45, energy: 55 },
  'Opabinia': { attack_power: 45, strength: 40, speed: 60, energy: 65 },
  'Eurypterid': { attack_power: 75, strength: 70, speed: 65, energy: 70 },
  'Brachiosaurus': { attack_power: 65, strength: 100, speed: 35, energy: 90 },
  'Stegosaurus': { attack_power: 70, strength: 85, speed: 40, energy: 75 }
};

console.log('🦁 동물 능력치 업데이트 시작...\n');

try {
  db.pragma('foreign_keys = OFF');
  
  const updateStmt = db.prepare(`
    UPDATE animals 
    SET attack_power = ?, strength = ?, speed = ?, energy = ? 
    WHERE name = ?
  `);
  
  let updatedCount = 0;
  
  for (const [animalName, stats] of Object.entries(animalStats)) {
    const result = updateStmt.run(
      stats.attack_power,
      stats.strength,
      stats.speed,
      stats.energy,
      animalName
    );
    
    if (result.changes > 0) {
      updatedCount++;
      console.log(`✅ ${animalName}: 공격력=${stats.attack_power}, 힘=${stats.strength}, 속도=${stats.speed}, 에너지=${stats.energy}`);
    }
  }
  
  console.log(`\n📊 총 ${updatedCount}마리의 동물 능력치가 업데이트되었습니다!`);
  
  // 업데이트 확인
  console.log('\n🔍 카테고리별 평균 능력치:');
  const categories = ['current', 'mythical', 'prehistoric'];
  
  for (const category of categories) {
    const avgStats = db.prepare(`
      SELECT 
        category,
        ROUND(AVG(attack_power)) as avg_attack,
        ROUND(AVG(strength)) as avg_strength,
        ROUND(AVG(speed)) as avg_speed,
        ROUND(AVG(energy)) as avg_energy
      FROM animals 
      WHERE category = ?
    `).get(category);
    
    console.log(`\n${category === 'current' ? '🌍 현존' : category === 'mythical' ? '✨ 전설' : '🦖 고생대'} 동물:`);
    console.log(`  평균 공격력: ${avgStats.avg_attack}`);
    console.log(`  평균 힘: ${avgStats.avg_strength}`);
    console.log(`  평균 속도: ${avgStats.avg_speed}`);
    console.log(`  평균 에너지: ${avgStats.avg_energy}`);
  }
  
  db.pragma('foreign_keys = ON');
  console.log('\n✅ 동물 능력치 업데이트 완료!');
  
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
} finally {
  db.close();
}