import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const animals = db.prepare(`
      SELECT * FROM animals
      ORDER BY category, korean_name
    `).all();

    return NextResponse.json({
      success: true,
      data: animals
    });
  } catch (error) {
    console.error('Animals fetch error:', error);
    return NextResponse.json({
      success: false,
      error: '동물 데이터를 불러오는 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}