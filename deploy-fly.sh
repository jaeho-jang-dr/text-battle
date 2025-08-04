#!/bin/bash

echo "🚀 Fly.io 배포 스크립트"
echo "====================="

# Fly CLI 확인
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI가 설치되지 않았습니다."
    echo "📦 설치 방법: curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# 로그인 확인
echo "🔐 Fly.io 로그인 확인 중..."
if ! fly auth whoami &> /dev/null; then
    echo "📝 Fly.io 로그인이 필요합니다."
    fly auth login
fi

# 앱 생성 또는 기존 앱 사용
echo "🏗️ Fly.io 앱 설정 중..."
if ! fly status &> /dev/null; then
    echo "새 앱을 생성합니다..."
    fly launch --name kid-text-battle-app --region nrt --no-deploy
fi

# 볼륨 생성 (SQLite 데이터 저장용)
echo "💾 데이터 볼륨 확인 중..."
if ! fly volumes list | grep -q "kid_text_battle_data"; then
    echo "데이터 볼륨 생성 중..."
    fly volumes create kid_text_battle_data --size 1 --region nrt
fi

# 배포
echo "🚀 배포 시작..."
fly deploy

# 배포 상태 확인
echo "✅ 배포 완료!"
echo "🌐 앱 URL 확인:"
fly info
echo ""
echo "📊 앱 상태 확인: fly status"
echo "📝 로그 확인: fly logs"
echo "🌐 브라우저에서 열기: fly open"