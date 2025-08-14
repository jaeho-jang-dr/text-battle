# Firebase Setup Guide

이 프로젝트는 Firebase를 사용하여 데이터베이스와 배포를 진행합니다.

## Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com)에 접속하여 새 프로젝트를 생성합니다.

2. Firebase 프로젝트에서 다음 서비스를 활성화합니다:
   - Authentication (이메일/비밀번호 인증 활성화)
   - Firestore Database
   - Hosting

3. Firebase 프로젝트 설정에서 웹 앱을 추가하고 설정 정보를 복사합니다.

4. Firebase Admin SDK 키를 생성합니다:
   - 프로젝트 설정 > 서비스 계정 > 새 비공개 키 생성

## 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정합니다:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# NextAuth
NEXTAUTH_URL=http://localhost:3009
NEXTAUTH_SECRET=your-nextauth-secret

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Admin
ADMIN_PASSWORD=your-admin-password
```

## Firebase 배포

1. Firebase CLI로 로그인:
```bash
firebase login
```

2. 프로젝트 ID 설정:
```bash
firebase use your-project-id
```

3. 앱 빌드:
```bash
npm run build
```

4. Firebase에 배포:
```bash
firebase deploy
```

## 개발 서버 실행

```bash
npm run dev
```

앱이 http://localhost:3009 에서 실행됩니다.

## 데이터베이스 구조

Firebase Firestore 컬렉션:
- `users` - 사용자 정보
- `characters` - 캐릭터 정보
- `battles` - 전투 기록
- `battle_logs` - 전투 로그
- `npcs` - NPC 정보
- `leaderboard` - 리더보드 (캐시)