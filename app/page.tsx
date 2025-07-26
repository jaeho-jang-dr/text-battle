"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import HelpButton from '@/components/HelpButton';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 확인
    const savedUser = localStorage.getItem('kid-battle-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('사용자 정보 파싱 오류:', e);
      }
    }
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* 도움말 버튼 */}
      <HelpButton page="home" />

      {/* 타이틀 */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="text-center mb-12"
      >
        <h1 className="text-title mb-4">동물 친구들 배틀! 🦁</h1>
        <p className="text-xl text-gray-700">귀여운 동물 친구들과 함께 모험을 떠나요!</p>
      </motion.div>

      {/* 메인 메뉴 */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.href = '/kid-login'}
          className="card-animal text-center cursor-pointer"
        >
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold text-kid-blue mb-2">게임 시작</h2>
          <p className="text-gray-600">캐릭터로 쉽게 로그인해요!</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.href = '/animals'}
          className="card-animal text-center cursor-pointer"
        >
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-2xl font-bold text-kid-orange mb-2">동물 도감</h2>
          <p className="text-gray-600">어떤 동물 친구들이 있는지 구경해요!</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.href = '/leaderboard'}
          className="card-animal text-center cursor-pointer"
        >
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-kid-green mb-2">랭킹</h2>
          <p className="text-gray-600">누가 가장 강한지 확인해요!</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.href = '/tutorial'}
          className="card-animal text-center cursor-pointer"
        >
          <div className="text-6xl mb-4">🎓</div>
          <h2 className="text-2xl font-bold text-kid-pink mb-2">게임 방법</h2>
          <p className="text-gray-600">게임하는 방법을 배워봐요!</p>
        </motion.div>
      </motion.div>

      {/* 관리자 링크 (로그인한 관리자 또는 개발 모드에서 표시) */}
      {(user?.role === 'admin' || process.env.NODE_ENV === 'development') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Link href="/admin">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-600 text-white px-6 py-2 rounded-full shadow-lg font-bold flex items-center gap-2 hover:bg-gray-700 transition"
            >
              <span className="text-xl">👑</span>
              관리자 페이지
            </motion.button>
          </Link>
        </motion.div>
      )}

      {/* 개발 모드 관리자 로그인 버튼 */}
      {process.env.NODE_ENV === 'development' && !user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4"
        >
          <button
            onClick={async () => {
              // 개발용 관리자 계정으로 자동 로그인
              const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  username: 'admin',
                  password: 'admin123', // 개발용 비밀번호
                }),
              });
              
              if (response.ok) {
                const data = await response.json();
                const adminUser = data.data.user;
                localStorage.setItem('kid-battle-user', JSON.stringify(adminUser));
                document.cookie = `kid-battle-session=${JSON.stringify({
                  userId: adminUser.id,
                  role: adminUser.role
                })}; path=/; max-age=86400`;
                window.location.href = '/admin';
              } else {
                alert('관리자 계정이 없습니다. 먼저 관리자 계정을 생성해주세요.');
              }
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg text-sm hover:bg-purple-700 transition"
          >
            🔧 개발용 관리자 로그인
          </button>
        </motion.div>
      )}

      {/* 움직이는 동물들 장식 */}
      <div className="fixed bottom-10 left-0 right-0 flex justify-around p-4 pointer-events-none z-0">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="text-4xl"
        >
          🦁
        </motion.div>
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
          className="text-4xl"
        >
          🦄
        </motion.div>
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 3, delay: 1 }}
          className="text-4xl"
        >
          🦖
        </motion.div>
      </div>

      {/* 저작권 정보 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-2 left-0 right-0 text-center pointer-events-none z-0"
      >
        <p className="text-xs text-gray-500">
          Developer Rights Holder: MokSu Grand Father
        </p>
      </motion.div>
    </main>
  );
}