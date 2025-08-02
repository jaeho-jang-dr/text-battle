#!/bin/bash

echo "🚀 Replit 빌드 시작..."

# 환경 변수 설정
export NODE_ENV=production
export PORT=3008
export DATABASE_URL="file:./kid-text-battle.db"

# 캐시 및 이전 빌드 정리
echo "🧹 이전 빌드 정리 중..."
rm -rf .next
rm -rf node_modules/.cache

# 의존성 설치
echo "📦 의존성 설치 중..."
npm install --production=false

# 데이터베이스 초기화
echo "🗄️ 데이터베이스 설정 중..."
if [ ! -f "kid-text-battle.db" ]; then
  echo "새 데이터베이스 생성 중..."
  node setup-admin.js
fi

# 프로덕션 빌드
echo "🔨 프로덕션 빌드 중..."
npm run build

echo "✅ 빌드 완료!"
echo "🌟 'npm run start'로 서버를 시작하세요"