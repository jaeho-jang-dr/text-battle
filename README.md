# Kid Text Battle

동물 데이터베이스 프로젝트

## 프로젝트 구조

```
├── app/              # Next.js 13 App Router
├── database/         # 데이터베이스 스키마 및 시드 데이터
├── lib/              # 유틸리티 함수
└── types/            # TypeScript 타입 정의
```

## 시작하기

1. 의존성 설치
```bash
npm install
```

2. 환경변수 설정
```bash
cp .env.local.example .env.local
# Supabase URL과 API 키 입력
```

3. 데이터베이스 설정
- Supabase 대시보드에서 `database/animals-only-schema.sql` 실행
- `database/animals-seed.sql`로 초기 데이터 추가

4. 개발 서버 실행
```bash
npm run dev
```

## 동물 데이터

- **현존 동물**: 사자, 코끼리, 펭귄, 돌고래, 호랑이, 판다
- **전설의 동물**: 유니콘, 드래곤, 불사조, 페가수스, 그리핀
- **고생대 동물**: 티라노사우루스, 트리케라톱스, 프테라노돈, 브라키오사우루스, 스테고사우루스