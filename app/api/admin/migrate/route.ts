import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

// 개별 테이블 생성 함수들
async function createUserWarningsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS user_warnings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      warning_type VARCHAR(50) NOT NULL,
      warning_message TEXT NOT NULL,
      content TEXT NOT NULL,
      issued_at TIMESTAMPTZ DEFAULT NOW(),
      issued_by UUID REFERENCES users(id)
    );
  `;
  
  const { error } = await supabase.rpc('exec_sql', { sql: query });
  return { name: 'user_warnings', error };
}

async function createChatMessagesTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS chat_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      username VARCHAR(50) NOT NULL,
      message TEXT NOT NULL CHECK (char_length(message) <= 200),
      is_filtered BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  
  const { error } = await supabase.rpc('exec_sql', { sql: query });
  return { name: 'chat_messages', error };
}

async function createContentFiltersTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS content_filters (
      id SERIAL PRIMARY KEY,
      filter_type VARCHAR(50) NOT NULL,
      word_pattern VARCHAR(255) NOT NULL,
      severity INTEGER DEFAULT 1 CHECK (severity >= 1 AND severity <= 3),
      replacement VARCHAR(50) DEFAULT '***',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  
  const { error } = await supabase.rpc('exec_sql', { sql: query });
  return { name: 'content_filters', error };
}

export async function GET(request: NextRequest) {
  // 관리자 권한 확인
  const cookie = request.headers.get('cookie');
  if (!cookie?.includes('kid-battle-session')) {
    return NextResponse.json(
      { error: '관리자 권한이 필요합니다.' },
      { status: 401 }
    );
  }

  console.log('🚀 데이터베이스 마이그레이션 시작...');
  
  const results = {
    success: [],
    failed: [],
    checks: []
  };

  // 1. 테이블 존재 여부 확인
  const tablesToCheck = ['user_warnings', 'chat_messages', 'content_filters'];
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (!error) {
        results.checks.push(`✅ ${table} 테이블이 이미 존재합니다.`);
      } else {
        results.checks.push(`❌ ${table} 테이블이 없습니다. 생성이 필요합니다.`);
      }
    } catch (err) {
      results.checks.push(`❌ ${table} 테이블 확인 실패`);
    }
  }

  // 2. users 테이블 필드 확인
  try {
    const { data, error } = await supabase
      .from('users')
      .select('warnings_count, account_suspended, auto_login_token')
      .limit(1);
    
    if (!error) {
      results.checks.push('✅ users 테이블의 새 필드들이 이미 추가되어 있습니다.');
    } else {
      results.checks.push('❌ users 테이블에 새 필드 추가가 필요합니다.');
    }
  } catch (err) {
    results.checks.push('❌ users 테이블 필드 확인 실패');
  }

  // 3. 기본 필터 데이터 삽입 시도
  try {
    const filters = [
      { filter_type: 'profanity', word_pattern: '(바보|멍청이|똥|찌질이)', severity: 1, replacement: '***' },
      { filter_type: 'profanity', word_pattern: '(시발|씨발|개새끼|미친|죽어)', severity: 2, replacement: '***' },
      { filter_type: 'ten_commandments', word_pattern: '(하나님|하느님|예수|그리스도).*?(욕|나쁜|싫|증오)', severity: 2, replacement: '***' },
      { filter_type: 'ten_commandments', word_pattern: '(부모|엄마|아빠).*?(싫|미워|나빠|죽)', severity: 2, replacement: '***' },
      { filter_type: 'inappropriate', word_pattern: '(담배|술|마약|도박)', severity: 2, replacement: '***' }
    ];

    const { error } = await supabase
      .from('content_filters')
      .insert(filters);
    
    if (!error) {
      results.success.push('✅ 기본 필터 데이터 추가 완료');
    }
  } catch (err) {
    // 이미 존재할 수 있으므로 오류 무시
  }

  return NextResponse.json({
    message: '마이그레이션 상태 확인 완료',
    results,
    nextSteps: [
      '1. Supabase 대시보드 (https://app.supabase.com) 접속',
      '2. SQL Editor 열기',
      '3. database/update-schema.sql 파일 내용 복사',
      '4. SQL Editor에 붙여넣고 실행',
      '5. 성공 메시지 확인'
    ]
  });
}