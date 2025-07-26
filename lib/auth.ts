import { User } from '@/types';

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userData = localStorage.getItem('kid-battle-user');
  if (!userData) return null;
  
  try {
    return JSON.parse(userData) as User;
  } catch {
    return null;
  }
};

export const setUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('kid-battle-user', JSON.stringify(user));
};

export const clearUser = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('kid-battle-user');
};

export const isAuthenticated = (): boolean => {
  return getUser() !== null;
};