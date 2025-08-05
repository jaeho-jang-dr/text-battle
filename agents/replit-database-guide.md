# Replit 데이터베이스 완벽 가이드 🗄️

## 데이터베이스 선택 가이드

### 🥇 1순위: SQLite (강력 추천)
**장점:**
- 설정 불필요 (Zero Config)
- 파일 기반으로 백업 쉬움
- 빠른 성능
- Replit에 최적화

**단점:**
- 동시 쓰기 제한
- 대용량 데이터 한계

**설정 코드:**
```javascript
// lib/sqlite-db.js
const Database = require('better-sqlite3');
const path = require('path');

// Replit 환경 대응
const dbPath = process.env.REPL_ID 
  ? `/home/runner/${process.env.REPL_SLUG}/data.db`
  : './data.db';

const db = new Database(dbPath);

// 성능 최적화
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = 10000');
db.pragma('temp_store = MEMORY');

// 초기 테이블 생성
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`);

module.exports = db;
```

### 🥈 2순위: Replit Database
**장점:**
- Replit 네이티브 지원
- 자동 백업
- Key-Value 스토어
- 무료

**단점:**
- 관계형 데이터 어려움
- 복잡한 쿼리 불가능

**설정 코드:**
```javascript
// lib/replit-db.js
const Database = require("@replit/database");
const db = new Database();

class ReplitDBWrapper {
  // User 관련 메서드
  async createUser(email, data) {
    const userId = `user:${Date.now()}`;
    const userData = {
      id: userId,
      email,
      ...data,
      createdAt: new Date().toISOString()
    };
    
    await db.set(userId, userData);
    await db.set(`email:${email}`, userId);
    return userData;
  }
  
  async findUserByEmail(email) {
    const userId = await db.get(`email:${email}`);
    if (!userId) return null;
    return await db.get(userId);
  }
  
  async updateUser(userId, updates) {
    const user = await db.get(userId);
    if (!user) return null;
    
    const updated = { ...user, ...updates };
    await db.set(userId, updated);
    return updated;
  }
  
  // 범용 메서드
  async save(collection, id, data) {
    const key = `${collection}:${id}`;
    await db.set(key, {
      ...data,
      _id: id,
      _collection: collection,
      _updatedAt: new Date().toISOString()
    });
    return data;
  }
  
  async find(collection, filter = {}) {
    const keys = await db.list(`${collection}:`);
    const results = [];
    
    for (const key of keys) {
      const item = await db.get(key);
      let match = true;
      
      for (const [field, value] of Object.entries(filter)) {
        if (item[field] !== value) {
          match = false;
          break;
        }
      }
      
      if (match) results.push(item);
    }
    
    return results;
  }
}

module.exports = new ReplitDBWrapper();
```

### 🥉 3순위: PostgreSQL (Neon/Supabase)
**장점:**
- 완전한 SQL 지원
- 대용량 데이터 가능
- 관계형 데이터베이스

**단점:**
- 외부 서비스 필요
- 설정 복잡
- 네트워크 지연

**Neon 설정:**
```javascript
// lib/postgres-db.js
const { Pool } = require('pg');

// Neon 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // 연결 풀 최적화
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 헬퍼 함수들
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executed', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// 트랜잭션 헬퍼
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { query, transaction, pool };
```

## 마이그레이션 시스템

### SQLite 마이그레이션
```javascript
// lib/migrations/sqlite-migrate.js
const db = require('../sqlite-db');
const fs = require('fs');
const path = require('path');

const runMigrations = () => {
  // 마이그레이션 테이블 생성
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 마이그레이션 파일 읽기
  const migrationsDir = path.join(__dirname, 'sqlite');
  const files = fs.readdirSync(migrationsDir).sort();
  
  // 실행된 마이그레이션 확인
  const executed = db.prepare('SELECT filename FROM migrations').all();
  const executedFiles = new Set(executed.map(m => m.filename));
  
  // 새 마이그레이션 실행
  for (const file of files) {
    if (!executedFiles.has(file)) {
      console.log(`Running migration: ${file}`);
      
      const migration = require(path.join(migrationsDir, file));
      migration.up(db);
      
      db.prepare('INSERT INTO migrations (filename) VALUES (?)').run(file);
      console.log(`✅ Migration completed: ${file}`);
    }
  }
};

module.exports = { runMigrations };
```

### 마이그레이션 예제
```javascript
// lib/migrations/sqlite/001-create-users.js
module.exports = {
  up: (db) => {
    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        profile_data JSON,
        is_active BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_username ON users(username);
    `);
  },
  
  down: (db) => {
    db.exec('DROP TABLE IF EXISTS users');
  }
};
```

## 데이터베이스 백업 시스템

### 자동 백업 스크립트
```javascript
// scripts/backup-db.js
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

class DatabaseBackup {
  constructor() {
    this.backupDir = process.env.REPL_ID 
      ? `/home/runner/${process.env.REPL_SLUG}/backups`
      : './backups';
      
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }
  
  // SQLite 백업
  backupSQLite() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dbPath = process.env.REPL_ID 
      ? `/home/runner/${process.env.REPL_SLUG}/data.db`
      : './data.db';
      
    const backupPath = path.join(this.backupDir, `backup-${timestamp}.db`);
    
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath);
      console.log(`✅ SQLite backup created: ${backupPath}`);
      
      // 압축
      const { execSync } = require('child_process');
      execSync(`gzip ${backupPath}`);
      console.log(`📦 Backup compressed: ${backupPath}.gz`);
    }
  }
  
  // Replit DB 백업
  async backupReplitDB() {
    const Database = require("@replit/database");
    const db = new Database();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `replit-backup-${timestamp}.json`);
    
    const allKeys = await db.list();
    const backup = {};
    
    for (const key of allKeys) {
      backup[key] = await db.get(key);
    }
    
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    console.log(`✅ Replit DB backup created: ${backupPath}`);
  }
  
  // 오래된 백업 정리
  cleanOldBackups(daysToKeep = 7) {
    const files = fs.readdirSync(this.backupDir);
    const now = Date.now();
    
    files.forEach(file => {
      const filePath = path.join(this.backupDir, file);
      const stats = fs.statSync(filePath);
      const age = (now - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
      
      if (age > daysToKeep) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted old backup: ${file}`);
      }
    });
  }
}

// 자동 백업 스케줄
const backup = new DatabaseBackup();

// 매일 새벽 3시 백업
cron.schedule('0 3 * * *', () => {
  console.log('🔄 Starting scheduled backup...');
  backup.backupSQLite();
  backup.cleanOldBackups();
});

module.exports = backup;
```

## 성능 최적화 팁

### 1. 연결 풀링
```javascript
// 잘못된 예
app.get('/users', async (req, res) => {
  const db = new Database('app.db'); // 매번 새 연결
  const users = db.prepare('SELECT * FROM users').all();
  db.close();
  res.json(users);
});

// 올바른 예
const db = new Database('app.db'); // 한 번만 연결
app.get('/users', async (req, res) => {
  const users = db.prepare('SELECT * FROM users').all();
  res.json(users);
});
```

### 2. 인덱스 활용
```sql
-- 자주 검색하는 컬럼에 인덱스 추가
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
```

### 3. 쿼리 최적화
```javascript
// Prepared statements 사용
const getUser = db.prepare('SELECT * FROM users WHERE id = ?');
const updateUser = db.prepare('UPDATE users SET name = ? WHERE id = ?');

// 트랜잭션으로 묶기
const insertMany = db.transaction((items) => {
  const insert = db.prepare('INSERT INTO items VALUES (?, ?)');
  for (const item of items) insert.run(item.name, item.value);
});
```

## 문제 해결 가이드

### "Database is locked" 에러
```javascript
// 해결: WAL 모드 사용
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');
```

### 메모리 부족
```javascript
// 해결: 배치 처리
const batchProcess = async (items, batchSize = 100) => {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await processBatch(batch);
  }
};
```

### 느린 쿼리
```javascript
// 해결: EXPLAIN으로 분석
const result = db.prepare('EXPLAIN QUERY PLAN SELECT ...').all();
console.log(result);
```

이제 Replit에서 어떤 데이터베이스든 완벽하게 설정할 수 있습니다! 🎉