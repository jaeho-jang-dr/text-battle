# Replit 빠른 시작 가이드 🚀

## 30초 안에 배포하기

### 1. GitHub에서 Import
```
1. Replit.com 로그인
2. "Create Repl" 클릭
3. "Import from GitHub" 선택
4. 저장소 URL 입력
5. "Import" 클릭
```

### 2. 즉시 실행 명령어
```bash
# Replit Shell에서 실행
npm install && npm run build && npm run start
```

### 3. 필수 파일만 추가
`.replit` 파일:
```bash
run = "npm run start"
[nix]
channel = "stable-24_05"
```

## 프로젝트 유형별 빠른 설정

### Next.js 앱
```javascript
// next.config.js에 추가
module.exports = {
  output: 'standalone',
  images: { unoptimized: true }
};
```

### Express 앱
```javascript
// server.js 수정
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0');
```

### React 앱
```json
// package.json
"scripts": {
  "start": "serve -s build -l 3000"
}
```

## 데이터베이스 즉시 설정

### SQLite (가장 빠름)
```javascript
const Database = require('better-sqlite3');
const db = new Database('app.db');
```

### PostgreSQL (Neon 무료)
1. neon.tech에서 무료 DB 생성
2. Replit Secrets에 DATABASE_URL 추가
3. 끝!

## 일반적인 오류 빠른 해결

### "Cannot find module" 에러
```bash
rm -rf node_modules package-lock.json
npm install
```

### 포트 에러
```javascript
// 항상 이렇게 사용
const port = process.env.PORT || 3000;
```

### 메모리 부족
```bash
# .replit에 추가
run = "node --max-old-space-size=512 index.js"
```

## 5분 안에 완전한 앱 배포

### 1단계: 기본 파일 생성 (1분)
```bash
touch .replit replit.nix
echo 'run = "npm start"' > .replit
```

### 2단계: 데이터베이스 설정 (1분)
```javascript
// lib/db.js
const Database = require('better-sqlite3');
module.exports = new Database('app.db');
```

### 3단계: 환경 변수 (1분)
Replit Secrets 탭에서:
- NODE_ENV = production
- SESSION_SECRET = random-string

### 4단계: 빌드 및 실행 (2분)
```bash
npm install
npm run build
npm start
```

## 체크리스트

✅ `.replit` 파일 있나요?
✅ `package.json`에 start 스크립트 있나요?
✅ 포트를 `process.env.PORT` 사용하나요?
✅ 데이터베이스 경로가 상대 경로인가요?
✅ 환경 변수는 Secrets에 넣었나요?

모두 체크했다면 배포 준비 완료!

## 프로 팁 💡

1. **Always Free 유지하기**
   - 512MB RAM 제한 고려
   - 파일 크기 최소화
   - 불필요한 의존성 제거

2. **빠른 시작**
   - SQLite 사용 (설정 불필요)
   - 정적 파일은 CDN 사용
   - 빌드 캐시 활용

3. **문제 해결**
   - 콘솔 로그 확인
   - Secrets 오타 확인
   - 파일 권한 확인

준비되셨나요? 지금 바로 배포하세요! 🎉