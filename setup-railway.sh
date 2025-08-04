#!/bin/bash

echo "🚀 Railway 배포 자동 설정 스크립트"
echo "=================================="

# Railway CLI 확인
if ! command -v railway &> /dev/null; then
    echo "📦 Railway CLI 설치 중..."
    npm install -g @railway/cli
fi

# Railway 로그인
echo "🔐 Railway 로그인..."
railway login

# 프로젝트 생성
echo "🏗️ Railway 프로젝트 생성 중..."
railway init

# PostgreSQL 추가
echo "🗄️ PostgreSQL 데이터베이스 추가 중..."
railway add

# 환경 변수 설정
echo "⚙️ 환경 변수 설정 중..."
railway variables set NODE_ENV=production
railway variables set PORT=3008

# 배포
echo "🚀 배포 시작..."
railway up

echo "✅ Railway 배포 완료!"
echo "🌐 railway open 명령어로 앱을 확인하세요"