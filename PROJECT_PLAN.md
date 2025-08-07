# 텍스트 배틀 게임 프로젝트 계획

## 프로젝트 개요
- 게임명: Text Battle Game
- 대상 연령: 12세 이상
- 장르: 텍스트 기반 PvP 배틀 게임

## 기술 스택
- Frontend: Next.js 14, React, TypeScript, Tailwind CSS
- Backend: Next.js API Routes
- Database: PostgreSQL (Supabase)
- Authentication: NextAuth.js (카카오톡, 이메일, 게스트)
- AI: OpenAI API (배틀 점수 판정)
- Animation: Framer Motion

## 주요 기능
1. **인증 시스템**
   - 카카오톡 로그인
   - 이메일 가입/로그인
   - 게스트 플레이 (1회성)

2. **캐릭터 시스템**
   - 캐릭터명 (10자 이내)
   - 배틀챗 (100자 이내)
   - 캐릭터 관리

3. **배틀 시스템**
   - AI 점수 판정 (기본점수 + 상수 × ELO 점수)
   - 3초간 애니메이션 배틀
   - 일일 10회 제한
   - 연속 배틀 제한 (수비 5회, 공격 3회)

4. **리더보드**
   - 실시간 랭킹
   - NPC 및 플레이어 표시

5. **관리자 패널**
   - 숨겨진 입구 (유니콘 아이콘)
   - 계정: admin / 비밀번호: 1234
   - 게임 설정 관리

## 데이터베이스 구조
1. **users** - 사용자 계정
2. **characters** - 캐릭터 정보
3. **battles** - 배틀 기록
4. **leaderboard** - 리더보드
5. **settings** - 게임 설정