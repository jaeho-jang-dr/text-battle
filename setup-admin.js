const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// 데이터베이스 경로
const dbPath = path.join(__dirname, 'kid-text-battle.db');
const db = new Database(dbPath);

console.log('🦄 관리자 시스템 초기화 중...');

// 관리자 사용자 테이블 생성
db.exec(`
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
`);

// 관리자 사용자 확인 및 생성
const adminUserCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get();

if (adminUserCount.count === 0) {
  console.log('🔐 관리자 계정 생성 중...');
  
  const adminId = uuidv4();
  const passwordHash = bcrypt.hashSync('1234', 10);
  
  db.prepare(`
    INSERT INTO admin_users (id, username, password_hash, display_name)
    VALUES (?, ?, ?, ?)
  `).run(adminId, 'admin', passwordHash, '시스템 관리자');
  
  console.log('✅ 관리자 계정 생성 완료!');
  console.log('📝 로그인 정보:');
  console.log('   - 사용자명: admin');
  console.log('   - 비밀번호: 1234');
  console.log('   - 접속 방법: 홈페이지 우측 하단 🦄 아이콘 클릭');
} else {
  console.log('✅ 관리자 계정이 이미 존재합니다.');
}

// 관리자 설정 확인
const settingCount = db.prepare('SELECT COUNT(*) as count FROM admin_settings').get();
console.log(`⚙️  관리자 설정: ${settingCount.count}개`);

db.close();
console.log('\n🎉 관리자 시스템 초기화 완료!');