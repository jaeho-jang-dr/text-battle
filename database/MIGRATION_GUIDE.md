# 데이터베이스 마이그레이션 가이드

## 업데이트 내용

이 마이그레이션은 다음 기능들을 추가합니다:
- 부모 이메일 인증 시스템
- 계정 경고 및 정지 시스템
- 채팅 기능
- 콘텐츠 필터링
- 캐릭터 제한 (계정당 3개)

## Supabase에서 스키마 업데이트하기

### 방법 1: Supabase 대시보드 사용 (권장)

1. [Supabase 대시보드](https://app.supabase.com)에 로그인
2. 프로젝트 선택
3. 왼쪽 메뉴에서 "SQL Editor" 클릭
4. "New query" 버튼 클릭
5. `/database/update-schema.sql` 파일의 내용을 복사하여 붙여넣기
6. "Run" 버튼 클릭

### 방법 2: Supabase CLI 사용

```bash
# Supabase CLI 설치 (아직 설치하지 않은 경우)
npm install -g supabase

# 프로젝트 디렉토리에서
cd /home/drjang00/DevEnvironments/kid-text-battle

# Supabase 프로젝트와 연결
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push database/update-schema.sql
```

### 방법 3: psql 직접 연결

```bash
# Supabase 연결 문자열 사용
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f database/update-schema.sql
```

## 업데이트 순서

1. **먼저 update-schema.sql 실행** - 새로운 필드와 테이블 추가
2. **앱 재시작** - 새로운 스키마 반영
3. **테스트** - 모든 기능이 정상 작동하는지 확인

## 주의사항

- 이 업데이트는 기존 데이터를 삭제하지 않습니다
- 새로운 필드들은 기본값을 가지므로 기존 사용자들에게 영향 없음
- 트리거와 함수들이 추가되므로 순서대로 실행 필요

## 롤백 방법

문제가 발생한 경우:

```sql
-- 새로 추가된 테이블 삭제
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS user_warnings CASCADE;
DROP TABLE IF EXISTS content_filters CASCADE;

-- 추가된 필드 제거
ALTER TABLE users 
DROP COLUMN IF EXISTS warnings_count,
DROP COLUMN IF EXISTS account_suspended,
DROP COLUMN IF EXISTS suspended_at,
DROP COLUMN IF EXISTS suspension_reason,
DROP COLUMN IF EXISTS parent_verified,
DROP COLUMN IF EXISTS parent_verified_at,
DROP COLUMN IF EXISTS auto_login_token;

-- 트리거와 함수 제거
DROP TRIGGER IF EXISTS enforce_character_limit ON user_animals;
DROP FUNCTION IF EXISTS check_character_limit();
DROP FUNCTION IF EXISTS delete_old_chat_messages();

-- 뷰 제거
DROP VIEW IF EXISTS suspended_accounts;
```

## 확인 사항

업데이트 후 다음을 확인하세요:

1. ✅ 회원가입시 부모 이메일 인증
2. ✅ 자동 로그인 기능
3. ✅ 채팅 메시지 전송
4. ✅ 부적절한 내용 필터링
5. ✅ 3개 이상 캐릭터 생성 시도시 오류
6. ✅ 관리자 대시보드의 정지 계정 표시