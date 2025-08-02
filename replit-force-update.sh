#!/bin/bash
echo "🔄 Replit 강제 업데이트 시작..."
echo "이 스크립트는 GitHub의 최신 코드로 강제로 업데이트합니다."

# Git 설정
echo "⚙️ Git 설정 중..."
git config pull.rebase false

# 로컬 변경사항 백업 (혹시 모르니)
echo "💾 로컬 변경사항 백업..."
git stash || echo "백업할 변경사항이 없습니다"

# 원격 저장소에서 최신 정보 가져오기
echo "📡 최신 정보 가져오기..."
git fetch origin main

# 강제로 원격 브랜치로 리셋
echo "🔨 원격 브랜치로 강제 리셋..."
git reset --hard origin/main

# 클린업
echo "🧹 임시 파일 제거..."
rm -rf .next node_modules package-lock.json

# 패키지 재설치
echo "📦 패키지 새로 설치..."
npm install --legacy-peer-deps

# 빌드
echo "🔨 프로젝트 빌드..."
npm run build

# 성공 메시지
echo "✅ 업데이트 완료!"
echo "🚀 이제 'npm run start'로 서버를 시작할 수 있습니다."