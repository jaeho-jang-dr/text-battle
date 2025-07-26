"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* 도움말 버튼 */}
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="absolute top-4 right-4 bg-kid-yellow p-3 rounded-full shadow-lg hover:scale-110 transition"
      >
        <span className="text-2xl">❓</span>
      </button>

      {/* 도움말 풍선 */}
      {showHelp && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="help-bubble top-20 right-4 max-w-xs"
        >
          <p className="text-gray-800">
            🦉 안녕! 나는 도우미 부엉이야!<br/>
            동물 친구들과 재미있는 배틀을 시작해보자!
          </p>
        </motion.div>
      )}

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
        <Link href="/login">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="card-animal text-center"
          >
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-kid-blue mb-2">게임 시작</h2>
            <p className="text-gray-600">로그인하고 배틀을 시작해요!</p>
          </motion.div>
        </Link>

        <Link href="/animals">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="card-animal text-center"
          >
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-2xl font-bold text-kid-orange mb-2">동물 도감</h2>
            <p className="text-gray-600">어떤 동물 친구들이 있는지 구경해요!</p>
          </motion.div>
        </Link>

        <Link href="/leaderboard">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="card-animal text-center"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-kid-green mb-2">랭킹</h2>
            <p className="text-gray-600">누가 가장 강한지 확인해요!</p>
          </motion.div>
        </Link>

        <Link href="/tutorial">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="card-animal text-center"
          >
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold text-kid-pink mb-2">게임 방법</h2>
            <p className="text-gray-600">게임하는 방법을 배워봐요!</p>
          </motion.div>
        </Link>
      </motion.div>

      {/* 움직이는 동물들 장식 */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-around p-4 pointer-events-none">
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
    </main>
  );
}