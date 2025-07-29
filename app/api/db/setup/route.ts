import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('데이터베이스 초기화 요청 (SQLite 사용 중)');
    
    return NextResponse.json({
      success: true,
      message: 'SQLite 데이터베이스는 자동으로 초기화됩니다.'
    });

  } catch (error) {
    console.error('데이터베이스 설정 오류:', error);
    return NextResponse.json({
      success: false,
      error: '데이터베이스 설정 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}