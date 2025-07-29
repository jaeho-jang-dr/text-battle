#!/bin/bash
echo "🚀 Kid Text Battle 시작 중..."

# 환경 변수 설정
export NODE_ENV=production
export PORT=3000
export DATABASE_URL=./kid-text-battle.db

# 데이터베이스 권한 설정
if [ -f "kid-text-battle.db" ]; then
  chmod 666 kid-text-battle.db
  echo "✅ 데이터베이스 권한 설정 완료"
fi

# Next.js 서버 시작
echo "🌐 서버 시작 중... (포트: $PORT)"
npm run start