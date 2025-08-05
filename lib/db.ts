// Hybrid database module - supports both SQLite and PostgreSQL
// Based on USE_SQLITE environment variable

const USE_SQLITE = process.env.USE_SQLITE === 'true';
const IS_REPLIT = process.env.REPL_ID !== undefined;

let db: any;
let initializeDatabase: any;

if (IS_REPLIT) {
  console.log('🚀 Using Replit-optimized SQLite database');
  const replitModule = require('./db-replit');
  db = replitModule.db;
  initializeDatabase = replitModule.initializeDatabase;
} else if (USE_SQLITE) {
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