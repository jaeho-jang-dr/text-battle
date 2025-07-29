const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 데이터베이스 경로
const dbPath = path.join(__dirname, 'kid-text-battle.db');
const db = new Database(dbPath);

console.log('📝 샘플 로그 데이터 생성 중...');

// 기존 사용자와 캐릭터 조회
const users = db.prepare('SELECT * FROM users LIMIT 10').all();
const characters = db.prepare('SELECT * FROM characters LIMIT 20').all();
const battles = db.prepare('SELECT * FROM battles LIMIT 30').all();

// 현재 시간 기준으로 과거 시간 생성
const now = new Date();
const getRandomPastDate = (daysAgo) => {
  const date = new Date(now);
  date.setDate(date.getDate() - Math.random() * daysAgo);
  return date.toISOString();
};

// 샘플 로그 생성
const logs = [];

// 1. 사용자 로그인 로그
users.forEach((user, index) => {
  // 최근 7일간 랜덤 로그인
  const loginCount = Math.floor(Math.random() * 5) + 1;
  for (let i = 0; i < loginCount; i++) {
    logs.push({
      id: uuidv4(),
      admin_id: user.id,
      action_type: 'user_login',
      target_type: 'user_action',
      target_id: user.id,
      details: JSON.stringify({
        email: user.email || `guest_${user.id.substring(0, 8)}`,
        isGuest: user.is_guest === 1,
        displayName: user.display_name
      }),
      created_at: getRandomPastDate(7)
    });
  }
});

// 2. 캐릭터 생성 로그
characters.forEach((char) => {
  logs.push({
    id: uuidv4(),
    admin_id: char.user_id,
    action_type: 'character_created',
    target_type: 'user_action',
    target_id: char.id,
    details: JSON.stringify({
      characterId: char.id,
      characterName: char.character_name,
      animalId: char.animal_id
    }),
    created_at: char.created_at || getRandomPastDate(30)
  });
});

// 3. 배틀 생성 로그
battles.forEach((battle) => {
  logs.push({
    id: uuidv4(),
    admin_id: battle.attacker_id, // 실제로는 user_id여야 하지만 샘플이므로
    action_type: 'battle_created',
    target_type: 'user_action',
    target_id: battle.id,
    details: JSON.stringify({
      battleId: battle.id,
      attackerId: battle.attacker_id,
      defenderId: battle.defender_id,
      winner: battle.winner_id === battle.attacker_id ? 'attacker' : 'defender',
      isBot: false
    }),
    created_at: battle.created_at
  });
});

// 4. 관리자 로그인 로그
for (let i = 0; i < 5; i++) {
  logs.push({
    id: uuidv4(),
    admin_id: 'admin',
    action_type: 'admin_login',
    target_type: 'admin_action',
    target_id: null,
    details: JSON.stringify({
      username: 'admin'
    }),
    created_at: getRandomPastDate(7)
  });
}

// 5. 경고 발생 로그 (샘플)
for (let i = 0; i < 3; i++) {
  const randomUser = users[Math.floor(Math.random() * users.length)];
  if (randomUser) {
    logs.push({
      id: uuidv4(),
      admin_id: randomUser.id,
      action_type: 'warning_issued',
      target_type: 'user_action',
      target_id: randomUser.id,
      details: JSON.stringify({
        warningType: 'profanity',
        content: '부적절한 언어 감지',
        warningCount: Math.floor(Math.random() * 3) + 1
      }),
      created_at: getRandomPastDate(14)
    });
  }
}

// 6. 설정 변경 로그
const settingKeys = ['daily_active_battle_limit', 'max_warnings_before_suspension', 'elo_k_factor'];
settingKeys.forEach((key) => {
  logs.push({
    id: uuidv4(),
    admin_id: 'admin',
    action_type: 'setting_updated',
    target_type: 'setting',
    target_id: null,
    details: JSON.stringify({
      key: key,
      value: Math.floor(Math.random() * 50) + 10
    }),
    created_at: getRandomPastDate(30)
  });
});

// 로그 삽입
const insertLog = db.prepare(`
  INSERT INTO admin_logs (id, admin_id, action_type, target_type, target_id, details, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((logs) => {
  for (const log of logs) {
    try {
      insertLog.run(
        log.id,
        log.admin_id,
        log.action_type,
        log.target_type,
        log.target_id,
        log.details,
        log.created_at
      );
    } catch (error) {
      console.error('로그 삽입 오류:', error.message);
    }
  }
});

try {
  insertMany(logs);
  console.log(`✅ ${logs.length}개의 샘플 로그가 생성되었습니다!`);
} catch (error) {
  console.error('로그 생성 중 오류:', error);
}

// 통계 출력
const logStats = db.prepare(`
  SELECT action_type, COUNT(*) as count
  FROM admin_logs
  GROUP BY action_type
`).all();

console.log('\n📊 로그 통계:');
logStats.forEach(stat => {
  console.log(`  - ${stat.action_type}: ${stat.count}개`);
});

db.close();
console.log('\n🎉 샘플 로그 생성 완료!');