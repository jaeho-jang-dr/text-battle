# 🚀 Replit 간단 배포 가이드

## 새로운 접근 방법

모든 복잡한 설정을 제거하고 가장 단순한 방법으로 배포합니다.

## 1단계: GitHub 푸시
```bash
git add .
git commit -m "simplify: Replit 배포 단순화"
git push animal-repo main
```

## 2단계: Replit에서 실행

### 방법 A: 새 Repl 만들기
1. Replit.com 로그인
2. "Create Repl" → "Import from GitHub"
3. `https://github.com/jaeho-jang-dr/animal-text-battle` 입력
4. Import 클릭

### 방법 B: 기존 Repl 사용
1. Shell 탭에서:
```bash
git pull origin main
rm -rf node_modules .next package-lock.json
npm install
```

## 3단계: Secrets 설정
Secrets 탭에서:
- JWT_SECRET = [긴 랜덤 문자열]
- SESSION_SECRET = [긴 랜덤 문자열]

## 4단계: 실행
Run 버튼 클릭!

## 주요 변경사항
- ✅ 단순화된 .replit 파일
- ✅ 최소한의 replit.nix
- ✅ postinstall로 자동 빌드
- ✅ 복잡한 스크립트 제거
- ✅ SQLite 기본 사용

## 작동 원리
1. `npm install` 실행 시 자동으로 `npm run build` 실행 (postinstall)
2. Run 버튼 클릭 시 `npm run start`만 실행
3. 빌드된 앱이 3008 포트에서 실행

끝!