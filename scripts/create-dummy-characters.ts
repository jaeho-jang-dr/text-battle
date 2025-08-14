import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} from 'firebase/auth';
import * as bcrypt from 'bcryptjs';

// Firebase 설정 (실제 환경 변수나 설정 파일에서 가져와야 함)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abc123"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 더미 사용자 데이터
const dummyUsers = [
  {
    email: "testuser1@example.com",
    password: "TestPassword123!",
    name: "테스트 전사",
    characterType: "warrior"
  },
  {
    email: "testuser2@example.com", 
    password: "TestPassword123!",
    name: "테스트 마법사",
    characterType: "mage"
  }
];

// 캐릭터 스탯 생성 함수
function generateCharacterStats(characterType: string) {
  const baseStats = {
    warrior: {
      health: 120,
      attack: 25,
      defense: 20,
      speed: 15,
      magic: 5,
      critical: 10,
      evasion: 5
    },
    mage: {
      health: 80,
      attack: 15,
      defense: 10,
      speed: 20,
      magic: 30,
      critical: 15,
      evasion: 10
    }
  };

  return baseStats[characterType as keyof typeof baseStats] || baseStats.warrior;
}

async function createDummyCharacters() {
  console.log("🎮 더미 캐릭터 생성 시작...\n");

  for (const userData of dummyUsers) {
    try {
      console.log(`📝 사용자 생성 중: ${userData.email}`);
      
      // 1. Firebase Auth에 사용자 생성
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(
          auth, 
          userData.email, 
          userData.password
        );
        console.log(`✅ Firebase Auth 사용자 생성 완료`);
      } catch (authError: any) {
        if (authError.code === 'auth/email-already-in-use') {
          console.log(`ℹ️ 이미 존재하는 사용자, 로그인 시도...`);
          userCredential = await signInWithEmailAndPassword(
            auth, 
            userData.email, 
            userData.password
          );
        } else {
          throw authError;
        }
      }

      const userId = userCredential.user.uid;

      // 2. Firestore에 사용자 정보 저장
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const userDocRef = doc(db, 'users', userId);
      
      await setDoc(userDocRef, {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        provider: 'email',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Firestore 사용자 문서 생성 완료`);

      // 3. 캐릭터 생성
      const stats = generateCharacterStats(userData.characterType);
      const characterData = {
        userId: userId,
        name: userData.name,
        type: userData.characterType,
        level: 1,
        experience: 0,
        experienceToNext: 100,
        stats: stats,
        wins: 0,
        losses: 0,
        totalBattles: 0,
        winRate: 0,
        rating: 1000,
        dailyBattlesCount: 0,
        lastBattleTime: null,
        isNPC: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const charactersRef = collection(db, 'characters');
      const characterDoc = await addDoc(charactersRef, characterData);
      console.log(`✅ 캐릭터 생성 완료: ${userData.name} (ID: ${characterDoc.id})`);

      // 4. 사용자의 캐릭터 ID 업데이트
      await setDoc(userDocRef, {
        characterId: characterDoc.id
      }, { merge: true });

      console.log(`✨ ${userData.name} 생성 완료!\n`);
      console.log(`   이메일: ${userData.email}`);
      console.log(`   비밀번호: ${userData.password}`);
      console.log(`   캐릭터 타입: ${userData.characterType}`);
      console.log(`   초기 스탯:`, stats);
      console.log("─".repeat(50) + "\n");

    } catch (error) {
      console.error(`❌ ${userData.email} 생성 중 오류 발생:`, error);
    }
  }

  console.log("\n🎉 더미 캐릭터 생성 완료!");
  console.log("\n📋 테스트 계정 정보:");
  dummyUsers.forEach(user => {
    console.log(`   - ${user.email} / ${user.password}`);
  });
  
  process.exit(0);
}

// 스크립트 실행
createDummyCharacters().catch(error => {
  console.error("스크립트 실행 중 오류:", error);
  process.exit(1);
});