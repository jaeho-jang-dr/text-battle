import { NextResponse } from 'next/server';

// 테스트용 엔드포인트 - SQLite에서는 별도 샘플 데이터 생성 불필요
export async function POST() {
  try {
    console.log('테스트 샘플 데이터 요청 (SQLite 사용 중)');
    
    return NextResponse.json({
      success: true,
      message: 'SQLite 데이터베이스는 초기화 시 샘플 데이터를 자동으로 생성합니다.',
      data: {
        users: 'auto-generated',
        characters: 'auto-generated', 
        battles: 'auto-generated'
      }
    });
  } catch (error) {
    console.error('Sample data creation error:', error);
    return NextResponse.json({
      success: false,
      error: '샘플 데이터 생성 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}