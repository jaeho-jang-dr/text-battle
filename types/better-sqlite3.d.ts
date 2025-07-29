// better-sqlite3의 타입 정의
declare module 'better-sqlite3' {
  interface Database {
    prepare<T = any>(sql: string): Statement<T>;
    exec(sql: string): void;
    pragma(sql: string): void;
    transaction<T extends (...args: any[]) => any>(fn: T): T;
  }

  interface Statement<T = any> {
    run(...params: any[]): RunResult;
    get(...params: any[]): T | undefined;
    all(...params: any[]): T[];
  }

  interface RunResult {
    changes: number;
    lastInsertRowid: number | string;
  }

  interface Options {
    readonly?: boolean;
    fileMustExist?: boolean;
    timeout?: number;
    verbose?: (message?: any, ...additionalArgs: any[]) => void;
  }

  function Database(filename: string, options?: Options): Database;

  export = Database;
}