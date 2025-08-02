# 🔧 Replit 문제 해결 가이드

## 🚨 "Module not found" 에러가 발생할 때

### 방법 1: Shell에서 직접 명령어 실행
1. Replit 왼쪽 메뉴에서 **Shell** 탭 클릭
2. 다음 명령어를 순서대로 입력:
```bash
git pull origin main
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
npm run start
```

### 방법 2: 클린 스타트 스크립트 실행
Shell에서:
```bash
bash replit-clean-start.sh
```

### 방법 3: Replit 프로젝트 재시작
1. 상단 메뉴에서 프로젝트 이름 옆 **⋮** 클릭
2. **"Stop"** 클릭
3. 잠시 기다린 후 **"Run"** 버튼 다시 클릭

## 🔄 그래도 안 될 때 - 완전 초기화

1. **Shell** 탭에서:
```bash
# 모든 캐시 제거
rm -rf .next node_modules .npm ~/.npm
rm -f package-lock.json

# Git 초기화
git fetch --all
git reset --hard origin/main

# 새로 설치
npm install --legacy-peer-deps
npm run build
npm run start
```

## ⚡ 빠른 해결책

대부분의 경우 이 명령어만 실행하면 해결됩니다:
```bash
git pull && rm -rf .next && npm run build && npm run start
```

## 📌 중요 팁
- Replit은 가끔 캐시 문제가 발생합니다
- 에러가 나면 먼저 `git pull`로 최신 코드를 받으세요
- `.next` 폴더를 삭제하면 대부분 해결됩니다

문제가 계속되면 GitHub Issues에 문의해주세요!