// SQLite 데이터베이스 테스트 스크립트

const BASE_URL = 'http://localhost:3001';

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// 테스트 결과 출력 함수
function log(message, type = 'info') {
  const colorMap = {
    success: colors.green,
    error: colors.red,
    warning: colors.yellow,
    info: colors.blue,
    data: colors.cyan
  };
  console.log(`${colorMap[type] || ''}${message}${colors.reset}`);
}

// 1. 동물 목록 조회 테스트
async function testAnimals() {
  log('\n=== 1. 동물 목록 조회 테스트 ===', 'info');
  
  try {
    const res = await fetch(`${BASE_URL}/api/animals`);
    const data = await res.json();
    
    if (data.success) {
      log(`✅ 동물 ${data.data.length}종 로드 성공`, 'success');
      log(`첫 번째 동물: ${data.data[0].korean_name} ${data.data[0].emoji}`, 'data');
      return true;
    } else {
      log(`❌ 동물 로드 실패: ${data.error}`, 'error');
      return false;
    }
  } catch (error) {
    log(`❌ 오류 발생: ${error.message}`, 'error');
    return false;
  }
}

// 2. 사용자 로그인 테스트
async function testLogin() {
  log('\n=== 2. 사용자 로그인 테스트 ===', 'info');
  
  try {
    // 게스트 로그인
    const guestRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isGuest: true })
    });
    
    const guestData = await guestRes.json();
    if (guestData.success) {
      log(`✅ 게스트 로그인 성공: ${guestData.data.user.display_name}`, 'success');
    }
    
    // 이메일 로그인
    const emailRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    
    const emailData = await emailRes.json();
    if (emailData.success) {
      log(`✅ 이메일 로그인 성공: ${emailData.data.user.email}`, 'success');
      return { success: true, token: emailData.data.token };
    }
    
    return { success: true, token: guestData.data.token };
  } catch (error) {
    log(`❌ 로그인 오류: ${error.message}`, 'error');
    return { success: false };
  }
}

// 3. 캐릭터 생성 테스트
async function testCharacterCreation(token) {
  log('\n=== 3. 캐릭터 생성 테스트 ===', 'info');
  
  try {
    const res = await fetch(`${BASE_URL}/api/characters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        animalId: 3, // 펭귄
        characterName: '얼음왕자',
        battleText: '남극에서 온 멋진 펭귄! 차가운 얼음처럼 냉정하지만 친구들에게는 따뜻해. 미끄러운 얼음 위를 춤추듯 헤엄쳐!'
      })
    });
    
    const data = await res.json();
    if (data.success) {
      log(`✅ 캐릭터 생성 성공: ${data.data.character_name}`, 'success');
      return { success: true, characterId: data.data.id };
    } else {
      log(`❌ 캐릭터 생성 실패: ${data.error}`, 'error');
      return { success: false };
    }
  } catch (error) {
    log(`❌ 캐릭터 생성 오류: ${error.message}`, 'error');
    return { success: false };
  }
}

// 4. 리더보드 조회 테스트
async function testLeaderboard() {
  log('\n=== 4. 리더보드 조회 테스트 ===', 'info');
  
  try {
    const res = await fetch(`${BASE_URL}/api/leaderboard`);
    const data = await res.json();
    
    if (data.success) {
      log(`✅ 리더보드 조회 성공`, 'success');
      log(`TOP 5 캐릭터:`, 'data');
      
      data.data.leaderboard.slice(0, 5).forEach(entry => {
        log(`  ${entry.rank}위: ${entry.characterName} (${entry.animalName}) - ${entry.baseScore}점`, 'data');
      });
      
      log(`\n통계:`, 'data');
      log(`  총 캐릭터 수: ${data.data.stats.totalCharacters}`, 'data');
      log(`  평균 ELO: ${data.data.stats.averageElo}`, 'data');
      log(`  인기 동물: ${data.data.stats.mostPopularAnimal.name} (${data.data.stats.mostPopularAnimal.count}개)`, 'data');
      
      return true;
    } else {
      log(`❌ 리더보드 조회 실패: ${data.error}`, 'error');
      return false;
    }
  } catch (error) {
    log(`❌ 리더보드 오류: ${error.message}`, 'error');
    return false;
  }
}

// 5. 필터 테스트
async function testContentFilter(token) {
  log('\n=== 5. 콘텐츠 필터 테스트 ===', 'info');
  
  try {
    // 부적절한 이름으로 캐릭터 생성 시도
    const res = await fetch(`${BASE_URL}/api/characters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        animalId: 1,
        characterName: '바보멍청이', // 필터에 걸릴 이름
        battleText: '착한 사자입니다.'
      })
    });
    
    const data = await res.json();
    if (!data.success && data.error) {
      log(`✅ 필터 작동 확인: "${data.error}"`, 'success');
      return true;
    } else {
      log(`❌ 필터가 작동하지 않았습니다`, 'error');
      return false;
    }
  } catch (error) {
    log(`❌ 필터 테스트 오류: ${error.message}`, 'error');
    return false;
  }
}

// 메인 테스트 함수
async function runAllTests() {
  log('🎮 Kid Text Battle SQLite 테스트 시작...', 'info');
  log('=' .repeat(50), 'info');
  
  let totalTests = 0;
  let passedTests = 0;
  
  // 테스트 1: 동물 목록
  totalTests++;
  if (await testAnimals()) passedTests++;
  
  // 테스트 2: 로그인
  totalTests++;
  const loginResult = await testLogin();
  if (loginResult.success) passedTests++;
  
  if (loginResult.token) {
    // 테스트 3: 캐릭터 생성
    totalTests++;
    const charResult = await testCharacterCreation(loginResult.token);
    if (charResult.success) passedTests++;
    
    // 테스트 4: 리더보드
    totalTests++;
    if (await testLeaderboard()) passedTests++;
    
    // 테스트 5: 콘텐츠 필터
    totalTests++;
    if (await testContentFilter(loginResult.token)) passedTests++;
  }
  
  // 결과 요약
  log('\n' + '=' .repeat(50), 'info');
  log('📊 테스트 결과 요약', 'info');
  log(`총 테스트: ${totalTests}개`, 'info');
  log(`성공: ${passedTests}개`, 'success');
  log(`실패: ${totalTests - passedTests}개`, 'error');
  log(`성공률: ${Math.round((passedTests / totalTests) * 100)}%`, 'info');
  
  if (passedTests === totalTests) {
    log('\n🎉 모든 테스트 통과! SQLite 데이터베이스가 정상 작동합니다.', 'success');
  } else {
    log('\n⚠️ 일부 테스트가 실패했습니다. 로그를 확인하세요.', 'warning');
  }
}

// 서버가 준비될 때까지 대기 후 실행
setTimeout(() => {
  runAllTests().catch(console.error);
}, 3000);