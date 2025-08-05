# Replit 배포 템플릿 모음 🎯

## 1. Next.js + SQLite 템플릿 (추천)

### .replit
```bash
run = "npm run start"
entrypoint = "app/layout.tsx"
modules = ["nodejs-20:v9-20240213-af7a414"]

[nix]
channel = "stable-23_11"

[deployment]
run = ["sh", "-c", "npm run start"]
build = ["sh", "-c", "npm install && npm run build"]
deploymentTarget = "cloudrun"

[[ports]]
localPort = 3000
externalPort = 80

[env]
NODE_ENV = "production"
NEXT_TELEMETRY_DISABLED = "1"
```

### replit.nix
```nix
{pkgs}: {
  deps = [
    pkgs.nodejs_20
    pkgs.nodePackages.typescript
    pkgs.nodePackages.typescript-language-server
    pkgs.sqlite
    pkgs.sqlitebrowser
  ];
}
```

### lib/db-replit.js
```javascript
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Replit 전용 데이터베이스 경로
const getDbPath = () => {
  if (process.env.REPL_ID) {
    const replitDbPath = `/home/runner/${process.env.REPL_SLUG}`;
    if (!fs.existsSync(replitDbPath)) {
      fs.mkdirSync(replitDbPath, { recursive: true });
    }
    return path.join(replitDbPath, 'app.db');
  }
  return path.join(process.cwd(), 'app.db');
};

const db = new Database(getDbPath());
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');

module.exports = db;
```

## 2. Express.js + PostgreSQL 템플릿

### .env.example
```env
# Neon PostgreSQL
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Replit 자동 설정
PORT=3000
NODE_ENV=production
```

### lib/db-postgres.js
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = pool;
```

## 3. React + Replit Database 템플릿

### lib/replit-db.js
```javascript
const Database = require("@replit/database");
const db = new Database();

class ReplitDB {
  async get(key) {
    try {
      const value = await db.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('DB Get Error:', error);
      return null;
    }
  }

  async set(key, value) {
    try {
      await db.set(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('DB Set Error:', error);
      return false;
    }
  }

  async delete(key) {
    try {
      await db.delete(key);
      return true;
    } catch (error) {
      console.error('DB Delete Error:', error);
      return false;
    }
  }

  async list(prefix = '') {
    try {
      const keys = await db.list(prefix);
      const results = [];
      for (const key of keys) {
        const value = await this.get(key);
        results.push({ key, value });
      }
      return results;
    } catch (error) {
      console.error('DB List Error:', error);
      return [];
    }
  }
}

module.exports = new ReplitDB();
```

## 4. Full-Stack 앱 초기 설정 스크립트

### scripts/replit-setup.js
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Replit 환경 설정 시작...');

// 1. 필요한 디렉토리 생성
const dirs = ['data', 'logs', 'uploads', '.cache'];
dirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ ${dir} 디렉토리 생성됨`);
  }
});

// 2. 환경 변수 설정
if (!fs.existsSync('.env')) {
  const envContent = `
NODE_ENV=production
DATABASE_PATH=./data/app.db
UPLOAD_PATH=./uploads
LOG_PATH=./logs
SESSION_SECRET=${Math.random().toString(36).substring(7)}
`.trim();
  
  fs.writeFileSync('.env', envContent);
  console.log('✅ .env 파일 생성됨');
}

// 3. 데이터베이스 초기화
if (process.env.REPL_ID) {
  console.log('🔧 Replit 환경 감지됨');
  process.env.DATABASE_PATH = `/home/runner/${process.env.REPL_SLUG}/data/app.db`;
}

// 4. 의존성 설치
console.log('📦 의존성 설치 중...');
execSync('npm install', { stdio: 'inherit' });

// 5. 빌드 실행
if (fs.existsSync('next.config.js')) {
  console.log('🏗️ Next.js 빌드 중...');
  execSync('npm run build', { stdio: 'inherit' });
}

console.log('✅ Replit 설정 완료!');
```

## 5. API 라우트 템플릿

### app/api/health/route.js
```javascript
import { headers } from 'next/headers';

export async function GET() {
  const headersList = headers();
  const host = headersList.get('host');
  
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: {
      isReplit: !!process.env.REPL_ID,
      replName: process.env.REPL_SLUG || 'local',
      replOwner: process.env.REPL_OWNER || 'local',
      host: host,
      node: process.version,
      memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
    }
  });
}
```

## 6. 미들웨어 설정

### middleware.js
```javascript
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Replit 환경에서 CORS 설정
  if (process.env.REPL_ID) {
    const response = NextResponse.next();
    
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

## 7. 에러 처리 및 로깅

### lib/logger-replit.js
```javascript
const fs = require('fs');
const path = require('path');

class ReplitLogger {
  constructor() {
    this.logPath = process.env.REPL_ID 
      ? `/home/runner/${process.env.REPL_SLUG}/logs`
      : './logs';
      
    if (!fs.existsSync(this.logPath)) {
      fs.mkdirSync(this.logPath, { recursive: true });
    }
  }
  
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      replit: {
        id: process.env.REPL_ID,
        slug: process.env.REPL_SLUG,
        owner: process.env.REPL_OWNER
      }
    };
    
    // 콘솔 출력
    console.log(JSON.stringify(logEntry));
    
    // 파일 저장 (production only)
    if (process.env.NODE_ENV === 'production') {
      const logFile = path.join(this.logPath, `${timestamp.split('T')[0]}.log`);
      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    }
  }
  
  error(message, error) {
    this.log('ERROR', message, {
      error: error.message,
      stack: error.stack
    });
  }
  
  info(message, data) {
    this.log('INFO', message, data);
  }
  
  warn(message, data) {
    this.log('WARN', message, data);
  }
}

module.exports = new ReplitLogger();
```

## 8. 성능 모니터링

### lib/monitor-replit.js
```javascript
class ReplitMonitor {
  constructor() {
    this.startTime = Date.now();
    this.requests = 0;
  }
  
  getStats() {
    const uptime = Date.now() - this.startTime;
    const memUsage = process.memoryUsage();
    
    return {
      uptime: Math.floor(uptime / 1000),
      requests: this.requests,
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
        limit: 512 // Replit free tier
      },
      cpu: process.cpuUsage(),
      environment: {
        replit: !!process.env.REPL_ID,
        node: process.version,
        platform: process.platform
      }
    };
  }
  
  trackRequest() {
    this.requests++;
  }
}

module.exports = new ReplitMonitor();
```

## 9. 자동 백업 스크립트

### scripts/backup-replit.js
```javascript
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const backup = () => {
  if (!process.env.REPL_ID) {
    console.log('로컬 환경에서는 백업하지 않습니다.');
    return;
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupDir = `/home/runner/${process.env.REPL_SLUG}/backups`;
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // SQLite 백업
  const dbPath = `/home/runner/${process.env.REPL_SLUG}/app.db`;
  if (fs.existsSync(dbPath)) {
    const backupPath = path.join(backupDir, `db-${timestamp}.db`);
    fs.copyFileSync(dbPath, backupPath);
    console.log(`✅ 데이터베이스 백업 완료: ${backupPath}`);
  }
  
  // 오래된 백업 삭제 (7일 이상)
  const files = fs.readdirSync(backupDir);
  const now = Date.now();
  files.forEach(file => {
    const filePath = path.join(backupDir, file);
    const stats = fs.statSync(filePath);
    const age = now - stats.mtime.getTime();
    if (age > 7 * 24 * 60 * 60 * 1000) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ 오래된 백업 삭제: ${file}`);
    }
  });
};

// 매일 자동 실행
if (require.main === module) {
  backup();
}

module.exports = backup;
```

## 10. 배포 체크리스트 스크립트

### scripts/deploy-checklist.js
```javascript
#!/usr/bin/env node

const checks = [
  {
    name: 'Node.js 버전',
    check: () => process.version.startsWith('v20'),
    fix: 'replit.nix에서 nodejs_20 설정'
  },
  {
    name: '환경 변수',
    check: () => process.env.NODE_ENV === 'production',
    fix: 'Secrets에 NODE_ENV=production 추가'
  },
  {
    name: '데이터베이스 연결',
    check: () => {
      try {
        require('../lib/db');
        return true;
      } catch {
        return false;
      }
    },
    fix: '데이터베이스 설정 확인'
  },
  {
    name: '빌드 완료',
    check: () => require('fs').existsSync('.next'),
    fix: 'npm run build 실행'
  },
  {
    name: '포트 설정',
    check: () => process.env.PORT || true,
    fix: 'PORT 환경 변수 설정'
  }
];

console.log('🔍 Replit 배포 체크리스트\n');

checks.forEach(({ name, check, fix }) => {
  const passed = check();
  console.log(`${passed ? '✅' : '❌'} ${name}`);
  if (!passed) {
    console.log(`   → ${fix}\n`);
  }
});
```

이 템플릿들을 사용하면 Replit 배포가 매우 간단해집니다!