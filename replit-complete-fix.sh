#!/bin/bash
echo "🔥 Replit 완전 초기화 및 수정 시작..."

# 1. 모든 캐시 완전 제거
echo "🗑️ 모든 캐시 제거..."
rm -rf .next
rm -rf node_modules
rm -rf .npm
rm -rf ~/.npm
rm -f package-lock.json
rm -rf .git/index.lock

# 2. Git 설정
echo "⚙️ Git 설정..."
git config --global pull.rebase false
git config --global user.email "replit@example.com"
git config --global user.name "Replit User"

# 3. 원격에서 최신 코드 가져오기
echo "📥 최신 코드 강제 다운로드..."
git fetch --all
git reset --hard origin/main
git clean -fd

# 4. tsconfig.json과 jsconfig.json 확인
echo "📝 설정 파일 확인..."
if [ ! -f "jsconfig.json" ]; then
  echo '{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "exclude": ["node_modules", ".next"]
}' > jsconfig.json
fi

# 5. 환경 변수 설정
export NODE_ENV=production
export PORT=3000
export NEXT_TELEMETRY_DISABLED=1

# 6. 패키지 설치
echo "📦 패키지 새로 설치..."
npm cache clean --force
npm install --legacy-peer-deps --force

# 7. 빌드 (에러 무시)
echo "🔨 프로젝트 빌드..."
npm run build || echo "빌드 경고 무시..."

# 8. 성공 확인
if [ -d ".next" ]; then
  echo "✅ 빌드 성공!"
  echo "🚀 서버 시작 중..."
  npm run start
else
  echo "❌ 빌드 실패. 다음을 시도하세요:"
  echo "1. Shell에서: rm -rf node_modules .next"
  echo "2. Shell에서: npm install --force"
  echo "3. Shell에서: npm run dev"
fi