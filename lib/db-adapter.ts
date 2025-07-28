// Database adapter to support both SQLite (dev) and PostgreSQL (production)

interface QueryResult {
  rows?: any[];
  [key: string]: any;
}

interface DbAdapter {
  query(sql: string, params?: any[]): Promise<QueryResult> | QueryResult;
  run(sql: string, params?: any[]): Promise<any> | any;
  get(sql: string, params?: any[]): Promise<any> | any;
  all(sql: string, params?: any[]): Promise<any[]> | any[];
  prepare(sql: string): any;
  exec(sql: string): void;
  close?(): void;
}

class SQLiteAdapter implements DbAdapter {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  query(sql: string, params?: any[]): QueryResult {
    const stmt = this.db.prepare(sql);
    const rows = params ? stmt.all(...params) : stmt.all();
    return { rows };
  }

  run(sql: string, params?: any[]) {
    const stmt = this.db.prepare(sql);
    return params ? stmt.run(...params) : stmt.run();
  }

  get(sql: string, params?: any[]) {
    const stmt = this.db.prepare(sql);
    return params ? stmt.get(...params) : stmt.get();
  }

  all(sql: string, params?: any[]) {
    const stmt = this.db.prepare(sql);
    return params ? stmt.all(...params) : stmt.all();
  }

  prepare(sql: string) {
    return this.db.prepare(sql);
  }

  exec(sql: string) {
    this.db.exec(sql);
  }

  close() {
    this.db.close();
  }
}

class PostgreSQLAdapter implements DbAdapter {
  private pool: any;

  constructor(pool: any) {
    this.pool = pool;
  }

  async query(sql: string, params?: any[]): Promise<QueryResult> {
    // Convert SQLite placeholders (?) to PostgreSQL ($1, $2, etc)
    let pgSql = sql;
    let paramIndex = 1;
    while (pgSql.includes('?')) {
      pgSql = pgSql.replace('?', `$${paramIndex}`);
      paramIndex++;
    }
    
    const result = await this.pool.query(pgSql, params);
    return result;
  }

  async run(sql: string, params?: any[]) {
    const result = await this.query(sql, params);
    return {
      changes: result.rowCount,
      lastInsertRowid: result.rows[0]?.id
    };
  }

  async get(sql: string, params?: any[]) {
    const result = await this.query(sql, params);
    return result.rows[0];
  }

  async all(sql: string, params?: any[]) {
    const result = await this.query(sql, params);
    return result.rows;
  }

  prepare(sql: string) {
    // For PostgreSQL, return a function that executes the query
    return {
      all: async (...params: any[]) => {
        const result = await this.query(sql, params);
        return result.rows;
      },
      get: async (...params: any[]) => {
        const result = await this.query(sql, params);
        return result.rows[0];
      },
      run: async (...params: any[]) => {
        const result = await this.query(sql, params);
        return {
          changes: result.rowCount,
          lastInsertRowid: result.rows[0]?.id
        };
      }
    };
  }

  async exec(sql: string) {
    await this.pool.query(sql);
  }
}

export function createDbAdapter(database: any, type: 'sqlite' | 'postgres' = 'sqlite'): DbAdapter {
  if (type === 'postgres') {
    return new PostgreSQLAdapter(database);
  }
  return new SQLiteAdapter(database);
}

// Get appropriate database instance based on environment
export function getDatabase(): DbAdapter {
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    // Use PostgreSQL in production
    const { getDb } = require('./db-postgres');
    return createDbAdapter(getDb(), 'postgres');
  } else {
    // Use SQLite in development
    const { db } = require('./db');
    return createDbAdapter(db, 'sqlite');
  }
}