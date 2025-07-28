# 🎮 Kid Text Battle - 설정 방법

## 📋 필수 준비사항

1. **Supabase 계정 및 프로젝트**
   - https://supabase.com 에서 무료 계정 생성
   - 새 프로젝트 생성

2. **프로젝트 키 확인**
   - Supabase 대시보드 > Settings > API
   - `Project URL`과 `anon public` 키 복사

## 🚀 설정 단계

### 1️⃣ 환경 변수 설정

`.env.local` 파일을 다음과 같이 수정:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# 앱 설정
NEXT_PUBLIC_APP_NAME=동물 친구들 배틀
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2️⃣ 데이터베이스 스키마 생성

Supabase SQL Editor에서 다음 순서로 실행:

1. **UUID 확장 활성화**:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

2. **전체 스키마 생성**:
- `/database/complete-schema.sql` 파일 전체 내용 복사 후 실행

3. **동물 데이터 삽입**:
- `/database/animals-seed.sql` 파일 내용 실행 (이미 있다면 생략)

### 3️⃣ 초기 데이터 설정

터미널에서:
```bash
node setup-database.js
```

성공하면 다음과 같이 표시됩니다:
```
✅ 관리자 설정 완료
✅ 관리자 계정 생성 완료
✅ 샘플 데이터 생성 완료
```

### 4️⃣ 개발 서버 시작

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 🧪 테스트

1. **게스트로 시작**: 메인 페이지에서 "바로 게임 시작하기!" 클릭
2. **캐릭터 생성**: 동물 선택 → 이름 입력 → 배틀 텍스트 작성
3. **리더보드 확인**: 샘플 캐릭터 5개가 표시되는지 확인

## 🔐 관리자 페이지

- 위치: 홈페이지 우측 하단 작은 유니콘(🦄) 아이콘
- 초기 비밀번호: **1234**

## ⚠️ 일반적인 문제 해결

### "relation "users" does not exist" 오류
→ SQL Editor에서 complete-schema.sql을 실행하지 않았습니다

### "Invalid API key" 오류
→ .env.local의 Supabase 키를 확인하세요

### 샘플 데이터가 보이지 않음
→ animals 테이블에 동물 데이터가 있는지 확인하세요

## 📝 추가 정보

- 모든 SQL 파일은 `/database` 폴더에 있습니다
- 테스트 스크립트: `node test-login.js`
- 관리자 대시보드는 추후 구현 예정입니다