// Hybrid database module - supports both SQLite and PostgreSQL
// Based on USE_SQLITE environment variable

const USE_SQLITE = process.env.USE_SQLITE !== 'false'; // 기본값을 SQLite로 변경

let db: any;
let initializeDatabase: any;

if (USE_SQLITE) {
  console.log('🗄️  Using SQLite database');
  const sqliteModule = require('./db-sqlite');
  db = sqliteModule.db;
  initializeDatabase = sqliteModule.initializeDatabase;
} else {
  console.log('🐘 Using PostgreSQL database');
  const postgresModule = require('./db-postgres');
  db = postgresModule.db;
  initializeDatabase = postgresModule.initializeDatabase;
}

export { db, initializeDatabase };