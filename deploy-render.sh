#!/bin/bash
echo "🚀 Render.com 자동 배포 스크립트"
echo "================================"
echo ""
echo "⚠️  이 스크립트는 배포 준비를 도와드립니다."
echo "   실제 배포는 Render.com에서 진행해야 합니다."
echo ""

# 1. 환경 확인
echo "1️⃣ 환경 확인 중..."
if ! command -v git &> /dev/null; then
    echo "❌ Git이 설치되어 있지 않습니다."
    exit 1
fi

# 2. 최신 변경사항 커밋
echo "2️⃣ 변경사항 확인 중..."
if [[ -n $(git status -s) ]]; then
    echo "📝 커밋되지 않은 변경사항이 있습니다."
    git add -A
    git commit -m "chore: Render 배포 준비"
    git push origin main
else
    echo "✅ 모든 변경사항이 커밋되어 있습니다."
fi

# 3. 배포 URL 생성
echo ""
echo "3️⃣ 다음 단계를 따라하세요:"
echo ""
echo "1. 이 URL을 브라우저에서 열기:"
echo "   👉 https://dashboard.render.com/select-repo?type=web"
echo ""
echo "2. GitHub 저장소 선택:"
echo "   👉 jaeho-jang-dr/kid-text-battle"
echo ""
echo "3. 다음 환경 변수 추가:"
echo "   OPENAI_API_KEY = (본인의 API 키)"
echo "   DATABASE_PATH = /var/data/kid-text-battle.db"
echo "   USE_SQLITE = true"
echo ""
echo "4. Disk 추가:"
echo "   Name: sqlite-data"
echo "   Mount Path: /var/data"
echo "   Size: 1 GB"
echo ""
echo "5. 'Create Web Service' 클릭!"
echo ""
echo "📋 환경 변수 복사용:"
echo "------------------------"
cat .env.render
echo "------------------------"
echo ""
echo "🎉 준비 완료! 위 단계를 따라 배포하세요."