import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { getUser, setUser, clearUser } from '@/lib/auth';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getUser();
    setUserState(currentUser);
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setUserState(userData);
    router.push('/dashboard');
  };

  const logout = () => {
    clearUser();
    setUserState(null);
    router.push('/');
  };

  const requireAuth = () => {
    if (!loading && !user) {
      router.push('/login');
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    requireAuth,
    isAuthenticated: !!user
  };
};