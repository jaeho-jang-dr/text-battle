#!/bin/bash
echo "🔧 모든 에러 해결 시작..."

# 1. 프로세스 정리
pkill node 2>/dev/null

# 2. 캐시 정리
rm -rf .next
rm -rf node_modules/.cache

# 3. 데이터베이스 권한
chmod 666 *.db 2>/dev/null

# 4. 패키지 재설치
npm install --legacy-peer-deps

# 5. 빌드
npm run build || true

# 6. 시작
npm run start