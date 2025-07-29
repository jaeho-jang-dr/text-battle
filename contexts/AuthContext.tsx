'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  guestLogin: () => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // 공개 경로 (로그인 없이 접근 가능)
  const publicPaths = ['/', '/animals', '/leaderboard', '/text-guide'];
  const authRequiredPaths = ['/play', '/create-character'];

  useEffect(() => {
    // Mark as client-side and then run authentication check
    setIsClient(true);
    checkAuth();
  }, []);

  // 경로 변경 시 인증 체크 (클라이언트에서만 실행)
  useEffect(() => {
    if (!isLoading && isClient) {
      const isPublicPath = publicPaths.includes(pathname);
      const requiresAuth = authRequiredPaths.some(path => pathname.startsWith(path));

      if (requiresAuth && !isAuthenticated) {
        // 인증이 필요한 페이지인데 로그인하지 않은 경우
        router.push('/');
      } else if (pathname === '/' && isAuthenticated) {
        // 이미 로그인한 사용자가 첫 화면에 접근한 경우
        router.push('/play');
      }
    }
  }, [pathname, isAuthenticated, isLoading, isClient]);

  const checkAuth = async () => {
    try {
      // 게스트는 sessionStorage, 이메일 사용자는 localStorage에서 토큰 확인
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success && data.data.user) {
        setUser(data.data.user);
        setIsAuthenticated(true);
      } else {
        // 토큰이 유효하지 않으면 제거
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
    router.push('/play');
  };

  const guestLogin = async (): Promise<boolean> => {
    try {
      // 랜덤 ID 생성 (서버/클라이언트 일관성을 위해 Math.random 사용)
      const randomId = Math.random().toString(36).substr(2, 9);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: `guest_${randomId}@temp.com`, 
          isGuest: true 
        })
      });

      const data = await response.json();
      if (data.success) {
        // 게스트는 sessionStorage에 토큰 저장 (브라우저 닫으면 삭제됨)
        sessionStorage.setItem('token', data.data.token);
        setUser(data.data.user);
        setIsAuthenticated(true);
        router.push('/play');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Guest login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      guestLogin,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}