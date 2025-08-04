# 배포 가이드 - Kid Text Battle

## 🚀 배포 옵션

### 1. Railway (추천) - PostgreSQL 지원
Railway는 무료 플랜으로 시작 가능하며 PostgreSQL을 자동으로 제공합니다.

#### 배포 단계:
1. [Railway](https://railway.app) 계정 생성
2. GitHub 연결 및 프로젝트 Import
3. 자동으로 PostgreSQL 데이터베이스 생성
4. 환경 변수 자동 설정
5. 배포 완료!

#### Railway CLI 사용 (선택사항):
```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 연결
railway link

# 배포
railway up
```

### 2. Render - 무료 PostgreSQL 포함
Render는 무료 웹 서비스와 무료 PostgreSQL을 제공합니다.

#### 배포 단계:
1. [Render](https://render.com) 계정 생성
2. "New +" → "Web Service" 클릭
3. GitHub 저장소 연결
4. 서비스 설정:
   - Name: `kid-text-battle`
   - Region: `Singapore`
   - Branch: `main`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
5. 환경 변수 추가:
   - `NODE_ENV`: `production`
   - `PORT`: `3008`
6. PostgreSQL 데이터베이스 생성 (자동 연결)
7. 배포!

### 3. Vercel + Supabase (무료)
Vercel은 프론트엔드 호스팅, Supabase는 PostgreSQL 데이터베이스를 제공합니다.

#### 배포 단계:
1. [Supabase](https://supabase.com) 프로젝트 생성
2. Database URL 복사
3. [Vercel](https://vercel.com) 계정 생성
4. GitHub Import
5. 환경 변수 설정:
   - `DATABASE_URL`: Supabase에서 복사한 URL
   - `NODE_ENV`: `production`
6. 배포!

## 📊 데이터베이스 마이그레이션

PostgreSQL로 전환 시:
```bash
# 1. 환경 변수 설정
export DATABASE_URL="postgresql://..."

# 2. 마이그레이션 실행
npm run db:migrate

# 3. 관리자 계정 생성
node setup-admin.js
```

## 🔧 환경 변수 설정

모든 플랫폼에서 필요한 환경 변수:
```
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
PORT=3008 (선택사항, 대부분 플랫폼에서 자동 설정)
```

## 🚨 주의사항

1. **SQLite 제한사항**: Vercel, Netlify 같은 서버리스 플랫폼에서는 SQLite 사용 불가
2. **무료 플랜 제한**: 
   - Railway: 월 500시간 (약 20일)
   - Render: 15분 비활성 시 슬립
   - Supabase: 500MB 저장소
3. **지역 선택**: 한국 사용자를 위해 싱가포르 리전 선택 권장

## 📱 배포 후 확인사항

1. 홈페이지 접속 확인
2. 관리자 로그인 테스트 (유니콘 아이콘)
3. 캐릭터 생성 및 배틀 테스트
4. 데이터 영속성 확인

## 🆘 문제 해결

### PostgreSQL 연결 오류
```bash
# SSL 연결이 필요한 경우
DATABASE_URL="postgresql://...?sslmode=require"
```

### 빌드 메모리 부족
```bash
# package.json에 추가
"build": "NODE_OPTIONS='--max-old-space-size=512' next build"
```

### 포트 충돌
대부분의 플랫폼은 PORT 환경 변수를 자동 설정합니다. 
코드에서 `process.env.PORT || 3008` 사용 확인.

## 🎉 배포 완료!

배포가 완료되면 제공된 URL로 접속하여 게임을 즐기세요!