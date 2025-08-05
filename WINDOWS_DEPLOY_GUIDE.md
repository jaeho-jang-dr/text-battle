# Windows에서 Fly.io 배포 가이드

## 🚀 빠른 시작 (PowerShell 사용)

### 1. PowerShell 관리자 권한으로 실행
- Windows 키 누르기
- "PowerShell" 검색
- "Windows PowerShell"에 우클릭
- "관리자 권한으로 실행" 클릭

### 2. 프로젝트 폴더로 이동
```powershell
cd C:\Users\장재호\workspace\kid-text-battle
```

### 3. 배포 스크립트 실행
```powershell
.\deploy-fly-windows.ps1
```

스크립트가 자동으로:
- Fly.io CLI 설치
- 로그인 처리
- 앱 생성
- 데이터베이스 볼륨 생성
- 배포 실행

## 🎯 수동 설치 방법

### 1. Fly.io CLI 설치
PowerShell에서:
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

### 2. PowerShell 재시작
설치 후 PowerShell을 닫고 다시 열어주세요.

### 3. 로그인
```powershell
fly auth login
```
브라우저가 열리면 로그인하세요.

### 4. 배포
```powershell
cd C:\Users\장재호\workspace\kid-text-battle
fly launch
```

질문에 답변:
- App name: `kid-text-battle-app` (또는 원하는 이름)
- Region: `nrt` (Tokyo - 한국에서 가장 가까움)
- Deploy now?: `Yes`

### 5. 데이터 볼륨 생성
```powershell
fly volumes create kid_text_battle_data --size 1 --region nrt
```

### 6. 재배포
```powershell
fly deploy
```

## 📱 Git Bash 사용 방법 (선택사항)

Git Bash가 설치되어 있다면:

1. Git Bash 실행
2. 프로젝트 폴더로 이동:
   ```bash
   cd /c/Users/장재호/workspace/kid-text-battle
   ```
3. 배포 스크립트 실행:
   ```bash
   chmod +x deploy-fly.sh
   ./deploy-fly.sh
   ```

## ✅ 배포 확인

배포 완료 후:
```powershell
# 앱 상태 확인
fly status

# 브라우저에서 열기
fly open

# 로그 확인
fly logs
```

## 🆘 문제 해결

### "fly 명령을 찾을 수 없습니다" 오류
1. PowerShell 재시작
2. 다시 설치:
   ```powershell
   iwr https://fly.io/install.ps1 -useb | iex
   ```

### 실행 정책 오류
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 배포 실패
```powershell
# 로그 확인
fly logs

# SSH 접속하여 디버깅
fly ssh console
```

## 🌐 배포 완료!

배포가 완료되면:
- URL: `https://kid-text-battle-app.fly.dev`
- 관리자 패널: 우측 하단 유니콘(🦄) 클릭
- 기본 계정: `admin` / `1234`