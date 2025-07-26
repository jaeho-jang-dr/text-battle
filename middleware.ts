import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 보호된 라우트 정의
const protectedRoutes = ['/dashboard', '/battle', '/profile', '/create-animal', '/achievements'];
const adminRoutes = ['/admin'];
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 세션 쿠키 확인 (실제 프로덕션에서는 JWT 토큰 사용 권장)
  const sessionCookie = request.cookies.get('kid-battle-session');
  const isAuthenticated = !!sessionCookie;
  
  // 사용자 역할 확인 (쿠키에서 읽기)
  let userRole = 'guest';
  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(sessionCookie.value);
      userRole = sessionData.role || 'player';
    } catch (e) {
      console.error('세션 파싱 오류:', e);
    }
  }

  // 보호된 페이지 접근 시 인증 확인
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // 로그인 페이지로 리다이렉트
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // 관리자 페이지 접근 권한 확인
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated || userRole !== 'admin') {
      // 홈으로 리다이렉트
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 이미 로그인한 사용자가 인증 페이지 접근 시
  if (authRoutes.includes(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // API 보안 헤더 추가
  const response = NextResponse.next();
  
  if (pathname.startsWith('/api/')) {
    // CORS 설정 (필요시 도메인 제한)
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 보안 헤더
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // API 요청에 대한 인증 확인
    if (!pathname.includes('/api/auth/') && !pathname.includes('/api/help')) {
      if (!isAuthenticated) {
        return new NextResponse(
          JSON.stringify({ 
            success: false, 
            error: '인증이 필요해요! 먼저 로그인해주세요 🔐' 
          }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }
  }

  // 플레이 시간 제한 확인 (아동 보호)
  if (isAuthenticated && protectedRoutes.some(route => pathname.startsWith(route))) {
    const playTimeCookie = request.cookies.get('play-time-start');
    if (playTimeCookie) {
      const startTime = new Date(playTimeCookie.value);
      const currentTime = new Date();
      const playMinutes = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000 / 60);
      
      // 기본 제한 시간: 60분
      const timeLimit = 60;
      
      if (playMinutes > timeLimit) {
        // 플레이 시간 초과 페이지로 리다이렉트
        return NextResponse.redirect(new URL('/time-limit', request.url));
      }
    } else {
      // 플레이 시작 시간 설정
      response.cookies.set('play-time-start', new Date().toISOString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24시간
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icon.svg (icon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|public).*)',
  ],
};