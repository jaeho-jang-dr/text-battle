# Kid Text Battle 🦁

아동 친화적 텍스트 배틀 게임 - 초등학생을 위한 교육적 동물 배틀 게임

## 🎮 프로젝트 소개

Kid Text Battle은 7-10세 초등학교 저학년을 대상으로 한 교육적이고 재미있는 텍스트 기반 배틀 게임입니다. 
아이들이 동물 캐릭터를 선택하고 창의적인 글쓰기를 통해 배틀을 즐기며 학습할 수 있습니다.

## 🌟 주요 기능

- **🧒 아동 친화적 UI/UX**: 쉽고 직관적인 인터페이스
- **🦁 100개의 동물 캐릭터**: 현존, 전설, 고생대 동물들
- **✍️ 창의적 글쓰기 배틀**: 200자 텍스트로 배틀 진행
- **🏆 TOP 25 리더보드**: 건전한 경쟁 유도
- **📊 상세한 통계**: 전투 기록 및 승률 확인
- **🔐 안전한 환경**: COPPA 준수, 부모 동의 시스템
- **⏰ 플레이 시간 제한**: 건강한 게임 습관 형성

## 🛠 기술 스택

- **Frontend**: Next.js 14.2.0, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Animation**: Framer Motion
- **Security**: bcryptjs, 미들웨어 기반 보호

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.0 이상
- npm 또는 yarn
- PostgreSQL 데이터베이스 (Supabase 추천)

### 설치 방법

```bash
# 저장소 클론
git clone https://github.com/jaeho-jang-dr/kid-text-battle.git
cd kid-text-battle

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에 Supabase URL과 Key 입력

# 개발 서버 실행
npm run dev
```

### 환경 변수 설정

`.env.local` 파일에 다음 변수들을 설정하세요:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 프로젝트 구조

```
kid-text-battle/
├── app/                    # Next.js 앱 라우터
│   ├── api/               # API 엔드포인트
│   ├── admin/             # 관리자 페이지
│   ├── kid-login/         # 아동용 로그인
│   └── ...
├── components/            # 재사용 가능한 컴포넌트
├── lib/                   # 유틸리티 함수
├── data/                  # 정적 데이터 (동물 정보)
└── database/             # 데이터베이스 스키마
```

## 🎯 주요 페이지

- `/` - 홈페이지
- `/kid-login` - 캐릭터 기반 아동 로그인
- `/signup` - 회원가입
- `/animals` - 동물 도감
- `/battle` - 배틀 페이지
- `/leaderboard` - 랭킹 보드
- `/admin` - 관리자 페이지

## 🔒 보안 기능

- 서버 사이드 비밀번호 암호화 (bcrypt)
- API 속도 제한
- 미들웨어 기반 라우트 보호
- 13세 미만 아동 특별 보호
- 플레이 시간 제한 (기본 60분)

## 👨‍👩‍👧‍👦 부모님을 위한 정보

- 13세 미만 아동은 부모님 이메일로 가입
- 비밀번호 없는 캐릭터 로그인 지원
- 플레이 시간 모니터링
- 부적절한 콘텐츠 필터링

## 🤝 기여하기

프로젝트 개선에 기여하고 싶으시다면:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 👨‍💻 개발자

**Developer Rights Holder: MokSu Grand Father**

## 🙏 감사의 말

이 프로젝트는 아이들의 창의성과 학습을 돕기 위해 만들어졌습니다.