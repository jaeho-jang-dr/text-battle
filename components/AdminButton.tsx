'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminButton() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 관리자 토큰 확인
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      setIsAdmin(true);
    }
  }, []);

  const handleClick = () => {
    router.push('/admin');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ opacity: 0.9 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.5 
        }}
        className="fixed bottom-4 right-4 z-50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClick}
          className={`relative w-10 h-10 rounded-full shadow-sm transition-all duration-300 ${
            isAdmin 
              ? 'bg-gradient-to-br from-purple-400/50 to-pink-400/50' 
              : 'bg-gradient-to-br from-purple-300/50 to-pink-300/50'
          } hover:shadow-lg backdrop-blur-sm`}
        >
          <motion.span
            animate={{ rotate: isHovered ? 360 : 0 }}
            transition={{ duration: 0.5 }}
            className="text-xl absolute inset-0 flex items-center justify-center opacity-70"
          >
            🦄
          </motion.span>
          
          {/* 호버 시 텍스트 표시 */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
              >
                <div className="bg-purple-800/90 text-white px-2 py-1 rounded-md shadow-md text-xs">
                  <span className="font-medium">
                    {isAdmin ? '관리자' : '로그인'}
                  </span>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                    <div className="border-4 border-transparent border-l-purple-800/90"></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* 반짝이는 효과 - 호버 시에만 표시 */}
        {isHovered && (
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-300/30 to-pink-300/30 pointer-events-none"
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}