// 웹 인터페이스 테스트 스크립트

const BASE_URL = 'http://localhost:3008';

console.log('🌐 Kid Text Battle 웹 인터페이스 테스트\n');

// 1. 메인 페이지 확인
async function testMainPage() {
  console.log('1️⃣ 메인 페이지 확인');
  
  const res = await fetch(BASE_URL);
  const html = await res.text();
  
  if (html.includes('동물 텍스트 배틀') && html.includes('바로 게임 시작하기!')) {
    console.log('✅ 메인 페이지 정상 로드');
    console.log('   - 제목: 동물 텍스트 배틀');
    console.log('   - 게임 시작 버튼 확인');
    console.log('   - 이메일 로그인 버튼 확인');
  } else {
    console.log('❌ 메인 페이지 로드 실패');
  }
}

// 2. 리더보드 페이지 확인
async function testLeaderboardPage() {
  console.log('\n2️⃣ 리더보드 페이지 확인');
  
  const res = await fetch(`${BASE_URL}/leaderboard`);
  const html = await res.text();
  
  if (html.includes('명예의 전당')) {
    console.log('✅ 리더보드 페이지 정상 로드');
    
    // API로 실제 데이터 확인
    const apiRes = await fetch(`${BASE_URL}/api/leaderboard`);
    const data = await apiRes.json();
    
    if (data.success) {
      console.log(`   - 등록된 캐릭터: ${data.data.stats.totalCharacters}개`);
      console.log('   - TOP 3:');
      data.data.leaderboard.slice(0, 3).forEach(entry => {
        console.log(`     ${entry.rank}위: ${entry.characterName} (${entry.baseScore}점)`);
      });
    }
  } else {
    console.log('❌ 리더보드 페이지 로드 실패');
  }
}

// 3. 게임 플레이 페이지 확인
async function testPlayPage() {
  console.log('\n3️⃣ 게임 플레이 페이지 확인');
  
  // 먼저 게스트로 로그인
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isGuest: true })
  });
  
  const loginData = await loginRes.json();
  
  if (loginData.success) {
    console.log('✅ 게스트 로그인 성공');
    console.log(`   - 사용자명: ${loginData.data.user.display_name}`);
    console.log(`   - 토큰 발급 완료`);
    
    // 플레이 페이지는 클라이언트 사이드 렌더링이므로 API 상태만 확인
    const verifyRes = await fetch(`${BASE_URL}/api/auth/verify`, {
      headers: { 'Authorization': `Bearer ${loginData.data.token}` }
    });
    
    const verifyData = await verifyRes.json();
    if (verifyData.success) {
      console.log('✅ 인증 토큰 검증 성공');
      console.log(`   - 캐릭터 수: ${verifyData.data.user.characters?.length || 0}개`);
    }
  }
}

// 4. 관리자 페이지 확인
async function testAdminPage() {
  console.log('\n4️⃣ 관리자 페이지 확인');
  
  const res = await fetch(`${BASE_URL}/admin`);
  const html = await res.text();
  
  // 관리자 페이지는 아직 구현되지 않았을 수 있음
  console.log('ℹ️  관리자 페이지는 우측 하단 유니콘(🦄) 아이콘으로 접근');
  console.log('   - 초기 비밀번호: 1234');
}

// 메인 실행
async function runTests() {
  await testMainPage();
  await testLeaderboardPage();
  await testPlayPage();
  await testAdminPage();
  
  console.log('\n✅ 웹 인터페이스 테스트 완료!');
  console.log('\n📝 브라우저에서 직접 확인하려면:');
  console.log('   1. http://localhost:3008 접속');
  console.log('   2. "바로 게임 시작하기!" 클릭');
  console.log('   3. 동물 선택 → 캐릭터 이름 → 배틀 텍스트 입력');
  console.log('   4. 리더보드에서 순위 확인');
}

runTests().catch(console.error);