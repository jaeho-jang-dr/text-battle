# Neon.tech 무료 PostgreSQL 설정 가이드

## 1. Neon.tech 가입 (2분)
1. https://neon.tech 접속
2. "Start Free" 클릭
3. GitHub로 로그인

## 2. 데이터베이스 생성 (1분)
1. "Create Database" 클릭
2. 프로젝트 이름: "kid-text-battle"
3. Region: "US East" 선택
4. "Create Project" 클릭

## 3. 연결 문자열 복사
1. Dashboard에서 "Connection Details" 확인
2. "Connection string" 복사
3. 형식: postgresql://username:password@host.neon.tech/database?sslmode=require

## 4. .env.local 업데이트
복사한 연결 문자열을 DATABASE_URL에 붙여넣기