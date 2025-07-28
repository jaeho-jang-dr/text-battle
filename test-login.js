// 테스트 스크립트 - 로그인 및 캐릭터 생성 테스트

const BASE_URL = 'http://localhost:3000';

// 테스트 계정 1
async function testUser1() {
  console.log('\n=== 테스트 계정 1: 이메일 로그인 ===');
  
  try {
    // 1. 이메일 로그인
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test1@example.com',
        isGuest: false
      })
    });
    
    const loginData = await loginRes.json();
    console.log('로그인 성공:', loginData.data.user.email);
    const token = loginData.data.token;
    
    // 2. 동물 목록 가져오기
    const animalsRes = await fetch(`${BASE_URL}/api/animals`);
    const animalsData = await animalsRes.json();
    console.log('동물 목록 로드 완료:', animalsData.data.length, '종');
    
    // 3. 캐릭터 생성
    const characterRes = await fetch(`${BASE_URL}/api/characters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        animalId: 5, // 호랑이
        characterName: '번개발톱',
        battleText: '나는 숲의 제왕 호랑이! 날카로운 발톱과 강력한 이빨로 모든 적을 물리친다. 밤의 사냥꾼이자 정글의 수호자!'
      })
    });
    
    const characterData = await characterRes.json();
    if (characterData.success) {
      console.log('캐릭터 생성 성공:', characterData.data.character_name);
    } else {
      console.error('캐릭터 생성 실패:', characterData.error);
    }
    
    return { token, characterId: characterData.data?.id };
    
  } catch (error) {
    console.error('테스트 실패:', error);
    return null;
  }
}

// 테스트 계정 2
async function testUser2() {
  console.log('\n=== 테스트 계정 2: 게스트 로그인 ===');
  
  try {
    // 1. 게스트 로그인
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isGuest: true
      })
    });
    
    const loginData = await loginRes.json();
    console.log('게스트 로그인 성공:', loginData.data.user.display_name);
    const token = loginData.data.token;
    
    // 2. 캐릭터 생성
    const characterRes = await fetch(`${BASE_URL}/api/characters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        animalId: 6, // 판다
        characterName: '대나무먹보',
        battleText: '평화를 사랑하는 판다지만 화나면 무섭다! 대나무로 단련된 내 힘을 보여주겠어. 귀여운 외모에 속지 마!'
      })
    });
    
    const characterData = await characterRes.json();
    if (characterData.success) {
      console.log('캐릭터 생성 성공:', characterData.data.character_name);
    } else {
      console.error('캐릭터 생성 실패:', characterData.error);
    }
    
    return { token, characterId: characterData.data?.id };
    
  } catch (error) {
    console.error('테스트 실패:', error);
    return null;
  }
}

// 배틀 테스트
async function testBattle(user1, user2) {
  console.log('\n=== 배틀 테스트 ===');
  
  if (!user1 || !user2 || !user1.characterId || !user2.characterId) {
    console.error('캐릭터 생성이 완료되지 않았습니다.');
    return;
  }
  
  try {
    // User1이 User2를 공격
    const battleRes = await fetch(`${BASE_URL}/api/battles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1.token}`
      },
      body: JSON.stringify({
        attackerId: user1.characterId,
        defenderId: user2.characterId,
        battleType: 'active'
      })
    });
    
    const battleData = await battleRes.json();
    if (battleData.success) {
      console.log('배틀 결과:');
      console.log('- 승자:', battleData.data.winner_id === user1.characterId ? '번개발톱' : '대나무먹보');
      console.log('- AI 판정:', battleData.data.ai_judgment);
      console.log('- 점수 변화: 공격자', battleData.data.attacker_score_change, '/ 방어자', battleData.data.defender_score_change);
    } else {
      console.error('배틀 실패:', battleData.error);
    }
    
  } catch (error) {
    console.error('배틀 테스트 실패:', error);
  }
}

// 리더보드 확인
async function checkLeaderboard() {
  console.log('\n=== 리더보드 확인 ===');
  
  try {
    const res = await fetch(`${BASE_URL}/api/leaderboard`);
    const data = await res.json();
    
    if (data.success) {
      console.log('TOP 5 순위:');
      data.data.entries.slice(0, 5).forEach(entry => {
        console.log(`${entry.rank}위: ${entry.characterName} (${entry.animalKoreanName}) - ${entry.baseScore}점`);
      });
    }
  } catch (error) {
    console.error('리더보드 조회 실패:', error);
  }
}

// 테스트 실행
async function runTests() {
  console.log('🎮 Kid Text Battle 테스트 시작...\n');
  
  // 샘플 데이터 생성
  console.log('=== 샘플 데이터 생성 ===');
  try {
    const setupRes = await fetch(`${BASE_URL}/api/test/setup`, { method: 'POST' });
    const setupData = await setupRes.json();
    console.log(setupData.message || setupData.error);
  } catch (error) {
    console.log('샘플 데이터 생성 실패 (이미 존재할 수 있음)');
  }
  
  // 테스트 실행
  const user1 = await testUser1();
  const user2 = await testUser2();
  
  if (user1 && user2) {
    await testBattle(user1, user2);
  }
  
  await checkLeaderboard();
  
  console.log('\n✅ 테스트 완료!');
}

// 서버가 준비될 때까지 대기 후 테스트 실행
setTimeout(runTests, 2000);