# 🚀 Render.com 무료 배포 가이드

Kid Text Battle을 Render.com에 무료로 배포하는 방법입니다.

## 🎯 왜 Render.com?
- ✅ **완전 무료** (크레딧카드 불필요)
- ✅ **SQLite 지원** (디스크 스토리지 제공)
- ✅ **자동 배포** (GitHub 연동)
- ✅ **HTTPS 자동 제공**
- ✅ **환경 변수 관리 쉬움**

## 📋 배포 단계

### 1단계: Render 계정 생성
1. **https://render.com** 접속
2. **"Get Started for Free"** 클릭
3. GitHub 계정으로 로그인 (권장)

### 2단계: 새 Web Service 생성
1. Dashboard에서 **"New +"** → **"Web Service"** 클릭
2. **"Connect a repository"** 선택
3. GitHub 저장소 연결:
   - `jaeho-jang-dr/kid-text-battle` 선택
   - **"Connect"** 클릭

### 3단계: 서비스 설정
자동으로 감지된 설정을 확인하고 수정:

- **Name**: `kid-text-battle` (또는 원하는 이름)
- **Region**: `Singapore` (한국에서 가장 가까움)
- **Branch**: `main`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Plan**: **Free** 선택

### 4단계: 환경 변수 설정
**"Advanced"** 클릭 후 환경 변수 추가:

```
OPENAI_API_KEY = (본인의 OpenAI API 키)
DATABASE_PATH = /var/data/kid-text-battle.db
```

### 5단계: 디스크 추가 (중요!)
1. 아래로 스크롤해서 **"Add Disk"** 클릭
2. 설정:
   - **Name**: `sqlite-data`
   - **Mount Path**: `/var/data`
   - **Size**: `1 GB`

### 6단계: 배포!
**"Create Web Service"** 클릭

## ⏱️ 배포 진행
- 첫 배포는 5-10분 소요
- 빌드 로그를 실시간으로 확인 가능
- 성공하면 URL이 생성됨: `https://kid-text-battle.onrender.com`

## 🎉 배포 완료 후

### 관리자 접속
1. 배포된 URL 접속
2. 홈 우측 하단 유니콘(🦄) 클릭
3. 로그인:
   - Username: `admin`
   - Password: `1234`
4. **비밀번호 즉시 변경!**

### 주의사항
- 무료 플랜은 15분 동안 사용하지 않으면 자동으로 sleep
- 다시 접속하면 30초-1분 후 깨어남
- 데이터는 디스크에 영구 저장됨

## 🔧 문제 해결

### "Build failed" 에러
- package.json의 Node 버전 확인
- build 명령어가 올바른지 확인

### 앱이 시작되지 않음
- 환경 변수가 모두 설정되었는지 확인
- 로그에서 에러 메시지 확인

### 데이터베이스 에러
- 디스크가 제대로 마운트되었는지 확인
- DATABASE_PATH 환경 변수 확인

## 🌟 팁
- 무료 플랜도 충분히 안정적
- 사용자가 많아지면 유료 플랜 고려
- 백업은 주기적으로 수동 진행

준비되셨나요? 지금 바로 시작하세요! 🎮