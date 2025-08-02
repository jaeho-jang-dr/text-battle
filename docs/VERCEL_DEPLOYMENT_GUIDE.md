# Kid Text Battle - Vercel 배포 가이드

이 가이드는 Kid Text Battle 앱을 SQLite에서 PostgreSQL로 마이그레이션하고 Vercel에 배포하는 방법을 설명합니다.

## 📋 목차

1. [PostgreSQL 데이터베이스 설정](#1-postgresql-데이터베이스-설정)
2. [환경 변수 설정](#2-환경-변수-설정)
3. [데이터베이스 초기화](#3-데이터베이스-초기화)
4. [Vercel 배포](#4-vercel-배포)
5. [배포 후 확인](#5-배포-후-확인)
6. [문제 해결](#6-문제-해결)

## 1. PostgreSQL 데이터베이스 설정

### Neon.tech 사용 (권장)

1. [Neon.tech](https://neon.tech) 가입
2. 새 프로젝트 생성
3. 데이터베이스 연결 문자열 복사

```
postgresql://username:password@host/database?sslmode=require
```

### Supabase 사용 (대안)

1. [Supabase](https://supabase.com) 가입
2. 새 프로젝트 생성
3. Settings > Database > Connection string 복사

## 2. 환경 변수 설정

### 로컬 개발용 (.env.local)

```bash
# PostgreSQL 연결 문자열
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# OpenAI API (배틀 판정용)
OPENAI_API_KEY=sk-...

# Next.js
NODE_ENV=development
```

### Vercel 환경 변수

1. Vercel 프로젝트 대시보드 접속
2. Settings > Environment Variables
3. 다음 변수 추가:
   - `DATABASE_URL`: PostgreSQL 연결 문자열
   - `OPENAI_API_KEY`: OpenAI API 키

## 3. 데이터베이스 초기화

### 방법 1: Node.js 스크립트 사용 (권장)

```bash
# 환경 변수 설정
export DATABASE_URL="your-postgres-url"

# 데이터베이스 초기화
npm run db:init
```

### 방법 2: SQL 직접 실행

```bash
# psql 사용
psql $DATABASE_URL -f scripts/migrate-to-postgres.sql

# 또는 Neon/Supabase 웹 콘솔에서 SQL 실행
```

## 4. Vercel 배포

### 방법 1: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 방법 2: GitHub 연동

1. GitHub 저장소에 코드 푸시
2. Vercel에서 GitHub 저장소 import
3. 자동 배포 설정

### 배포 설정

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["icn1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 5. 배포 후 확인

### 데이터베이스 연결 확인

```bash
# 로컬에서 테스트
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT COUNT(*) FROM users\`.then(console.log);
"
```

### 기능 테스트

1. 로그인 (게스트/이메일)
2. 캐릭터 생성
3. 배틀 진행
4. 리더보드 확인
5. 관리자 패널 접속

## 6. 문제 해결

### 일반적인 문제

#### 데이터베이스 연결 실패
- DATABASE_URL 환경 변수 확인
- SSL 설정 확인 (`sslmode=require`)
- 네트워크/방화벽 설정 확인

#### 빌드 실패
```bash
# 메모리 부족 시
NODE_OPTIONS='--max-old-space-size=512' npm run build
```

#### API 오류
- 모든 API 라우트가 async로 변경되었는지 확인
- PostgreSQL 쿼리 문법 확인
- 환경 변수 설정 확인

### 로그 확인

```bash
# Vercel 로그
vercel logs

# 함수 로그
vercel logs --source=functions
```

## 📝 마이그레이션 체크리스트

- [ ] PostgreSQL 데이터베이스 생성
- [ ] 환경 변수 설정 (.env.local)
- [ ] 데이터베이스 스키마 초기화
- [ ] 로컬 테스트
- [ ] Vercel 환경 변수 설정
- [ ] Vercel 배포
- [ ] 프로덕션 테스트

## 🔧 유용한 명령어

```bash
# 데이터베이스 초기화
npm run db:init

# 로컬 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# Vercel 배포
vercel --prod

# 환경 변수 확인
vercel env ls
```

## 📚 추가 리소스

- [Neon.tech 문서](https://neon.tech/docs)
- [Vercel 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)

## 🚨 주의사항

1. **데이터베이스 URL 보안**: 절대 코드에 직접 포함하지 마세요
2. **API 키 보안**: 환경 변수로만 관리
3. **CORS 설정**: 필요시 API 라우트에 CORS 헤더 추가
4. **Rate Limiting**: PostgreSQL 연결 제한 확인

배포 중 문제가 발생하면 Vercel 로그와 PostgreSQL 로그를 확인하세요.