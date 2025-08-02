# Lovable 환경 변수 설정 가이드

이 파일의 내용을 Lovable 프로젝트 설정의 Environment Variables 섹션에 복사해서 사용하세요.

## 필수 환경 변수

```env
# 데이터베이스 URL (Lovable가 자동으로 제공)
# DATABASE_URL은 Lovable에서 자동으로 설정됩니다. 직접 입력하지 마세요.

# JWT 시크릿 (아래 값을 그대로 사용하거나 새로운 랜덤 문자열로 변경)
JWT_SECRET=kidtextbattle-jwt-secret-2024-lovable-deployment

# 관리자 기본 비밀번호 (배포 후 반드시 변경하세요!)
ADMIN_DEFAULT_PASSWORD=1234

# OpenAI API 키 (여기에 본인의 API 키를 입력하세요)
OPENAI_API_KEY=여기에_본인의_OpenAI_API_키를_입력하세요

# Next.js 환경 설정
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app-name.lovable.app

# 포트 설정 (Lovable 기본값)
PORT=3000
```

## 설정 방법

1. Lovable 대시보드에서 프로젝트 선택
2. Settings → Environment Variables 이동
3. "Add Variable" 버튼 클릭
4. 위의 각 변수를 하나씩 추가 (DATABASE_URL 제외)
5. OPENAI_API_KEY에 실제 API 키 입력
6. NEXT_PUBLIC_APP_URL의 "your-app-name"을 실제 앱 이름으로 변경
7. Save Changes 클릭

## 중요 사항

- DATABASE_URL은 Lovable에서 자동으로 제공하므로 직접 설정하지 마세요
- OPENAI_API_KEY는 반드시 유효한 키를 입력해야 배틀 기능이 작동합니다
- 배포 후 관리자 페이지(홈 우측 하단 🦄)에서 비밀번호를 변경하세요

## 배포 후 확인사항

1. 홈페이지 정상 로딩
2. 게스트/이메일 로그인 테스트
3. 캐릭터 생성 테스트
4. 봇과의 배틀 테스트
5. 리더보드 확인