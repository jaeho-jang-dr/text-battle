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
  
  // Import and run all table creation scripts
  require('./tables/users');
  require('./tables/animals');
  require('./tables/characters');
  require('./tables/battles');
  require('./tables/admin_users');
  
  console.log('✅ Database initialization complete!');
  
  // Log database info
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log(`📊 Tables created: ${tables.map(t => t.name).join(', ')}`);
};

// Auto-initialize on first import
if (process.env.NODE_ENV !== 'test') {
  initializeDatabase();
}

export { db, initializeDatabase };