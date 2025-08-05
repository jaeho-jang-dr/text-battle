#!/usr/bin/env node

/**
 * Replit 초기 설정 스크립트
 * 이 스크립트는 Replit 환경에서 자동으로 실행되어 필요한 설정을 완료합니다.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Replit 환경 설정 시작...\n');

// 1. 환경 감지
const isReplit = process.env.REPL_ID !== undefined;
console.log(`📍 환경: ${isReplit ? 'Replit' : 'Local'}`);

if (isReplit) {
  console.log(`📂 Repl 이름: ${process.env.REPL_SLUG}`);
  console.log(`👤 소유자: ${process.env.REPL_OWNER}`);
}

// 2. 필요한 디렉토리 생성
console.log('\n📁 필요한 디렉토리 생성 중...');
const dirs = ['data', 'logs', 'uploads', '.cache'];

dirs.forEach(dir => {
  const dirPath = isReplit 
    ? `/home/runner/${process.env.REPL_SLUG}/${dir}`
    : path.join(process.cwd(), dir);
    
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ ${dir} 디렉토리 생성됨: ${dirPath}`);
  } else {
    console.log(`⏭️  ${dir} 디렉토리 이미 존재`);
  }
});

// 3. 환경 변수 파일 생성
console.log('\n🔐 환경 변수 설정 중...');
if (!fs.existsSync('.env.local') && fs.existsSync('.env.replit')) {
  fs.copyFileSync('.env.replit', '.env.local');
  console.log('✅ .env.local 파일 생성됨');
}

// 4. 데이터베이스 초기화 체크
console.log('\n💾 데이터베이스 확인 중...');
const dbPath = isReplit 
  ? `/home/runner/${process.env.REPL_SLUG}/data/kid-text-battle.db`
  : './kid-text-battle.db';

if (!fs.existsSync(dbPath)) {
  console.log('🔨 데이터베이스 파일이 없습니다. 앱 시작 시 자동 생성됩니다.');
} else {
  const stats = fs.statSync(dbPath);
  console.log(`✅ 데이터베이스 존재 (크기: ${(stats.size / 1024).toFixed(2)} KB)`);
}

// 5. 의존성 체크
console.log('\n📦 의존성 확인 중...');
try {
  require('better-sqlite3');
  console.log('✅ better-sqlite3 설치됨');
} catch {
  console.log('❌ better-sqlite3 없음 - npm install 필요');
}

// 6. 포트 설정 확인
console.log('\n🌐 포트 설정 확인...');
const port = process.env.PORT || 3008;
console.log(`✅ 사용할 포트: ${port}`);

// 7. 메모리 사용량 체크
console.log('\n💻 시스템 정보:');
const memUsage = process.memoryUsage();
console.log(`- Node.js 버전: ${process.version}`);
console.log(`- 플랫폼: ${process.platform}`);
console.log(`- 메모리 사용량: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`);
console.log(`- 메모리 한계: ${isReplit ? '512 MB (Replit 무료 티어)' : '시스템 의존'}`);

// 8. 빌드 명령어 안내
console.log('\n📋 다음 단계:');
console.log('1. npm install (의존성 설치)');
console.log('2. npm run build (프로덕션 빌드)');
console.log('3. npm run start (서버 시작)');

if (isReplit) {
  console.log('\n💡 Replit 팁:');
  console.log('- Secrets 탭에서 환경 변수 설정하세요');
  console.log('- Run 버튼을 누르면 자동으로 시작됩니다');
  console.log('- 콘솔에서 로그를 확인할 수 있습니다');
}

console.log('\n✅ Replit 설정 준비 완료!');