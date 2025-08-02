#!/bin/bash
echo "🧹 Replit 완전 초기화 시작..."

# Git 최신 버전 가져오기
echo "📥 최신 코드 가져오기..."
git pull origin main || echo "Git pull 건너뜀..."

# 캐시 및 임시 파일 완전 제거
echo "🗑️ 캐시 완전 제거..."
rm -rf .next
rm -rf node_modules
rm -rf .npm
rm -rf ~/.npm
rm -f package-lock.json

# Node 모듈 재설치
echo "📦 패키지 새로 설치..."
npm cache clean --force
npm install --legacy-peer-deps

# 환경 변수 설정
export NODE_ENV=production
export PORT=3000
export NEXT_TELEMETRY_DISABLED=1

# 빌드
echo "🔨 프로젝트 빌드..."
npm run build

# 서버 시작
echo "🚀 서버 시작..."
npm run start