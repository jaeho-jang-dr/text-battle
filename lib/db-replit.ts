// Replit-optimized database configuration
// Automatically uses SQLite with proper paths for Replit environment

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Replit-specific database path handling
const getDbPath = () => {
  if (process.env.REPL_ID) {
    // Replit environment - use persistent storage
    const replitDbDir = `/home/runner/${process.env.REPL_SLUG}/data`;
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(replitDbDir)) {
      fs.mkdirSync(replitDbDir, { recursive: true });
    }
    
    return path.join(replitDbDir, 'kid-text-battle.db');
  }
  
  // Local development
  return path.join(process.cwd(), 'kid-text-battle.db');
};

const dbPath = getDbPath();
console.log(`📂 Database path: ${dbPath}`);

// Create database instance with optimized settings
const db = new Database(dbPath);

// Performance optimizations for Replit
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = 10000');
db.pragma('temp_store = MEMORY');
db.pragma('mmap_size = 30000000000');

// Initialize database schema
const initializeDatabase = () => {
  console.log('🔧 Initializing Replit-optimized database...');
  
  try {
    // Import the main SQLite initialization module instead
    const sqliteModule = require('./db-sqlite');
    
    // Use the existing initialization from db-sqlite
    if (sqliteModule.initializeDatabase) {
      sqliteModule.initializeDatabase.call({ db });
    } else {
      // Fallback: manually create tables if needed
      console.log('⚠️ Using fallback table creation...');
      
      // Create tables directly here
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          username TEXT,
          password_hash TEXT,
          login_token TEXT UNIQUE,
          token_expires_at DATETIME,
          warnings INTEGER DEFAULT 0,
          suspension_count INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS animals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          korean_name TEXT NOT NULL,
          emoji TEXT NOT NULL,
          description TEXT,
          abilities TEXT,
          category TEXT,
          attack_power INTEGER,
          strength INTEGER,
          speed INTEGER,
          energy INTEGER,
          color TEXT
        );
        
        CREATE TABLE IF NOT EXISTS characters (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          animal_id INTEGER NOT NULL,
          character_name TEXT NOT NULL,
          base_score INTEGER DEFAULT 1000,
          elo_score INTEGER DEFAULT 1500,
          daily_battles INTEGER DEFAULT 0,
          last_battle_date DATE,
          is_bot INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (animal_id) REFERENCES animals(id)
        );
        
        CREATE TABLE IF NOT EXISTS battles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          attacker_id INTEGER NOT NULL,
          defender_id INTEGER NOT NULL,
          winner_id INTEGER,
          attacker_score_change INTEGER,
          defender_score_change INTEGER,
          attacker_elo_change INTEGER,
          defender_elo_change INTEGER,
          ai_judgment TEXT,
          ai_reasoning TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (attacker_id) REFERENCES characters(id),
          FOREIGN KEY (defender_id) REFERENCES characters(id),
          FOREIGN KEY (winner_id) REFERENCES characters(id)
        );
        
        CREATE TABLE IF NOT EXISTS admin_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }
    
    console.log('✅ Database initialization complete!');
    
    // Log database info
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log(`📊 Tables created: ${tables.map((t: any) => t.name).join(', ')}`);
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

// Auto-initialize on first import
if (process.env.NODE_ENV !== 'test') {
  initializeDatabase();
}

export { db, initializeDatabase };