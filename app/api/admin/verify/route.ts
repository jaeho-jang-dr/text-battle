import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: '인증 토큰이 필요합니다'
      }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify user token first
    const user = db.prepare(`
      SELECT id, email, created_at 
      FROM users 
      WHERE token = ?
    `).get(token) as { id: number; email: string; created_at: string } | undefined;
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 토큰입니다'
      }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = db.prepare(`
      SELECT au.id, au.username, au.role 
      FROM admin_users au
      WHERE au.username = ?
    `).get(user.email);
    
    return NextResponse.json({
      success: true,
      data: {
        isAdmin: !!adminUser,
        user: {
          id: user.id,
          email: user.email
        },
        admin: adminUser || null
      }
    });
    
  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json({
      success: false,
      error: '관리자 확인 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}