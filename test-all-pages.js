// 모든 페이지 연결 테스트 스크립트

const BASE_URL = 'http://localhost:3008';

async function testPage(path, name) {
  console.log(`\n🔍 Testing ${name} (${path})...`);
  
  try {
    const response = await fetch(`${BASE_URL}${path}`);
    const status = response.status;
    const html = await response.text();
    
    console.log(`   Status: ${status}`);
    console.log(`   HTML Length: ${html.length} bytes`);
    
    // HTML에서 제목이나 주요 내용 확인
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    
    if (titleMatch) {
      console.log(`   Title: ${titleMatch[1]}`);
    }
    if (h1Match) {
      console.log(`   H1: ${h1Match[1]}`);
    }
    
    if (status === 200 && html.length > 1000) {
      console.log(`   ✅ Page loads successfully`);
      return true;
    } else {
      console.log(`   ❌ Page load failed`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testAPI(path, name, options = {}) {
  console.log(`\n🔍 Testing API ${name} (${path})...`);
  
  try {
    const response = await fetch(`${BASE_URL}${path}`, options);
    const status = response.status;
    let data;
    
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }
    
    console.log(`   Status: ${status}`);
    console.log(`   Response: ${typeof data === 'object' ? JSON.stringify(data).slice(0, 100) + '...' : data.slice(0, 100)}`);
    
    if (status === 200 || status === 201) {
      console.log(`   ✅ API responds successfully`);
      return true;
    } else {
      console.log(`   ❌ API failed with status ${status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Kid Text Battle - 전체 페이지 연결 테스트\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('='.repeat(50));
  
  const results = {
    pages: [],
    apis: []
  };
  
  // 페이지 테스트
  console.log('\n📄 페이지 테스트:');
  results.pages.push(await testPage('/', '홈페이지'));
  results.pages.push(await testPage('/play', 'Play 페이지'));
  results.pages.push(await testPage('/leaderboard', '리더보드'));
  results.pages.push(await testPage('/admin', '관리자 페이지'));
  results.pages.push(await testPage('/create-animal', '동물 생성'));
  results.pages.push(await testPage('/debug', '디버그 페이지'));
  
  // API 테스트
  console.log('\n🔌 API 엔드포인트 테스트:');
  results.apis.push(await testAPI('/api/leaderboard', '리더보드 API'));
  results.apis.push(await testAPI('/api/animals', '동물 목록 API'));
  results.apis.push(await testAPI('/api/auth/verify', '인증 확인 API'));
  results.apis.push(await testAPI('/api/stats', '통계 API'));
  
  // 로그인 테스트
  console.log('\n🔐 로그인 테스트:');
  const loginResponse = await testAPI('/api/auth/login', '게스트 로그인', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isGuest: true })
  });
  
  // 결과 요약
  console.log('\n' + '='.repeat(50));
  console.log('📊 테스트 결과 요약:\n');
  
  const pageSuccess = results.pages.filter(r => r).length;
  const apiSuccess = results.apis.filter(r => r).length;
  
  console.log(`페이지: ${pageSuccess}/${results.pages.length} 성공`);
  console.log(`API: ${apiSuccess}/${results.apis.length} 성공`);
  
  if (pageSuccess === results.pages.length && apiSuccess === results.apis.length) {
    console.log('\n✅ 모든 테스트 통과!');
  } else {
    console.log('\n⚠️ 일부 테스트 실패 - 위의 로그를 확인하세요.');
  }
  
  // 특별 체크
  console.log('\n🔍 추가 체크:');
  
  // 리더보드 데이터 확인
  try {
    const leaderboardRes = await fetch(`${BASE_URL}/api/leaderboard`);
    const leaderboardData = await leaderboardRes.json();
    if (leaderboardData.success) {
      console.log(`✅ 리더보드 데이터: ${leaderboardData.data.leaderboard.length}개 항목`);
    }
  } catch (e) {
    console.log('❌ 리더보드 데이터 확인 실패');
  }
  
  // 관리자 로그인 API 확인
  try {
    const adminLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test', password: 'test' })
    });
    const adminData = await adminLoginRes.json();
    console.log(`✅ 관리자 로그인 API: ${adminLoginRes.status === 401 ? '정상 (잘못된 자격증명 거부)' : '확인 필요'}`);
  } catch (e) {
    console.log('❌ 관리자 로그인 API 확인 실패');
  }
  
  console.log('\n✅ 테스트 완료!');
}

// 실행
runAllTests().catch(console.error);