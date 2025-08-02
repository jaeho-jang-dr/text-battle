#!/bin/bash

# Vercel 배포를 위한 자동 설정 스크립트

echo "🚀 Kid Text Battle - Vercel 배포 준비 스크립트"
echo "============================================"

# 환경 변수 예시 파일 생성
if [ ! -f .env.local ]; then
    cat > .env.local.example << 'EOF'
# Neon PostgreSQL Database URL
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require

# OpenAI API Key  
OPENAI_API_KEY=sk-...

# Environment
NODE_ENV=production
USE_SQLITE=false
EOF
    echo "✅ .env.local.example 파일 생성 완료"
fi

# gitignore 확인
if ! grep -q ".env.local" .gitignore 2>/dev/null; then
    echo ".env.local" >> .gitignore
    echo "✅ .gitignore에 .env.local 추가"
fi

# 패키지 설치
echo "📦 패키지 설치 중..."
npm install

echo ""
echo "🎯 다음 단계:"
echo "1. Neon (https://neon.tech)에서 데이터베이스 생성"
echo "2. .env.local.example을 .env.local로 복사하고 실제 값 입력"
echo "3. Vercel (https://vercel.com)에서 프로젝트 import"
echo ""
echo "자세한 내용은 vercel-deployment-guide.md 참조"