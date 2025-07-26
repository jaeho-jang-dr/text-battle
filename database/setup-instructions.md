# Supabase 데이터베이스 설정 가이드

## 1단계: SQL Editor에서 스키마 생성

Supabase Dashboard > SQL Editor 에서 다음 SQL을 실행하세요:

### 1.1 기본 테이블 생성
`database/schema.sql` 파일의 내용을 복사하여 실행

### 1.2 초기 데이터 삽입
`database/seed.sql` 파일의 내용을 복사하여 실행

## 2단계: Storage 버킷 생성 (선택사항)

1. Storage 탭으로 이동
2. "New bucket" 클릭
3. 버킷 이름: `avatars`
4. Public bucket 체크
5. "Create bucket" 클릭

## 3단계: Authentication 설정

1. Authentication > Providers
2. Email 인증 비활성화 (우리는 사용하지 않음)
3. URL Configuration에서:
   - Site URL: `http://localhost:3002` (개발)
   - Redirect URLs: `http://localhost:3002/*`

## 4단계: 환경 변수 가져오기

1. Project Settings > API 탭
2. 다음 값들을 복사:
   - Project URL (예: https://xxxxx.supabase.co)
   - anon public key (예: eyJhbGc...)

## 5단계: 로컬 프로젝트에 환경 변수 설정

`.env.local` 파일 수정:
```
NEXT_PUBLIC_SUPABASE_URL=여기에_Project_URL_붙여넣기
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_anon_public_key_붙여넣기
```

## 6단계: 서버 재시작

```bash
# Ctrl+C로 서버 중지 후
npm run dev -- -p 3002
```

## 확인사항

- RLS (Row Level Security) 정책이 올바르게 설정되었는지 확인
- 테이블에 데이터가 제대로 들어갔는지 확인 (Table Editor에서)
- 환경 변수가 올바르게 설정되었는지 확인