# Kid Text Battle 배포 가이드

## 1. Supabase 설정

### 1.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 가입/로그인
2. "New Project" 클릭
3. 프로젝트 이름: `kid-text-battle`
4. 데이터베이스 비밀번호 설정 (안전하게 보관)
5. Region: `Northeast Asia (Seoul)`
6. "Create new project" 클릭

### 1.2 데이터베이스 설정
1. SQL Editor로 이동
2. `database/schema.sql` 내용 복사하여 실행
3. `database/seed.sql` 내용 복사하여 실행

### 1.3 환경 변수 가져오기
1. Project Settings > API
2. 다음 값들을 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Vercel 배포

### 2.1 GitHub 리포지토리 생성
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/kid-text-battle.git
git push -u origin main
```

### 2.2 Vercel 프로젝트 연결
1. [Vercel](https://vercel.com)에 가입/로그인
2. "Import Project" 클릭
3. GitHub 리포지토리 선택
4. Framework Preset: `Next.js` (자동 감지됨)

### 2.3 환경 변수 설정
Vercel 프로젝트 설정에서 다음 환경 변수 추가:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key

### 2.4 배포
1. "Deploy" 클릭
2. 배포 완료까지 대기 (약 2-3분)
3. 제공된 URL로 접속하여 확인

## 3. 배포 후 설정

### 3.1 Supabase Authentication
1. Supabase Dashboard > Authentication > URL Configuration
2. Site URL에 Vercel 배포 URL 추가
3. Redirect URLs에 다음 추가:
   - `https://your-app.vercel.app/*`

### 3.2 모니터링
- Vercel Dashboard에서 실시간 로그 확인
- Supabase Dashboard에서 데이터베이스 사용량 모니터링

## 4. 업데이트 방법
```bash
git add .
git commit -m "Update message"
git push origin main
```
Vercel이 자동으로 재배포 시작

## 5. 트러블슈팅

### Build 실패 시
1. 로컬에서 `npm run build` 실행하여 에러 확인
2. TypeScript 에러 확인: `npm run typecheck`
3. ESLint 에러 확인: `npm run lint`

### 데이터베이스 연결 실패 시
1. 환경 변수가 올바르게 설정되었는지 확인
2. Supabase 프로젝트가 활성 상태인지 확인
3. RLS 정책이 올바르게 설정되었는지 확인

### 성능 최적화
1. Vercel Analytics 활성화
2. 이미지 최적화 (Next.js Image 컴포넌트 사용)
3. 불필요한 재렌더링 방지 (React.memo 사용)