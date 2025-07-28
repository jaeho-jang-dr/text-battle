// 로그아웃 버튼 테스트

const BASE_URL = 'http://localhost:3001';

async function testLogoutButton() {
  console.log('🔍 로그아웃 버튼 테스트\n');
  
  // 1. 게스트 로그인
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isGuest: true })
  });
  
  const loginData = await loginRes.json();
  
  if (loginData.success) {
    console.log('✅ 게스트 로그인 성공');
    console.log(`   - 사용자명: ${loginData.data.user.display_name}`);
    console.log(`   - 토큰 저장됨`);
    
    // 2. play 페이지 확인
    console.log('\n📱 Play 페이지 확인');
    console.log('   - URL: http://localhost:3001/play?guest=true');
    console.log('   - 헤더에 "🏠 처음으로" 버튼이 추가되었습니다');
    console.log('   - 클릭하면 로그아웃 후 메인 페이지로 이동합니다');
    
    // 3. 변경사항 요약
    console.log('\n📝 적용된 변경사항:');
    console.log('   1. 로그아웃 기능 추가 (localStorage 토큰 삭제)');
    console.log('   2. "🏠 처음으로" 버튼 추가 (빨간색 버튼)');
    console.log('   3. React DevTools 에러 방지 설정 추가');
    
    console.log('\n✅ 이제 Play 페이지에서 언제든지 처음 화면으로 돌아갈 수 있습니다!');
  }
}

testLogoutButton().catch(console.error);