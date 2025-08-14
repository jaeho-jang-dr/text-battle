// 개발 환경용 간단한 더미 캐릭터 생성 스크립트
// Memory Store를 사용하는 auth-simple.ts와 호환

import * as bcrypt from 'bcryptjs';

const API_BASE_URL = 'http://localhost:3009/api';

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

async function createDummyCharacters() {
  console.log("🎮 더미 캐릭터 생성 시작 (개발 환경)...\n");

  for (const userData of dummyUsers) {
    try {
      console.log(`📝 사용자 생성 중: ${userData.email}`);
      
      // 1. 회원가입 API 호출
      const signupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          name: userData.name,
          characterType: userData.characterType
        })
      });

      if (!signupResponse.ok) {
        const errorData = await signupResponse.json();
        
        // 이미 존재하는 사용자인 경우 스킵
        if (errorData.error === 'User already exists') {
          console.log(`ℹ️ 이미 존재하는 사용자: ${userData.email}`);
          continue;
        }
        
        throw new Error(errorData.error || 'Signup failed');
      }

      const signupData = await signupResponse.json();
      console.log(`✅ 사용자 생성 완료: ${signupData.user.name}`);

      // 2. 로그인 테스트
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password
        })
      });

      if (!loginResponse.ok) {
        throw new Error('Login test failed');
      }

      const loginData = await loginResponse.json();
      console.log(`✅ 로그인 테스트 성공`);

      // 3. 캐릭터 정보 확인
      const characterResponse = await fetch(`${API_BASE_URL}/characters/my`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
        }
      });

      if (characterResponse.ok) {
        const characterData = await characterResponse.json();
        console.log(`✨ ${userData.name} 생성 완료!\n`);
        console.log(`   이메일: ${userData.email}`);
        console.log(`   비밀번호: ${userData.password}`);
        console.log(`   캐릭터 타입: ${userData.characterType}`);
        console.log(`   캐릭터 ID: ${characterData.id}`);
        console.log(`   초기 스탯:`, characterData.stats);
      }

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
}

// 서버가 준비될 때까지 대기
async function waitForServer() {
  console.log("🔄 서버 연결 대기 중...");
  
  for (let i = 0; i < 30; i++) {
    try {
      const response = await fetch(API_BASE_URL);
      if (response.ok || response.status === 404) {
        console.log("✅ 서버 연결 성공!");
        return true;
      }
    } catch (error) {
      // 연결 실패 시 계속 시도
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error("서버 연결 실패");
}

// 메인 실행 함수
async function main() {
  try {
    await waitForServer();
    await createDummyCharacters();
    console.log("\n✅ 모든 작업 완료!");
  } catch (error) {
    console.error("❌ 스크립트 실행 중 오류:", error);
    process.exit(1);
  }
}

// 스크립트 실행
main();