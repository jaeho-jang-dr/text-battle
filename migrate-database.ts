import { supabase } from './lib/supabase';
import fs from 'fs';
import path from 'path';

async function executeSQLCommands() {
  console.log('🚀 데이터베이스 마이그레이션 시작...');
  
  try {
    // SQL 파일 읽기
    const sqlContent = fs.readFileSync(
      path.join(__dirname, 'database', 'update-schema.sql'),
      'utf8'
    );

    // SQL 명령들을 개별적으로 분리
    const sqlCommands = sqlContent
      .split(/;[\s]*\n/)
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    // 각 SQL 명령 실행
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      
      // 주석만 있는 라인 스킵
      if (command.trim().startsWith('--') || command.trim() === '') {
        continue;
      }

      console.log(`\n실행 중 (${i + 1}/${sqlCommands.length})...`);
      console.log(`명령: ${command.substring(0, 100)}...`);

      try {
        // Supabase로 SQL 실행
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: command + ';'
        }).single();

        if (error) {
          // RPC 함수가 없는 경우 직접 실행 시도
          console.log('⚠️ RPC 실행 실패, 대안 방법 시도 중...');
          
          // 여기서는 각 테이블/컬럼을 개별적으로 생성
          if (command.includes('ALTER TABLE')) {
            console.log('테이블 수정 명령은 Supabase 대시보드에서 직접 실행해야 합니다.');
            errorCount++;
          } else if (command.includes('CREATE TABLE')) {
            console.log('테이블 생성 명령은 Supabase 대시보드에서 직접 실행해야 합니다.');
            errorCount++;
          } else {
            console.log('이 명령은 Supabase 대시보드에서 직접 실행해야 합니다.');
            errorCount++;
          }
        } else {
          console.log('✅ 성공!');
          successCount++;
        }
      } catch (err) {
        console.error('❌ 오류:', err);
        errorCount++;
      }
    }

    console.log('\n=================================');
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);
    
    if (errorCount > 0) {
      console.log('\n⚠️ 일부 명령이 실패했습니다.');
      console.log('Supabase 대시보드에서 SQL Editor를 열고 update-schema.sql을 직접 실행해주세요.');
    }

  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
  }
}

// API를 통한 스키마 업데이트 시도
async function updateSchemaViaAPI() {
  console.log('\n📝 API를 통한 스키마 업데이트 시도...\n');

  const updates = [
    {
      name: '사용자 테이블 업데이트',
      check: async () => {
        const { data, error } = await supabase
          .from('users')
          .select('warnings_count')
          .limit(1);
        return !error;
      },
      message: 'users 테이블에 새 필드들이 이미 추가되어 있습니다.'
    },
    {
      name: '채팅 메시지 테이블 확인',
      check: async () => {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('id')
          .limit(1);
        return !error;
      },
      message: 'chat_messages 테이블이 이미 존재합니다.'
    },
    {
      name: '경고 테이블 확인',
      check: async () => {
        const { data, error } = await supabase
          .from('user_warnings')
          .select('id')
          .limit(1);
        return !error;
      },
      message: 'user_warnings 테이블이 이미 존재합니다.'
    },
    {
      name: '필터 테이블 확인',
      check: async () => {
        const { data, error } = await supabase
          .from('content_filters')
          .select('id')
          .limit(1);
        return !error;
      },
      message: 'content_filters 테이블이 이미 존재합니다.'
    }
  ];

  let allExist = true;
  
  for (const update of updates) {
    console.log(`🔍 ${update.name} 확인 중...`);
    const exists = await update.check();
    
    if (exists) {
      console.log(`✅ ${update.message}`);
    } else {
      console.log(`❌ ${update.name} - 수동 업데이트 필요`);
      allExist = false;
    }
  }

  if (!allExist) {
    console.log('\n⚠️ 일부 테이블/필드가 없습니다.');
    console.log('\n📋 다음 단계:');
    console.log('1. Supabase 대시보드 (https://app.supabase.com) 접속');
    console.log('2. SQL Editor 열기');
    console.log('3. database/update-schema.sql 파일 내용 복사하여 실행');
  } else {
    console.log('\n✅ 모든 스키마가 이미 업데이트되어 있습니다!');
  }
}

// 메인 실행
async function main() {
  console.log('🔧 Kid Text Battle 데이터베이스 마이그레이션');
  console.log('=========================================\n');
  
  // API를 통한 확인 먼저 시도
  await updateSchemaViaAPI();
}

main().catch(console.error);