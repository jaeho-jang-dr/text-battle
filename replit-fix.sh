#!/bin/bash
echo "🔧 Replit 에러 수정 스크립트"

# 1. 캐시 정리
echo "1️⃣ 캐시 정리 중..."
rm -rf .next
rm -rf node_modules/.cache
echo "✅ 캐시 정리 완료"

# 2. 권한 수정
echo "2️⃣ 권한 설정 중..."
chmod -R 755 .
chmod 666 kid-text-battle.db 2>/dev/null || true
echo "✅ 권한 설정 완료"

# 3. 환경 변수 확인
echo "3️⃣ 환경 변수 설정..."
export NODE_ENV=production
export PORT=3000
export NEXT_TELEMETRY_DISABLED=1
echo "✅ 환경 변수 설정 완료"

# 4. 패키지 재설치
echo "4️⃣ 패키지 재설치 중..."
npm cache clean --force
npm install
echo "✅ 패키지 설치 완료"

# 5. 빌드
echo "5️⃣ 앱 빌드 중..."
npm run build

echo "🎉 수정 완료! 'npm run start'로 실행하세요"