# Text Battle Game - Setup Guide

## 현재 상태

앱이 포트 3008에서 정상 작동하며 다음 기능들이 구현되어 있습니다:

### ✅ 구현 완료
1. **회원가입/로그인 시스템**
   - 간단한 메모리 기반 인증 (개발용)
   - 회원가입 시 자동 캐릭터 생성
   - NextAuth 기반 세션 관리

2. **캐릭터 시스템**
   - 가입 시 자동 캐릭터 생성
   - 캐릭터 이름은 사용자명과 동일
   - 기본 배틀챗 자동 설정
   - ELO 레이팅 시스템 (시작: 1000점)

3. **NPC 시스템**
   - 20개의 사전 정의된 NPC
   - 다양한 ELO 점수 (600~1400)
   - 고유한 배틀챗

4. **리더보드**
   - ELO 점수 기준 자동 정렬
   - 승/패 기록 표시

## 시작하기

1. **개발 서버 실행**
   ```bash
   npm run dev
   ```
   앱이 http://localhost:3008 에서 실행됩니다.

2. **테스트 계정 생성**
   - 홈페이지에서 "Sign Up" 클릭
   - 이메일, 사용자명(10자 이하), 비밀번호 입력
   - 자동으로 캐릭터가 생성됩니다

3. **배틀 시작**
   - 로그인 후 "Play" 페이지로 이동
   - NPC와 배틀 가능
   - 배틀 쿨다운: 5분
   - 일일 배틀 제한: 20회

## API 테스트

```bash
# 회원가입 테스트
node scripts/test-auth-flow.js

# 전체 플로우 테스트
node scripts/test-complete-flow.js

# 캐릭터 생성 테스트
node scripts/test-create-character.js
```

## 주요 파일 구조

- `/lib/auth-simple.ts` - 간단한 인증 시스템
- `/lib/character-server.ts` - 캐릭터 관리 (서버 전용)
- `/lib/battle-server.ts` - 배틀 시스템 (서버 전용)
- `/lib/db/memory-store.ts` - 공유 메모리 저장소
- `/app/api/` - API 라우트들

## 주의사항

- 현재 개발 모드에서는 모든 데이터가 메모리에 저장됩니다
- 서버 재시작 시 사용자 데이터는 유지되지 않습니다
- NPC 데이터는 서버 시작 시 자동으로 초기화됩니다

## 다음 단계

프로덕션 배포를 위해서는:
1. 실제 데이터베이스 연결 (Supabase/Firebase)
2. 환경 변수 설정
3. 보안 강화