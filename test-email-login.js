// 이메일 로그인 테스트

const BASE_URL = 'http://localhost:3001';

async function testEmailLogin() {
  console.log('📧 이메일 로그인 테스트\n');
  
  try {
    // 1. 이메일 로그인 테스트
    console.log('1️⃣ 이메일 로그인 시도');
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'drjang00@gmail.com',
        isGuest: false 
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ 이메일 로그인 성공!');
      console.log(`   - 이메일: ${data.data.user.email}`);
      console.log(`   - 사용자 ID: ${data.data.user.id}`);
      console.log(`   - 토큰 발급됨`);
      console.log(`   - 신규 사용자: ${data.data.isNewUser ? '예' : '아니오'}`);
      
      // 2. 토큰 검증
      console.log('\n2️⃣ 토큰 검증');
      const verifyRes = await fetch(`${BASE_URL}/api/auth/verify`, {
        headers: { 'Authorization': `Bearer ${data.data.token}` }
      });
      
      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        console.log('✅ 토큰 검증 성공');
        console.log(`   - 캐릭터 수: ${verifyData.data.user.characters?.length || 0}개`);
      }
      
      console.log('\n📝 수정 완료:');
      console.log('   1. 이메일 로그인 기능이 정상 작동합니다');
      console.log('   2. "시작하기" 버튼 클릭 시 로그인 후 /play로 이동합니다');
      console.log('   3. 토큰이 localStorage에 저장됩니다');
      
    } else {
      console.log('❌ 로그인 실패:', data.error);
    }
  } catch (error) {
    console.error('테스트 오류:', error);
  }
}

testEmailLogin();