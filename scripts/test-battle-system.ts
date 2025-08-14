// 배틀 시스템 테스트 스크립트

const API_BASE_URL = 'http://localhost:3009/api';

// 테스트 계정 정보
const testAccounts = [
  {
    email: "testuser1@example.com",
    password: "TestPassword123!"
  },
  {
    email: "testuser2@example.com", 
    password: "TestPassword123!"
  }
];

interface AuthData {
  token: string;
  user: any;
  character: any;
}

// 로그인 함수
async function login(email: string, password: string): Promise<AuthData> {
  console.log(`\n🔐 로그인 시도: ${email}`);
  
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`로그인 실패: ${error.error || response.statusText}`);
  }

  const data = await response.json();
  console.log(`✅ 로그인 성공: ${data.user.name}`);
  
  // 캐릭터 정보 가져오기
  const charResponse = await fetch(`${API_BASE_URL}/characters/my`, {
    headers: {
      'Authorization': `Bearer ${data.token}`,
    }
  });

  if (charResponse.ok) {
    data.character = await charResponse.json();
    console.log(`   캐릭터: ${data.character.name} (Lv.${data.character.level})`);
    console.log(`   레이팅: ${data.character.rating}`);
  }

  return data;
}

// 캐릭터 정보 가져오기
async function getCharacterInfo(characterId: string): Promise<any> {
  // NPC인 경우 간단한 정보 반환
  if (characterId.startsWith('npc_')) {
    return {
      id: characterId,
      name: `NPC #${characterId.split('_')[1]}`,
      isNPC: true
    };
  }
  
  // 실제 캐릭터 정보 조회 API가 있다면 여기서 호출
  return {
    id: characterId,
    name: 'Unknown',
    isNPC: false
  };
}

// 배틀 생성 함수
async function createBattle(authData: AuthData, opponentId?: string) {
  console.log(`\n⚔️ 배틀 생성 시도...`);
  
  // 상대가 지정되지 않으면 랜덤 NPC 선택
  let defenderId = opponentId;
  if (!defenderId) {
    // 랜덤 NPC 선택 (npc_1 ~ npc_20)
    const npcId = Math.floor(Math.random() * 20) + 1;
    defenderId = `npc_${npcId}`;
    console.log(`   랜덤 NPC 선택: ${defenderId}`);
  }
  
  const requestBody = {
    attackerId: authData.character.id,
    defenderId: defenderId
  };

  const response = await fetch(`${API_BASE_URL}/battles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authData.token}`,
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`배틀 생성 실패: ${error.error || response.statusText}`);
  }

  const result = await response.json();
  const battle = result.data || result; // API가 {data: ...} 형식이거나 직접 반환하는 경우 처리
  
  console.log(`✅ 배틀 생성 성공!`);
  console.log(`   배틀 ID: ${battle.id}`);
  
  // 캐릭터 정보 가져오기
  const attacker = battle.attackerId === authData.character.id ? authData.character : 
                   await getCharacterInfo(battle.attackerId);
  const defender = battle.defenderId === authData.character.id ? authData.character :
                   await getCharacterInfo(battle.defenderId);
  
  console.log(`   ${attacker.name} vs ${defender.name}`);
  
  return battle;
}

// 배틀 결과 표시
async function displayBattleResult(battle: any, authData: AuthData) {
  console.log("\n" + "═".repeat(50));
  console.log("📊 배틀 결과");
  console.log("═".repeat(50));
  
  // 승자와 패자 결정
  const isAttackerWinner = battle.winnerId === battle.attackerId;
  const winnerId = battle.winnerId;
  const loserId = isAttackerWinner ? battle.defenderId : battle.attackerId;
  
  // 캐릭터 정보 가져오기
  const winner = winnerId === authData.character.id ? authData.character : 
                 await getCharacterInfo(winnerId);
  const loser = loserId === authData.character.id ? authData.character :
                await getCharacterInfo(loserId);
  
  console.log(`\n🏆 승자: ${winner.name}!`);
  console.log(`💀 패자: ${loser.name}`);
  
  console.log(`\n⚔️ 전투 점수:`);
  console.log(`   ${isAttackerWinner ? winner.name : loser.name}: ${battle.attackerScore}`);
  console.log(`   ${isAttackerWinner ? loser.name : winner.name}: ${battle.defenderScore}`);
  
  console.log(`\n📈 레이팅 변화:`);
  const winnerEloChange = isAttackerWinner ? battle.attackerEloChange : battle.defenderEloChange;
  const loserEloChange = isAttackerWinner ? battle.defenderEloChange : battle.attackerEloChange;
  console.log(`   ${winner.name}: ${winnerEloChange > 0 ? '+' : ''}${winnerEloChange}`);
  console.log(`   ${loser.name}: ${loserEloChange > 0 ? '+' : ''}${loserEloChange}`);
  
  if (battle.battleLog && Array.isArray(battle.battleLog)) {
    console.log(`\n💬 배틀 내용:`);
    battle.battleLog.slice(0, 3).forEach((log: string) => {
      console.log(`   ${log}`);
    });
    if (battle.battleLog.length > 3) {
      console.log(`   ...`);
    }
  }
  
  console.log("\n" + "═".repeat(50));
}

// 메인 테스트 함수
async function testBattleSystem() {
  console.log("🎮 배틀 시스템 테스트 시작!");
  console.log("─".repeat(50));

  try {
    // 1. 두 계정 로그인
    const auth1 = await login(testAccounts[0].email, testAccounts[0].password);
    const auth2 = await login(testAccounts[1].email, testAccounts[1].password);

    // 2. 테스트 1: 랜덤 NPC와 배틀
    console.log("\n\n🎯 테스트 1: 랜덤 NPC와 배틀");
    console.log("─".repeat(30));
    
    const npcBattle = await createBattle(auth1);
    await displayBattleResult(npcBattle, auth1);

    // 3. 테스트 2: 유저 간 배틀
    console.log("\n\n🎯 테스트 2: 유저 간 배틀");
    console.log("─".repeat(30));
    
    if (auth2.character) {
      const pvpBattle = await createBattle(auth1, auth2.character.id);
      await displayBattleResult(pvpBattle, auth1);
    }

    // 4. 배틀 통계 확인
    console.log("\n\n📊 배틀 통계 확인");
    console.log("─".repeat(30));
    
    const statsResponse = await fetch(`${API_BASE_URL}/battles/stats`, {
      headers: {
        'Authorization': `Bearer ${auth1.token}`,
      }
    });

    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log("\n📈 " + auth1.user.name + "의 통계:");
      console.log(`   총 배틀: ${stats.totalBattles}`);
      console.log(`   승리: ${stats.wins}`);
      console.log(`   패배: ${stats.losses}`);
      console.log(`   승률: ${stats.winRate}%`);
      console.log(`   레이팅: ${stats.rating}`);
      console.log(`   오늘 배틀: ${stats.dailyBattlesCount}/20`);
    }

    // 5. 리더보드 확인
    console.log("\n\n🏆 리더보드 TOP 5");
    console.log("─".repeat(30));
    
    const leaderboardResponse = await fetch(`${API_BASE_URL}/leaderboard`);
    if (leaderboardResponse.ok) {
      const leaderboard = await leaderboardResponse.json();
      leaderboard.slice(0, 5).forEach((entry: any, index: number) => {
        console.log(`   ${index + 1}. ${entry.name} - 레이팅: ${entry.rating} (${entry.wins}승 ${entry.losses}패)`);
      });
    }

    console.log("\n\n✅ 모든 테스트 완료!");
    console.log("🎉 배틀 시스템이 정상적으로 작동합니다!");

  } catch (error) {
    console.error("\n❌ 테스트 중 오류 발생:", error);
  }
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

// 메인 실행
async function main() {
  try {
    await waitForServer();
    await testBattleSystem();
  } catch (error) {
    console.error("❌ 스크립트 실행 중 오류:", error);
    process.exit(1);
  }
}

main();