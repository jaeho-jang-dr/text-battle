#!/bin/bash

echo "🚀 Kid Text Battle 설정을 시작합니다..."
echo ""

# 1. 의존성 설치
echo "1️⃣ 의존성 설치 중..."
npm install

# 2. 동물 데이터 추가
echo ""
echo "2️⃣ 동물 데이터 추가 중..."
node add-all-animals.js

# 3. 관리자 계정 설정
echo ""
echo "3️⃣ 관리자 계정 설정 중..."
node setup-admin.js

# 4. 빌드
echo ""
echo "4️⃣ 프로덕션 빌드 중 (3-5분 소요)..."
npm run build

echo ""
echo "✅ 설정 완료!"
echo ""
echo "🎮 실행하려면: npm start"
echo "🌐 또는 Run 버튼을 클릭하세요"