// 데이터베이스 스키마 확인

const sqlite3 = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'kid-text-battle.db');
const db = new sqlite3(dbPath);

console.log('📊 battles 테이블 스키마:\n');

// battles 테이블 존재 확인
const tableExists = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name='battles'
`).get();

if (!tableExists) {
  console.log('❌ battles 테이블이 존재하지 않습니다!');
  
  // 다른 테이블 목록
  console.log('\n📋 존재하는 테이블 목록:');
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `).all();
  
  tables.forEach(table => {
    console.log(`   - ${table.name}`);
  });
} else {
  // battles 테이블 스키마
  const schema = db.prepare(`
    SELECT sql FROM sqlite_master 
    WHERE type='table' AND name='battles'
  `).get();
  
  console.log('테이블 생성 SQL:');
  console.log(schema.sql);
  
  // 컬럼 정보
  console.log('\n컬럼 정보:');
  const columns = db.prepare(`PRAGMA table_info(battles)`).all();
  columns.forEach(col => {
    console.log(`   - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
  });
}

db.close();