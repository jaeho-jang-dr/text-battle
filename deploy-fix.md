# 배포 문제 해결 가이드

## 문제: SQLite는 서버리스 환경에서 작동하지 않음

### 해결책 1: Fly.io 사용 (가장 쉬운 방법)
Fly.io는 영구 볼륨을 지원하므로 SQLite를 그대로 사용 가능합니다.

```bash
# Fly CLI 설치
curl -L https://fly.io/install.sh | sh

# 로그인
fly auth login

# 앱 생성
fly launch --name kid-text-battle-app

# 볼륨 생성 (SQLite 저장용)
fly volumes create data --size 1

# fly.toml 수정 후
fly deploy
```

### 해결책 2: PostgreSQL로 마이그레이션 (추천)
기존 코드를 PostgreSQL과 호환되도록 수정:

1. **Supabase 무료 데이터베이스 생성**
   - [supabase.com](https://supabase.com) 가입
   - 새 프로젝트 생성
   - Database URL 복사

2. **Railway 또는 Render에 배포**
   - DATABASE_URL 환경변수 설정
   - 자동으로 PostgreSQL 사용

### 해결책 3: Coolify 자체 호스팅
자체 서버가 있다면 Coolify 사용:

```bash
# Coolify 설치 (Ubuntu/Debian)
curl -fsSL https://get.coolify.io | bash

# 웹 UI에서 GitHub 연결 후 배포
```

## `/agents` 명령어 활성화

`.claude/agents/` 폴더에 에이전트 정의 파일을 생성했습니다:
- `deploy.md` - 배포 전문 에이전트
- `debug.md` - 디버깅 전문 에이전트  
- `battle.md` - 게임 로직 전문 에이전트

이제 `/agents` 명령어를 사용할 수 있습니다!

## 가장 빠른 배포 방법

**Fly.io 사용 (5분 내 배포)**:
1. [fly.io](https://fly.io) 가입
2. 신용카드 등록 (무료 플랜 사용 가능)
3. 위 명령어 실행
4. 완료!

이 방법은 SQLite를 그대로 사용할 수 있어 코드 수정이 필요 없습니다.