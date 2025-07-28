// Database initialization based on environment

export async function initializeAppDatabase() {
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    console.log('🐘 Using PostgreSQL database');
    const { initializeDatabase } = await import('./db-postgres');
    await initializeDatabase();
  } else {
    console.log('💾 Using SQLite database');
    const { initializeDatabase } = await import('./db');
    initializeDatabase();
  }
}