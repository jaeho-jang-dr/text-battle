// Supabase 마이그레이션 스크립트
// 이 스크립트를 실행하여 데이터베이스 스키마를 업데이트할 수 있습니다

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 환경변수에서 Supabase 연결 정보 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // 서비스 키 필요

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase URL과 Service Role Key가 필요합니다.')
  console.log('환경변수를 설정해주세요:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 데이터베이스 마이그레이션 시작...')
  
  try {
    // update-schema.sql 파일 읽기
    const sqlContent = fs.readFileSync(
      path.join(__dirname, 'database', 'update-schema.sql'),
      'utf8'
    )

    // SQL 문을 개별 명령으로 분리 (세미콜론 기준)
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0)

    console.log(`📝 ${sqlCommands.length}개의 SQL 명령을 실행합니다...`)

    // 각 명령 실행
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i] + ';'
      console.log(`\n실행 중 (${i + 1}/${sqlCommands.length}): ${command.substring(0, 50)}...`)
      
      const { error } = await supabase.rpc('exec_sql', { sql: command })
      
      if (error) {
        console.error(`❌ 오류 발생: ${error.message}`)
        console.log('💡 Supabase 대시보드에서 직접 SQL을 실행해보세요.')
        process.exit(1)
      }
    }

    console.log('\n✅ 마이그레이션 완료!')
    console.log('🎉 모든 스키마 업데이트가 성공적으로 적용되었습니다.')
    
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error)
    process.exit(1)
  }
}

// 스크립트 실행
console.log('🔧 Kid Text Battle 데이터베이스 마이그레이션')
console.log('================================')
runMigration()