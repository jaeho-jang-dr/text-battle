# Text Battle Game

12세 이상을 위한 텍스트 기반 PvP 배틀 게임

## 프로젝트 설정

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
`.env.example` 파일을 복사하여 `.env.local`을 만들고 필요한 값들을 입력하세요.

3. 개발 서버 실행:
```bash
npm run dev
```

## 주요 기능

- **인증 시스템**: 카카오톡, 이메일, 게스트 로그인
- **캐릭터 시스템**: 10자 이내 캐릭터명, 100자 이내 배틀챗
- **배틀 시스템**: AI 점수 판정, ELO 스코어링
- **제한 시스템**: 일일 10회 배틀, 연속 제한
- **관리자 패널**: 숨겨진 유니콘 아이콘으로 접근

## 기술 스택

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase
- NextAuth.js
- OpenAI API