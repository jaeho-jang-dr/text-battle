# Kid Text Battle API Documentation

## 📋 API 엔드포인트 목록

### 🔐 인증 관련 (Authentication)

#### `/api/auth/login` 
- **POST**: 일반 로그인
- 필요 데이터: `username`, `password`

#### `/api/auth/kid-login`
- **POST**: 아이들을 위한 간단 로그인
- 필요 데이터: `username`, `password`

#### `/api/auth/signup`
- **POST**: 회원가입
- 필요 데이터: `username`, `password`, `email`, `age`, `parentEmail`

#### `/api/auth/kid-accounts`
- **GET**: 아이 계정 목록 조회
- **POST**: 아이 계정 생성

### 👤 사용자 관리 (User Management)

#### `/api/users/profile`
- **GET**: 사용자 프로필 조회
  - 반환: 프로필 정보, 통계, 플레이 시간, 뱃지
- **PUT**: 프로필 수정
  - 수정 가능: `username`, `age`, `avatar`, `parentEmail`

#### `/api/users/stats`
- **GET**: 상세 통계 조회
  - 쿼리: `period` (all/today/week/month), `detailed` (true/false)
  - 반환: 배틀 통계, 동물별 성과, 순위, 성장 추세

#### `/api/users/animals`
- **GET**: 내 동물 컬렉션 조회
  - 쿼리: `sortBy`, `order`, `page`, `limit`, `category`, `rarity`
- **POST**: 새 동물 추가
  - 필요 데이터: `animalId`, `nickname` (선택)
- **PUT**: 동물 정보 수정 (닉네임 변경)
  - 필요 데이터: `userAnimalId`, `nickname`

### ⚔️ 배틀 시스템 (Battle System)

#### `/api/battles`
- **GET**: 배틀 히스토리 조회
  - 쿼리: `page`, `limit`
  - 반환: 배틀 기록, 승률 통계
- **POST**: 새 배틀 생성
  - 필요 데이터: `opponentId`, `playerAnimalId`, `battleText`
  - 텍스트는 200자 제한

#### `/api/matchmaking`
- **GET**: 매치메이킹 (상대 찾기)
  - 쿼리: `mode` (balanced/easy/hard/random), `excludeRecent`
  - 반환: 추천 상대 목록 (최대 5명)

### 🏆 리더보드 & 업적 (Leaderboard & Achievements)

#### `/api/leaderboard`
- **GET**: TOP 25 리더보드 조회
  - 쿼리: `limit`, `page`
- **POST**: 특정 사용자 순위 조회
  - 필요 데이터: `userId`

#### `/api/achievements`
- **GET**: 업적 목록 조회
  - 반환: 전체 업적, 달성 여부, 진행도
- **POST**: 업적 달성 확인 및 보상
  - 자동으로 달성 가능한 업적 확인

### 🦁 동물 관련 (Animals)

#### `/api/animals`
- **GET**: 전체 동물 도감 조회
  - 쿼리: `category`, `rarity`, `search`, `page`, `limit`
- **POST**: 커스텀 동물 생성
  - 필요 데이터: 동물 정보 (이름, 설명, 스탯 등)

#### `/api/animals/[id]`
- **GET**: 특정 동물 상세 정보

### ⏱️ 플레이 관리 (Play Management)

#### `/api/play-sessions`
- **POST**: 플레이 세션 관리
  - `action`: start (시작), end (종료), check (확인)
  - 일일 플레이 시간 제한 체크

### 👨‍👩‍👧 부모 승인 (Parent Approvals)

#### `/api/parent-approvals`
- **GET**: 승인 요청 목록 조회
  - 쿼리: `status` (pending/approved/all)
- **POST**: 새 승인 요청 생성
  - 필요 데이터: `approvalType`, `parentEmail`, `approvalData`
- **PUT**: 승인/거절 처리 (토큰 기반)
  - 필요 데이터: `token`, `approved`, `reason`

### 🔧 기타 (Others)

#### `/api/help`
- **GET**: 도움말 컨텐츠 조회

#### `/api/content/filter`
- **POST**: 텍스트 필터링 (부적절한 내용 검사)

## 🛡️ 보안 & 인증

모든 API 엔드포인트는 다음 보안 기능을 포함합니다:

1. **JWT 토큰 인증**: Authorization 헤더 필요
2. **CORS 설정**: 허용된 도메인만 접근 가능
3. **Rate Limiting**: 과도한 요청 방지
4. **입력 검증**: 모든 입력값 검증
5. **SQL Injection 방지**: Parameterized queries 사용

## 📝 공통 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { ... },
  "message": "친절한 메시지",
  "timestamp": "2025-01-27T..."
}
```

### 에러 응답
```json
{
  "success": false,
  "error": "에러 메시지",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-27T..."
}
```

## 🎯 주요 특징

1. **아동 친화적 메시지**: 모든 응답은 7-10세 아이들이 이해하기 쉬운 언어 사용
2. **이모지 활용**: 시각적 재미를 위한 적절한 이모지 사용
3. **교육적 팁**: 각 응답에 게임 팁이나 격려 메시지 포함
4. **안전 기능**: 부적절한 내용 필터링, 플레이 시간 제한
5. **부모 관리**: 부모 승인 시스템으로 안전한 환경 보장

## 🚀 성능 최적화

- 페이지네이션 지원으로 대량 데이터 처리
- 캐싱을 통한 빠른 응답
- 데이터베이스 인덱스 최적화
- 비동기 처리로 높은 동시성 지원