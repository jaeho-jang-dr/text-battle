# Replit 설정 가이드

## 🚀 Replit에서 실행하기

### 1. Import 완료 후 첫 실행
Replit에서 import가 완료되면 다음 단계를 따라주세요:

### 2. Shell에서 의존성 설치
```bash
npm install
```

### 3. 데이터베이스 초기화
```bash
# 데이터베이스 파일 생성 (자동으로 생성됨)
# 첫 실행 시 자동으로 테이블이 생성됩니다
```

### 4. 동물 데이터 추가
```bash
# Shell 탭에서 실행
node add-all-animals.js
```

### 5. 관리자 계정 설정 (선택사항)
```bash
node setup-admin.js
```
- 기본 관리자: admin / 1234

### 6. 실행
- **Run** 버튼 클릭 또는
- Shell에서: `npm run build && npm start`

## 📝 환경 설정

### Secrets (환경 변수)
Replit의 Secrets 탭에서 설정:

1. `NODE_ENV` = `production`
2. `NEXT_PUBLIC_APP_URL` = `https://프로젝트명.사용자명.repl.co`

### 포트 설정
- 자동으로 포트 3000이 설정됨
- `.replit` 파일에서 이미 구성됨

## 🎮 접속 방법

### 공개 URL
- `https://프로젝트명.사용자명.repl.co`
- 누구나 접속 가능

### 관리자 페이지
- 메인 페이지 우측 하단 유니콘(🦄) 클릭
- 관리자 로그인: admin / 1234

## ⚠️ 주의사항

1. **무료 플랜 제한**
   - 일정 시간 비활성 시 슬립 모드
   - 첫 접속 시 로딩 시간 소요

2. **데이터 저장**
   - SQLite 파일은 Replit 내부에 저장
   - 정기적인 백업 권장

3. **성능**
   - 동시 접속자가 많으면 느려질 수 있음
   - 교육/데모 용도로 적합

## 🔧 문제 해결

### "Cannot find module" 에러
```bash
npm install
```

### 데이터베이스 에러
```bash
# 데이터베이스 재생성
rm kid-text-battle.db
node add-all-animals.js
```

### 빌드 에러
```bash
# .next 폴더 삭제 후 재빌드
rm -rf .next
npm run build
```

## 📱 모바일 접속
- 브라우저에서 URL 직접 입력
- QR 코드 생성해서 공유 가능