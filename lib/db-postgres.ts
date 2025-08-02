// PostgreSQL database module
// This module provides database operations using PostgreSQL

import { 
  getDb as getPostgresDb, 
  getOne as postgresGetOne, 
  getAll as postgresGetAll, 
  run as postgresRun, 
  transaction as postgresTransaction,
  initializeDatabase as postgresInitializeDatabase 
} from './postgres-db';

// Helper to convert SQLite ? placeholders to PostgreSQL $n placeholders
function convertPlaceholders(query: string): string {
  let index = 0;
  return query.replace(/\?/g, () => `$${++index}`);
}

// Export the database interface with SQLite-compatible API
export const db = {
  prepare: (query: string) => {
    const pgQuery = convertPlaceholders(query);
    return {
      get: async (...params: any[]) => postgresGetOne(pgQuery, params),
      all: async (...params: any[]) => postgresGetAll(pgQuery, params),
      run: async (...params: any[]) => postgresRun(pgQuery, params)
    };
  },
  exec: async (query: string) => postgresRun(query),
  transaction: postgresTransaction
};

// 데이터베이스 초기화
export async function initializeDatabase() {
  return postgresInitializeDatabase();
}