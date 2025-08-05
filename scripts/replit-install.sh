#!/bin/bash

echo "🔧 Replit 의존성 설치 시작..."

# node_modules 제거
if [ -d "node_modules" ]; then
  echo "📦 기존 node_modules 제거 중..."
  rm -rf node_modules
fi

# package-lock.json 제거
if [ -f "package-lock.json" ]; then
  echo "🔒 package-lock.json 제거 중..."
  rm -f package-lock.json
fi

# npm 캐시 정리
echo "🧹 npm 캐시 정리 중..."
npm cache clean --force

# 의존성 설치
echo "📥 의존성 설치 중..."
npm install --force

echo "✅ 의존성 설치 완료!"