import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');
    
    let query = 'SELECT * FROM animals';
    const params: any[] = [];
    
    if (category && category !== 'all') {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY category, korean_name';
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }
    
    const animals = (params.length > 0 
      ? db.prepare(query).all(...params)
      : db.prepare(query).all()) as Array<{
        id: number;
        name: string;
        korean_name: string;
        category: string;
        description: string;
        abilities: string;
        emoji: string;
      }>;

    // Add statistics
    const stats = {
      total: animals.length,
      byCategory: {
        current: animals.filter(a => a.category === 'current').length,
        mythical: animals.filter(a => a.category === 'mythical').length,
        prehistoric: animals.filter(a => a.category === 'prehistoric').length
      }
    };

    return NextResponse.json({
      success: true,
      data: animals,
      stats
    });
  } catch (error) {
    console.error('Animals fetch error:', error);
    return NextResponse.json({
      success: false,
      error: '동물 데이터를 불러오는 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}