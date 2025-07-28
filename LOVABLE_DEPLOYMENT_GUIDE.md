# Lovable 배포 가이드

이 가이드는 Kid Text Battle 앱을 Lovable 플랫폼에 배포하는 방법을 설명합니다.

## 📋 사전 준비

1. Lovable 계정 생성 (https://lovable.dev)
2. GitHub 저장소 연동
3. PostgreSQL 데이터베이스 생성

## 🚀 배포 단계

### 1. GitHub에 코드 푸시
```bash
git add .
git commit -m "feat: Lovable 배포 설정 추가"
git push origin main
```

### 2. Lovable 대시보드에서 프로젝트 생성

1. Lovable 대시보드 접속
2. "New Project" 클릭
3. GitHub 저장소 선택: `jaeho-jang-dr/kid-text-battle`
4. Framework: Next.js 선택
5. "Create Project" 클릭

### 3. 환경 변수 설정

Lovable 프로젝트 설정에서 다음 환경 변수 추가:

```env
# 데이터베이스 (Lovable가 자동으로 제공)
DATABASE_URL=postgresql://username:password@host:port/database

# 인증 시크릿 (안전한 랜덤 문자열로 변경)
JWT_SECRET=your-very-secure-random-string-here

# 관리자 기본 비밀번호 (배포 후 즉시 변경)
ADMIN_DEFAULT_PASSWORD=1234

# 앱 URL (Lovable가 제공하는 URL)
NEXT_PUBLIC_APP_URL=https://your-app.lovable.app
```

### 4. 데이터베이스 초기화

1. Lovable 대시보드에서 Database 탭 접속
2. SQL 에디터 열기
3. `/scripts/migrate-to-postgres.sql` 파일 내용 실행

### 5. 배포 시작

1. Lovable 대시보드에서 "Deploy" 버튼 클릭
2. 빌드 로그 확인
3. 배포 완료 대기 (약 3-5분)

## 🔧 배포 후 설정

### 1. 관리자 비밀번호 변경

1. 배포된 앱 접속
2. 홈페이지 우측 하단 유니콘(🦄) 클릭
3. 기본 계정으로 로그인:
   - Username: `admin`
   - Password: `1234`
4. 관리자 대시보드에서 비밀번호 변경

### 2. 봇 캐릭터 확인

리더보드에서 봇 캐릭터들이 정상적으로 표시되는지 확인:
- 연습용 사자
- 훈련용 코끼리
- 대기중 펭귄
- AI 유니콘
- 연습 돌고래

### 3. 기능 테스트

1. **회원가입/로그인**: 이메일 및 게스트 로그인 테스트
2. **캐릭터 생성**: 동물 선택 및 캐릭터 생성
3. **배틀**: 일반 캐릭터 및 봇과의 배틀
4. **리더보드**: 순위 표시 확인

## 📊 모니터링

Lovable 대시보드에서 제공하는 기능:
- 실시간 로그
- 에러 추적
- 성능 모니터링
- 데이터베이스 상태

## 🔒 보안 체크리스트

- [ ] 관리자 비밀번호 변경
- [ ] JWT_SECRET 안전한 값으로 설정
- [ ] HTTPS 활성화 확인
- [ ] CORS 설정 확인

## 🆘 문제 해결

### 빌드 실패
- `package.json` 의존성 확인
- Node.js 버전 확인 (18.x 권장)

### 데이터베이스 연결 오류
- DATABASE_URL 환경 변수 확인
- PostgreSQL 서비스 상태 확인

### 페이지 로딩 오류
- 빌드 로그 확인
- 브라우저 콘솔 에러 확인

## 📞 지원

- Lovable 문서: https://docs.lovable.dev
- GitHub Issues: https://github.com/jaeho-jang-dr/kid-text-battle/issues