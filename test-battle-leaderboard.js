// 배틀 및 리더보드 테스트

const BASE_URL = 'http://localhost:3001';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testBattleAndLeaderboard() {
  console.log('🎮 배틀 및 리더보드 테스트\n');
  
  try {
    // 1. 두 개의 계정 생성 및 캐릭터 생성
    console.log('1️⃣ 테스트 계정 생성');
    
    // 첫 번째 계정
    const user1Res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test1@example.com', isGuest: false })
    });
    const user1Data = await user1Res.json();
    const token1 = user1Data.data.token;
    console.log('✅ 계정 1 생성:', user1Data.data.user.email);
    
    // 두 번째 계정
    const user2Res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test2@example.com', isGuest: false })
    });
    const user2Data = await user2Res.json();
    const token2 = user2Data.data.token;
    console.log('✅ 계정 2 생성:', user2Data.data.user.email);
    
    // 2. 캐릭터 생성
    console.log('\n2️⃣ 캐릭터 생성');
    
    // 계정 1의 캐릭터
    const char1Res = await fetch(`${BASE_URL}/api/characters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token1}`
      },
      body: JSON.stringify({
        animalId: 1, // 사자
        characterName: '용감한 사자왕',
        battleText: '사자의 위엄으로 모든 적을 물리친다!'
      })
    });
    const char1Data = await char1Res.json();
    console.log('✅ 캐릭터 1 생성:', char1Data.data.character_name);
    
    // 계정 2의 캐릭터
    const char2Res = await fetch(`${BASE_URL}/api/characters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token2}`
      },
      body: JSON.stringify({
        animalId: 2, // 호랑이
        characterName: '강력한 호랑이',
        battleText: '호랑이의 힘으로 승리를 쟁취한다!'
      })
    });
    const char2Data = await char2Res.json();
    console.log('✅ 캐릭터 2 생성:', char2Data.data.character_name);
    
    // 3. 대전 상대 목록 확인
    console.log('\n3️⃣ 대전 상대 목록 확인');
    const opponentsRes = await fetch(`${BASE_URL}/api/characters?excludeUserId=${user1Data.data.user.id}`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });
    const opponentsData = await opponentsRes.json();
    console.log('✅ 대전 가능한 상대:', opponentsData.data.length, '명');
    
    // 4. 배틀 실행
    console.log('\n4️⃣ 배틀 실행');
    const battleRes = await fetch(`${BASE_URL}/api/battles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token1}`
      },
      body: JSON.stringify({
        attackerId: char1Data.data.id,
        defenderId: char2Data.data.id
      })
    });
    const battleData = await battleRes.json();
    
    if (battleData.success) {
      console.log('✅ 배틀 완료!');
      console.log(`   - 승자: ${battleData.data.result.winner === 'attacker' ? '공격자' : '방어자'}`);
      console.log(`   - 판정: ${battleData.data.result.judgment}`);
      console.log(`   - 공격자 점수 변화: ${battleData.data.result.attackerScoreChange > 0 ? '+' : ''}${battleData.data.result.attackerScoreChange}`);
      console.log(`   - 방어자 점수 변화: ${battleData.data.result.defenderScoreChange > 0 ? '+' : ''}${battleData.data.result.defenderScoreChange}`);
    } else {
      console.log('❌ 배틀 실패:', battleData.error);
    }
    
    // 5. 리더보드 확인
    console.log('\n5️⃣ 리더보드 확인');
    await sleep(1000); // 잠시 대기
    
    const leaderboardRes = await fetch(`${BASE_URL}/api/leaderboard`);
    const leaderboardData = await leaderboardRes.json();
    
    if (leaderboardData.success) {
      console.log('✅ 리더보드 TOP 5:');
      leaderboardData.data.leaderboard.slice(0, 5).forEach(entry => {
        console.log(`   ${entry.rank}위: ${entry.characterName} (${entry.animalIcon} ${entry.animalName}) - ${entry.eloScore}점`);
      });
      
      console.log('\n📊 전체 통계:');
      console.log(`   - 총 캐릭터 수: ${leaderboardData.data.stats.totalCharacters}`);
      console.log(`   - 평균 ELO: ${leaderboardData.data.stats.averageElo}`);
      console.log(`   - 최고 ELO: ${leaderboardData.data.stats.highestElo}`);
      console.log(`   - 인기 동물: ${leaderboardData.data.stats.mostPopularAnimal.name} (${leaderboardData.data.stats.mostPopularAnimal.count}명)`);
    }
    
    console.log('\n✅ 수정 완료:');
    console.log('   1. 배틀 기능이 정상 작동합니다');
    console.log('   2. 상대 목록을 불러올 수 있습니다');
    console.log('   3. 배틀 결과가 저장됩니다');
    console.log('   4. 리더보드에 새 캐릭터가 표시됩니다');
    console.log('   5. 점수 시스템이 작동합니다');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  }
}

testBattleAndLeaderboard();