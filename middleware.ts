import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 보호된 라우트 목록
  const protectedRoutes = ['/dashboard', '/battle', '/profile'];
  const authRoutes = ['/login', '/signup'];
  
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  // 클라이언트 사이드에서만 localStorage 접근 가능하므로
  // 여기서는 쿠키를 사용하거나 클라이언트 사이드 리다이렉트를 사용해야 함
  // 현재는 클라이언트 사이드에서 처리하도록 함
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/battle/:path*', '/profile/:path*']
};