# Kid Text Battle - 프로젝트 초기화 문서

## 프로젝트 개요
- **프로젝트명**: Kid Text Battle (아이들을 위한 텍스트 배틀)
- **대상 연령**: 초등학교 저학년 (7-10세)
- **장르**: 교육적 텍스트 기반 동물 배틀 게임
- **목표**: 재미있게 동물을 학습하며 전략적 사고 능력 향상

## 기술 스택
- **Frontend**: Next.js 15 + TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Styling**: Tailwind CSS + 아동 친화적 UI
- **Authentication**: Supabase Auth (부모 동의 기능 포함)
- **Deployment**: Vercel + Supabase

## 핵심 기능
1. **동물 캐릭터 시스템**
   - 현존 동물 (사자, 코끼리, 펭귄 등)
   - 전설의 동물 (유니콘, 페가수스, 드래곤 등)
   - 고생대 동물 (티라노사우루스, 트리케라톱스 등)

2. **교육적 도감 시스템**
   - 각 동물의 상세 설명
   - 서식지, 특징, 재미있는 사실
   - 아이들이 이해하기 쉬운 설명

3. **친절한 도움말 시스템**
   - 단계별 튜토리얼
   - 언제든 볼 수 있는 도움말 버튼
   - 음성 지원 (선택사항)

4. **배틀 시스템**
   - 턴제 기반 간단한 전투
   - 가위바위보 + 동물 특성 시스템
   - 200자 이내 텍스트 입력

5. **리더보드 & 통계**
   - 상위 25명 랭킹
   - 전투 횟수, 승률, 패배율
   - 친구 시스템

## 프로젝트 구조
```
kid-text-battle/
├── src/
│   ├── app/                 # Next.js 13+ App Router
│   ├── components/          # React 컴포넌트
│   │   ├── animals/        # 동물 관련 컴포넌트
│   │   ├── battle/         # 배틀 컴포넌트
│   │   ├── help/           # 도움말 컴포넌트
│   │   └── ui/             # UI 컴포넌트
│   ├── lib/                # 유틸리티 함수
│   ├── types/              # TypeScript 타입
│   └── data/               # 동물 데이터
├── public/
│   └── animals/            # 동물 이미지
├── database/
│   └── schema.sql          # PostgreSQL 스키마
└── docs/                   # 문서

## 초기 설정 명령어
```bash
# 프로젝트 생성
npx create-next-app@latest kid-text-battle --typescript --tailwind --app

# 의존성 설치
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install framer-motion react-icons
npm install -D @types/node

# Supabase 설정
npx supabase init
```

## 데이터베이스 스키마 (PostgreSQL)
```sql
-- 사용자 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  age INTEGER,
  parent_email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 동물 마스터 데이터
CREATE TABLE animals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  korean_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'current', 'legend', 'prehistoric'
  description TEXT NOT NULL,
  fun_fact TEXT,
  habitat VARCHAR(255),
  power INTEGER DEFAULT 50,
  defense INTEGER DEFAULT 50,
  speed INTEGER DEFAULT 50,
  special_ability VARCHAR(255)
);

-- 사용자 동물 컬렉션
CREATE TABLE user_animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  animal_id INTEGER REFERENCES animals(id),
  nickname VARCHAR(100),
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  battles_won INTEGER DEFAULT 0,
  battles_lost INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 배틀 기록
CREATE TABLE battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id UUID REFERENCES users(id),
  player2_id UUID REFERENCES users(id),
  player1_animal_id INTEGER REFERENCES animals(id),
  player2_animal_id INTEGER REFERENCES animals(id),
  winner_id UUID REFERENCES users(id),
  battle_log JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 리더보드 (실시간 뷰)
CREATE VIEW leaderboard AS
SELECT 
  u.id,
  u.username,
  COUNT(CASE WHEN b.winner_id = u.id THEN 1 END) as wins,
  COUNT(CASE WHEN b.winner_id != u.id THEN 1 END) as losses,
  COUNT(*) as total_battles,
  ROUND(COUNT(CASE WHEN b.winner_id = u.id THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as win_rate
FROM users u
LEFT JOIN battles b ON u.id IN (b.player1_id, b.player2_id)
GROUP BY u.id, u.username
ORDER BY wins DESC, win_rate DESC
LIMIT 25;
```

## 보안 및 안전 고려사항
1. **연령 확인 시스템**
2. **부모 동의 기능**
3. **채팅 필터링 (욕설 방지)**
4. **개인정보 보호**
5. **시간 제한 기능 (과몰입 방지)**

## 다음 단계
1. 프로젝트 초기화
2. Supabase 프로젝트 생성
3. 기본 UI 컴포넌트 개발
4. 동물 데이터 입력
5. 배틀 시스템 구현