# Kid Text Battle - Vercel 배포 가이드

## 당신이 직접 해야 할 일들:

### 1. Neon PostgreSQL 설정 (5분)
1. https://neon.tech 접속
2. GitHub로 로그인
3. "Create a project" 클릭
   - Project name: `kid-text-battle`
   - Region: `Asia Pacific (Singapore)` 선택
4. DATABASE_URL 복사 (postgresql://... 형식)

### 2. Vercel 계정 및 프로젝트 설정 (5분)
1. https://vercel.com 접속
2. GitHub로 로그인
3. "Import Project" 클릭
4. GitHub 리포지토리 선택: `jaeho-jang-dr/kid-text-battle`
5. Configure Project에서 환경 변수 추가:
   - `DATABASE_URL`: Neon에서 복사한 URL
   - `OPENAI_API_KEY`: 당신의 OpenAI API Key
   - `USE_SQLITE`: `false`
   - `NODE_ENV`: `production`

### 3. 배포 시작
- "Deploy" 버튼 클릭
- 자동으로 빌드 및 배포 진행 (약 2-3분)

## 제가 이미 준비한 것들:

1. ✅ vercel.json 설정 완료
2. ✅ PostgreSQL 마이그레이션 스크립트 준비
3. ✅ 환경 변수 설정 구조
4. ✅ Neon 데이터베이스 초기화 스크립트

## 배포 후 데이터베이스 초기화:

Vercel 배포 완료 후, 터미널에서:

```bash
cd /home/drjang00/DevEnvironments/kid-text-battle
export DATABASE_URL="Neon에서 복사한 URL"
npm run db:init
```

## 보안 주의사항:

1. **절대 하지 말아야 할 것**:
   - DATABASE_URL이나 API Key를 코드에 직접 작성
   - .env 파일을 git에 커밋
   - 환경 변수를 공개 리포지토리에 노출

2. **안전한 방법**:
   - Vercel 대시보드에서만 환경 변수 설정
   - 로컬에서는 .env.local 사용 (gitignore됨)

## 문제 해결:

- **빌드 실패**: Vercel 로그 확인
- **데이터베이스 연결 실패**: DATABASE_URL 형식 확인
- **API 에러**: OpenAI API Key 유효성 확인

## 예상 소요 시간: 총 15-20분
- Neon 설정: 5분
- Vercel 설정: 5분
- 배포 대기: 3분
- DB 초기화: 2분