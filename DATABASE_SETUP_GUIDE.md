# Kid Text Battle - 데이터베이스 설정 가이드

## 🚀 빠른 설정 (3단계)

### 1단계: Supabase SQL Editor에서 스키마 생성

Supabase 대시보드 > SQL Editor에서 다음 파일들을 순서대로 실행:

1. **UUID 확장 활성화** (`/database/enable-uuid.sql`):
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

2. **전체 스키마 생성** (`/database/complete-schema.sql`):
- 파일 내용 전체를 복사하여 실행

### 2단계: 환경 변수 설정

`.env.local` 파일에 다음 내용 추가:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key (선택사항)
```

### 3단계: 초기 데이터 설정

터미널에서 실행:
```bash
node setup-database.js
```

이 스크립트는:
- ✅ 관리자 설정 생성
- ✅ 관리자 계정 생성 (admin@kidtextbattle.com)
- ✅ 샘플 데이터 5개 생성 (리더보드용)

## 📋 생성되는 테이블

1. **users** - 사용자 정보
2. **characters** - 캐릭터 정보
3. **battles** - 배틀 기록
4. **warnings** - 경고 기록
5. **admin_settings** - 관리자 설정
6. **admin_logs** - 관리자 활동 로그
7. **leaderboard** (뷰) - 리더보드 표시용

## 🎮 테스트 방법

1. 개발 서버 시작:
```bash
npm run dev
```

2. 브라우저에서 http://localhost:3000 접속

3. 테스트 스크립트 실행 (선택사항):
```bash
node test-login.js
```

## 🔐 관리자 접속

- 홈페이지 우측 하단 유니콘(🦄) 아이콘 클릭
- 초기 비밀번호: **1234**

## ⚠️ 주의사항

1. Supabase에서 RLS(Row Level Security)를 활성화하려면 추가 설정이 필요합니다
2. 프로덕션 환경에서는 SERVICE_KEY를 안전하게 관리하세요
3. 관리자 비밀번호는 즉시 변경하세요

## 🆘 문제 해결

### "relation does not exist" 오류
→ SQL Editor에서 complete-schema.sql을 먼저 실행하세요

### "permission denied" 오류
→ Supabase 대시보드에서 테이블 권한을 확인하세요

### 샘플 데이터가 생성되지 않음
→ animals 테이블에 동물 데이터가 있는지 확인하세요