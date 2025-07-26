"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('kid-battle-user');
    if (!user) {
      router.push('/login');
    }
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="text-center max-w-2xl"
      >
        {/* 환영 메시지 */}
        <motion.h1
          className="text-6xl font-bold text-kid-blue mb-8"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          환영합니다! 🎉
        </motion.h1>

        {/* 축하 애니메이션 */}
        <div className="mb-8">
          <motion.div
            animate={{ y: [0, -30, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block"
          >
            <span className="text-8xl">🦁</span>
          </motion.div>
        </div>

        {/* 설명 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-animal p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            첫 동물 친구를 선물로 드렸어요!
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            사자와 함께 멋진 모험을 시작해보세요!<br/>
            배틀에서 이기면 더 많은 동물 친구들을 만날 수 있어요.
          </p>
          <div className="bg-kid-yellow rounded-lg p-4">
            <p className="text-gray-800">
              💡 <strong>팁:</strong> 먼저 튜토리얼을 보고 게임 방법을 배워보세요!
            </p>
          </div>
        </motion.div>

        {/* 버튼들 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="space-y-4"
        >
          <Link href="/tutorial">
            <button className="btn-primary">
              튜토리얼 보기 🎓
            </button>
          </Link>
          <br/>
          <Link href="/dashboard">
            <button className="btn-secondary">
              바로 시작하기 🎮
            </button>
          </Link>
        </motion.div>
      </motion.div>

      {/* 꽃가루 효과 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -50,
              rotate: 0
            }}
            animate={{ 
              y: window.innerHeight + 50,
              rotate: 360,
              x: Math.random() * window.innerWidth
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          >
            {['✨', '🌟', '⭐', '🎊'][Math.floor(Math.random() * 4)]}
          </motion.div>
        ))}
      </div>
    </main>
  );
}