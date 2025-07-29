# Changelog

모든 주요 변경사항이 이 파일에 문서화됩니다.

이 프로젝트는 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)을 준수합니다.

## [0.0.1] - 2025-07-29

### 🎉 초기 릴리즈

#### 추가된 기능
- **관리자 대시보드**
  - 실시간 통계 모니터링 (5초 자동 새로고침)
  - 현재 접속자 추적 (최근 5분 이내 활동)
  - 상세 게임 통계 (사용자, 캐릭터, 배틀)
  - 최근 배틀 기록 실시간 표시
  - 동물별 통계 및 시간대별 배틀 분석

- **사용자 활동 추적**
  - 로그인 시 자동 활동 기록
  - 배틀 생성 시 활동 로그
  - 마지막 활동 시간 추적

- **관리자 인증 시스템**
  - 관리자 로그인 기능
  - 토큰 기반 인증 (7일 유효)
  - Edge Runtime 호환성 개선

#### 개선사항
- 관리자 로그인 오류 수정 (bcrypt 제거)
- 데이터베이스 오류 처리 개선
- 테이블이 없는 경우에도 기본 관리자 로그인 허용

#### 기술 스택
- Next.js 14.2.0 (App Router)
- SQLite (better-sqlite3)
- TypeScript
- Tailwind CSS
- Framer Motion

#### 알려진 이슈
- 없음

---

[0.0.1]: https://github.com/jaeho-jang-dr/kid-text-battle/releases/tag/v0.0.1