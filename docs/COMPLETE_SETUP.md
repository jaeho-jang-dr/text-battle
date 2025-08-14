# Text Battle Game - 완전 작동 가이드

## 🎮 모든 기능이 정상 작동합니다!

### 수정 내용 요약

1. **✅ 인증 시스템 간소화**
   - NextAuth를 간단한 메모리 기반 시스템으로 변경
   - SecretSession 오류 해결
   - 모든 API가 통일된 인증 사용

2. **✅ 자동 캐릭터 생성**
   - 회원가입 시 자동으로 캐릭터 생성
   - 기본 배틀 챗 자동 설정
   - 즉시 리더보드에 등록

3. **✅ 배틀 시스템**
   - NextAuth 세션 기반으로 변경
   - NPC와 즉시 배틀 가능
   - 일일 10회 제한

## 🚀 앱 실행 방법

### 1. 앱 시작 (포트 3008)
```bash
npm run dev
```

### 2. NPC 초기화 (첫 실행 시)
```bash
npx tsx scripts/init-npcs-simple.ts
```

### 3. 브라우저에서 접속
http://localhost:3008

## 🎯 게임 플레이 순서

### 1. 회원가입
- 홈페이지에서 "시작하기" 클릭
- "이메일로 가입/로그인" 선택
- Sign Up 버튼 클릭하여 가입 모드로 전환
- 사용자명, 이메일, 비밀번호 입력

### 2. 자동 캐릭터 생성
- 가입 완료 시 자동으로 캐릭터 생성
- 기본 배틀 챗: "안녕하세요! [사용자명]입니다!"
- 바로 배틀 가능

### 3. 배틀 시작
- 로그인 후 "⚔️ 배틀 시작!" 클릭
- 20개의 NPC 중 선택하여 배틀
- 배틀 챗의 길이와 복잡도로 승부 결정

### 4. 리더보드
- "🏆 리더보드"에서 순위 확인
- ELO 점수 기반 랭킹
- NPC와 플레이어 모두 표시

## 📝 테스트 계정

### 이메일 가입
- Email: test@example.com
- Password: 123456
- Username: TestPlayer

### 게스트 플레이
- 홈에서 "👤 게스트로 플레이"
- 원하는 닉네임 입력 (최대 10자)

## 🔧 문제 해결

### NPC가 없는 경우
```bash
npx tsx scripts/init-npcs-simple.ts
```

### 데이터베이스 상태 확인
```bash
curl http://localhost:3008/api/debug
```

### 캐시 초기화가 필요한 경우
1. 브라우저 개발자 도구 (F12)
2. Application 탭
3. Clear Storage 클릭

## ✨ SuperClaude 엔드포인트

```bash
# 모든 기능 활성화
curl "http://localhost:3008/api/endpoint?c7=true&seq=true&magic=true&memory=true&serena=true&persona=true"
```

## 🎉 즐거운 게임 되세요!

모든 기능이 정상 작동합니다. 문제가 있으면 서버를 재시작하고 NPC를 다시 초기화해보세요.