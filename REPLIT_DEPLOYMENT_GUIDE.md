# Replit 배포 가이드 - Kid Text Battle

## 🚀 빠른 배포 단계

### 1. Replit 계정 만들기
- [replit.com](https://replit.com) 접속
- 무료 계정 생성

### 2. GitHub에서 Import
1. Replit 대시보드에서 **"Create Repl"** 클릭
2. **"Import from GitHub"** 선택
3. 다음 URL 입력:
   ```
   https://github.com/jaeho-jang-dr/kid-text-battle
   ```
4. **"Import from GitHub"** 클릭

### 3. 자동 설정
Replit이 자동으로:
- `.replit` 설정 파일 읽기
- Node.js 20 환경 설정
- 빌드 스크립트 실행

### 4. 환경 변수 설정 (선택사항)
Replit 좌측 메뉴에서 **"Secrets"** (자물쇠 아이콘) 클릭:
```
NODE_ENV = production
PORT = 3008
DATABASE_URL = file:./kid-text-battle.db
```
**참고**: 기본값이 설정되어 있어 이 단계는 선택사항입니다.

### 5. 첫 실행
1. 상단의 **"Run"** 버튼 클릭
2. 자동으로 `replit-build.sh` 스크립트가 실행되어:
   - 의존성 설치
   - 데이터베이스 초기화
   - 프로덕션 빌드 생성
   - 서버 시작
3. 우측 상단의 **"Webview"** 탭에서 앱 확인

## 🛠️ 빌드 에러 해결

### globals.css 에러 발생 시
만약 `app/globals.css` 관련 에러가 발생하면:

1. **Shell 탭에서 다음 명령어 실행**:
   ```bash
   # 종속성 재설치
   rm -rf node_modules package-lock.json
   npm install
   
   # 빌드 테스트
   npm run build
   ```

2. **package.json 스크립트 확인**:
   ```json
   "scripts": {
     "dev": "next dev -p 3008",
     "build": "next build",
     "start": "next start -p 3008"
   }
   ```

3. **Next.js 설정 확인** (next.config.js):
   ```javascript
   module.exports = {
     reactStrictMode: true,
     swcMinify: true,
   }
   ```

## 📱 도메인 설정
- Replit은 자동으로 URL 제공: `https://kid-text-battle-[username].repl.co`
- 커스텀 도메인 연결 가능 (유료 플랜)

## 🔧 문제 해결

### 빌드 에러 발생 시
```bash
npm install
npm run build
```

### 데이터베이스 초기화
```bash
node setup-admin.js
```

### 포트 에러
- Replit은 자동으로 포트 3008을 외부에 노출
- `.replit` 파일에서 포트 설정 확인

## 💾 데이터 지속성
- SQLite 파일은 Replit 파일 시스템에 저장
- 무료 플랜: 일정 기간 비활성 시 슬립 모드
- 유료 플랜: 상시 가동 가능

## 🎮 관리자 접근
1. 우측 하단 유니콘(🦄) 아이콘 클릭
2. 기본 계정: `admin` / `1234`
3. 관리자 페이지에서 게임 관리

## 📊 성능 최적화
- Replit 무료 플랜: 0.5 vCPU, 512MB RAM
- 권장: 100명 이하 동시 사용자
- 더 많은 사용자: 유료 플랜 업그레이드

## 🚨 보안 주의사항
1. **Secrets**에 민감한 정보 저장
2. 관리자 비밀번호 변경 필수
3. 정기적인 백업 권장

## 📞 지원
- Replit 커뮤니티: https://ask.replit.com
- GitHub Issues: https://github.com/jaeho-jang-dr/kid-text-battle/issues

---

**Happy Deploying! 🎉**