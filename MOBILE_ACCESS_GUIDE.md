# 아이폰에서 접속하는 방법

## 현재 서버 정보
- **개발 서버**: 실행 중 ✅
- **로컬 주소**: http://localhost:3000
- **WSL IP 주소**: 172.20.159.125

## 아이폰에서 접속하기

### 방법 1: 같은 Wi-Fi 네트워크 사용 (권장)
1. 아이폰과 컴퓨터가 **같은 Wi-Fi**에 연결되어 있는지 확인
2. 아이폰에서 Safari 브라우저 열기
3. 주소창에 입력: `http://172.20.159.125:3000`

### 방법 2: Windows 방화벽 설정
만약 접속이 안 된다면 Windows 방화벽에서 포트를 열어야 합니다:

1. Windows PowerShell을 **관리자 권한**으로 실행
2. 다음 명령어 실행:
```powershell
New-NetFirewallRule -DisplayName "Next.js Dev Server" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

### 방법 3: 포트 포워딩 설정
WSL2에서 Windows로 포트 포워딩:

1. Windows PowerShell (관리자 권한)에서:
```powershell
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=172.20.159.125
```

2. Windows IP 확인:
```powershell
ipconfig
```
Wi-Fi 어댑터의 IPv4 주소를 찾으세요 (예: 192.168.1.100)

3. 아이폰에서 `http://[Windows IP]:3000` 접속

### 접속 확인
- 아이폰에서 "동물 친구들 배틀" 페이지가 나타나면 성공!
- 로그인이나 회원가입은 Supabase 설정이 필요합니다

### 문제 해결
- 접속 안 될 때: 방화벽 설정 확인
- 페이지 로딩 안 될 때: 서버가 실행 중인지 확인
- IP 주소가 바뀌었을 때: `hostname -I` 명령으로 새 IP 확인

## 개발 서버 종료/재시작
- 종료: `Ctrl + C`
- 재시작: `npm run dev --prefix /home/drjang00/DevEnvironments/kid-text-battle`