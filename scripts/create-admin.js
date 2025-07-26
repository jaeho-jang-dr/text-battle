// 관리자 계정 생성 스크립트
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Supabase 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  try {
    console.log('🔧 관리자 계정 생성 중...');
    
    // 비밀번호 해시화
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    // 관리자 계정 생성
    const { data: adminUser, error } = await supabase
      .from('users')
      .insert([{
        username: 'admin',
        email: 'admin@kidtextbattle.com',
        password_hash: passwordHash,
        age: 30,
        avatar: '👑',
        role: 'admin',
        is_active: true,
        play_time_limit: 999, // 무제한
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // 중복 오류
        console.log('❌ 관리자 계정이 이미 존재합니다.');
        
        // 기존 계정을 관리자로 업데이트
        const { data: updated, error: updateError } = await supabase
          .from('users')
          .update({ 
            role: 'admin',
            password_hash: passwordHash 
          })
          .eq('username', 'admin')
          .select()
          .single();
          
        if (updateError) {
          console.error('업데이트 오류:', updateError);
        } else {
          console.log('✅ 기존 계정을 관리자로 업데이트했습니다!');
          console.log('👤 아이디: admin');
          console.log('🔐 비밀번호: admin123');
        }
      } else {
        console.error('오류:', error);
      }
      return;
    }

    console.log('✅ 관리자 계정이 성공적으로 생성되었습니다!');
    console.log('👤 아이디: admin');
    console.log('🔐 비밀번호: admin123');
    console.log('📧 이메일: admin@kidtextbattle.com');
    
    // 관리자에게 첫 동물 추가
    await supabase
      .from('user_animals')
      .insert([{
        user_id: adminUser.id,
        animal_id: 1, // 사자
        nickname: '관리자의 사자',
        level: 99,
        experience: 9999,
        battles_won: 0,
        battles_lost: 0
      }]);
      
    console.log('🦁 관리자 동물도 추가되었습니다!');
    
  } catch (error) {
    console.error('스크립트 실행 중 오류:', error);
  }
}

// 스크립트 실행
createAdminUser();