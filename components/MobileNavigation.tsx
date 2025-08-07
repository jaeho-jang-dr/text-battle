'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavItem {
  path: string;
  icon: string;
  label: string;
  color: string;
}

const navItems: NavItem[] = [
  { path: '/', icon: '🏠', label: '홈', color: 'bg-blue-500' },
  { path: '/play', icon: '⚔️', label: '배틀', color: 'bg-red-500' },
  { path: '/animals', icon: '🦁', label: '도감', color: 'bg-green-500' },
  { path: '/leaderboard', icon: '🏆', label: '랭킹', color: 'bg-yellow-500' },
  { path: '/create-character', icon: '✨', label: '캐릭터', color: 'bg-purple-500' }
];

export default function MobileNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNavClick = (path: string) => {
    router.push(path);
  };

  return (
    <nav 
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 transition-transform duration-300 z-50 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.path || 
            (item.path !== '/' && pathname.startsWith(item.path));
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 relative overflow-hidden ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              {/* 활성 상태 배경 효과 */}
              {isActive && (
                <div className={`absolute inset-0 ${item.color} opacity-10`} />
              )}
              
              {/* 아이콘 */}
              <span 
                className={`text-2xl transition-transform duration-200 ${
                  isActive ? 'scale-110' : ''
                }`}
              >
                {item.icon}
              </span>
              
              {/* 라벨 */}
              <span className={`text-xs font-medium ${
                isActive ? 'font-bold' : ''
              }`}>
                {item.label}
              </span>
              
              {/* 활성 상태 인디케이터 */}
              {isActive && (
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${item.color}`} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}