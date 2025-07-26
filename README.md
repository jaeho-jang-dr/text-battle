# 동물 친구들 배틀 🦁

초등학생을 위한 텍스트 기반 동물 배틀 게임

## 기능

- 🎮 간단한 회원가입/로그인 (부모 동의 없음)
- 🦁 16가지 다양한 동물 캐릭터 (현존/전설/고생대)
- ⚔️ 텍스트 기반 턴제 배틀 시스템
- 🏆 상위 25명 리더보드
- 📖 동물 도감과 상세 정보
- 🎓 초보자를 위한 튜토리얼
- 💫 키즈 친화적인 애니메이션 UI

## 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Animation**: Framer Motion
- **Database**: PostgreSQL (Supabase)
- **Deployment**: Vercel

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
`.env.local` 파일을 생성하고 다음 내용을 추가:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Supabase 데이터베이스 설정:
- `database/schema.sql` 파일을 Supabase SQL Editor에서 실행
- `database/seed.sql` 파일을 실행하여 초기 데이터 추가

4. 개발 서버 실행:
```bash
npm run dev
```

## 배포

Vercel에 배포하기:

1. Vercel에 프로젝트 연결
2. 환경 변수 설정
3. 배포 실행

## 게임 플레이

1. 회원가입: 닉네임, 나이(7-15세), 아바타 선택
2. 첫 동물로 사자를 받음
3. 배틀에서 텍스트 공격 작성 (최대 200자)
4. 승리하면 경험치 획득
5. 리더보드에서 순위 확인

## 라이선스

MIT