FROM node:20-alpine

# SQLite 의존성 설치
RUN apk add --no-cache python3 make g++ sqlite

WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production && \
    npm install better-sqlite3

# 소스 코드 복사
COPY . .

# Next.js 빌드
RUN npm run build

# 데이터 디렉토리 생성
RUN mkdir -p /data

# 포트 노출
EXPOSE 3008

# 시작 명령
CMD ["npm", "start"]