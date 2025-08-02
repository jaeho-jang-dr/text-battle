import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// 데이터베이스 파일 경로
const dbPath = path.join(process.cwd(), 'kid-text-battle.db');

// 데이터베이스 인스턴스
export const sqliteDb = new (Database as any)(dbPath);

// WAL 모드 활성화 (성능 향상)
sqliteDb.pragma('journal_mode = WAL');

// SQLite 호환 인터페이스
export const db = {
  prepare: (query: string) => {
    const stmt = sqliteDb.prepare(query);
    return {
      get: (...params: any[]) => stmt.get(...params),
      all: (...params: any[]) => stmt.all(...params),
      run: (...params: any[]) => stmt.run(...params)
    };
  },
  exec: (query: string) => sqliteDb.exec(query),
  transaction: (fn: Function) => sqliteDb.transaction(fn)(),
  pragma: (pragma: string) => sqliteDb.pragma(pragma)
};

// Export the function with correct name
export { initializeAppDatabase as initializeDatabase } from './db-init';
export * from './db-init';