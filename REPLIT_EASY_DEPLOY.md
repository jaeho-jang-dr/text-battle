# 🚀 Replit 초간단 무료 배포 가이드

Kid Text Battle을 Replit에 무료로 배포하는 가장 쉬운 방법입니다!

## 📋 필요한 것
1. Replit 계정 (무료)
2. OpenAI API 키 (이미 가지고 계심)

## 🎯 3단계로 끝내는 배포

### 1단계: Replit에서 프로젝트 가져오기
1. **https://replit.com** 접속 및 로그인
2. 우측 상단 **"+ Create"** 버튼 클릭
3. **"Import from GitHub"** 선택
4. URL 입력: `https://github.com/jaeho-jang-dr/kid-text-battle`
5. **"Import from GitHub"** 버튼 클릭

### 2단계: 환경 변수 설정
1. 왼쪽 메뉴에서 **"Secrets"** 탭 클릭 (자물쇠 아이콘)
2. 다음 변수들을 추가:
   ```
   OPENAI_API_KEY = (여기에 본인의 OpenAI API 키 입력)
   JWT_SECRET = kidtextbattle-jwt-secret-replit-2024
   ADMIN_DEFAULT_PASSWORD = 1234
   ```

### 3단계: 실행!
1. 상단의 큰 **"Run"** 버튼 클릭
2. 1-2분 기다리면 앱이 실행됩니다
3. 오른쪽 화면에 앱이 나타납니다!

## 🎉 완료!

배포가 완료되면:
- URL: `https://kid-text-battle.사용자이름.repl.co`
- 이 URL을 친구들과 공유하세요!

## 📱 첫 사용 가이드

1. **관리자 접속**: 홈 우측 하단 유니콘(🦄) 클릭
   - Username: `admin`
   - Password: `1234`
   - 로그인 후 비밀번호 변경 권장!

2. **게임 시작**:
   - 게스트 로그인 또는 이메일 로그인
   - 동물 선택하여 캐릭터 생성
   - 다른 플레이어나 봇과 배틀!

## ❓ 문제 해결

- **"Run" 버튼이 작동하지 않으면**: 
  - 페이지 새로고침 후 다시 시도
  - Shell 탭에서 `npm run start` 직접 입력

- **앱이 느리게 로드되면**:
  - 정상입니다! 무료 플랜은 첫 로드가 느릴 수 있습니다
  - 한번 로드되면 빨라집니다

## 🌟 팁
- Replit 무료 플랜은 일정 시간 사용하지 않으면 자동으로 꺼집니다
- 다시 접속하면 자동으로 켜집니다 (30초-1분 소요)
- 항상 켜두려면 Replit 유료 플랜이 필요합니다

준비되셨나요? 지금 바로 시작하세요! 🎮