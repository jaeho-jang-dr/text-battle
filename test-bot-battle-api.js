const fetch = require('node-fetch');

async function testBotBattle() {
  console.log('🤖 봇 배틀 API 테스트 시작...\n');

  try {
    // 1. 게스트 로그인
    console.log('1️⃣ 게스트 로그인 중...');
    const loginResponse = await fetch('http://localhost:3008/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isGuest: true })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error('로그인 실패: ' + loginData.error);
    }
    
    const token = loginData.data.token;
    console.log('✅ 로그인 성공!');
    console.log('   토큰:', token.substring(0, 20) + '...');

    // 2. 캐릭터 목록 확인
    console.log('\n2️⃣ 캐릭터 목록 확인...');
    const charsResponse = await fetch('http://localhost:3008/api/characters', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const charsData = await charsResponse.json();
    if (!charsData.success || charsData.data.length === 0) {
      throw new Error('캐릭터가 없습니다');
    }
    
    const myCharacter = charsData.data[0];
    console.log('✅ 내 캐릭터:', myCharacter.characterName);
    console.log('   오늘 배틀:', myCharacter.activeBattlesToday + '/10');

    // 3. 리더보드에서 봇 찾기
    console.log('\n3️⃣ 봇 상대 찾기...');
    const leaderResponse = await fetch('http://localhost:3008/api/leaderboard');
    const leaderData = await leaderResponse.json();
    
    const botOpponent = leaderData.data.leaderboard.find(entry => entry.isBot);
    if (!botOpponent) {
      throw new Error('봇 상대를 찾을 수 없습니다');
    }
    
    console.log('✅ 봇 상대 발견:', botOpponent.characterName);
    console.log('   봇 여부:', botOpponent.isBot);
    console.log('   ELO:', botOpponent.eloScore);

    // 4. 배틀 시도
    console.log('\n4️⃣ 봇과 배틀 시도...');
    const battleResponse = await fetch('http://localhost:3008/api/battles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        attackerId: myCharacter.id,
        defenderId: botOpponent.id
      })
    });
    
    const battleData = await battleResponse.json();
    console.log('\n🎲 배틀 응답:', battleResponse.status);
    console.log('📦 응답 데이터:', JSON.stringify(battleData, null, 2));
    
    if (battleData.success) {
      console.log('\n✅ 배틀 성공!');
      console.log('   승자:', battleData.data.result.winner);
      console.log('   판정:', battleData.data.result.judgment);
    } else {
      console.log('\n❌ 배틀 실패:', battleData.error);
    }

  } catch (error) {
    console.error('\n❌ 테스트 중 오류:', error.message);
    console.error(error.stack);
  }
}

// node-fetch가 없으면 설치 필요: npm install node-fetch@2
testBotBattle();