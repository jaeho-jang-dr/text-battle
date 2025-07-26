"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { User, UserAnimal } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userAnimals, setUserAnimals] = useState<UserAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const userData = localStorage.getItem('kid-battle-user');
      if (!userData) {
        router.push('/login');
        return;
      }

      const currentUser = JSON.parse(userData) as User;
      setUser(currentUser);

      // 사용자의 동물들 가져오기
      const { data: animals, error } = await supabase
        .from('user_animals')
        .select(`
          *,
          animals (*)
        `)
        .eq('user_id', currentUser.id);

      if (!error && animals) {
        setUserAnimals(animals);
      }

      setLoading(false);
    };

    loadUserData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('kid-battle-user');
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <span className="text-6xl">🌟</span>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-5xl">{user?.avatar || '🦁'}</span>
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{user?.username}님의 대시보드</h1>
            <p className="text-gray-600">레벨 1 모험가</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="bg-kid-yellow p-3 rounded-full shadow-lg hover:scale-110 transition"
          >
            <span className="text-2xl">❓</span>
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-300 text-gray-700 px-6 py-3 rounded-full font-bold hover:bg-gray-400 transition"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 도움말 풍선 */}
      {showHelp && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="help-bubble top-24 right-4 max-w-xs"
        >
          <p className="text-gray-800">
            🦉 여기서 동물 친구들을 관리하고<br/>
            배틀을 시작할 수 있어요!
          </p>
        </motion.div>
      )}

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="card-animal text-center"
        >
          <span className="text-4xl mb-2 block">🏆</span>
          <h3 className="text-xl font-bold text-gray-800">승리</h3>
          <p className="text-3xl font-bold text-kid-green">0</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="card-animal text-center"
        >
          <span className="text-4xl mb-2 block">💔</span>
          <h3 className="text-xl font-bold text-gray-800">패배</h3>
          <p className="text-3xl font-bold text-kid-orange">0</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="card-animal text-center"
        >
          <span className="text-4xl mb-2 block">🎯</span>
          <h3 className="text-xl font-bold text-gray-800">승률</h3>
          <p className="text-3xl font-bold text-kid-blue">0%</p>
        </motion.div>
      </div>

      {/* 내 동물 친구들 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">내 동물 친구들 🦁</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userAnimals.map((userAnimal: any, index) => (
            <motion.div
              key={userAnimal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="card-animal"
            >
              <div className="text-center mb-4">
                <span className="text-6xl">{userAnimal.animals.emoji}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {userAnimal.nickname || userAnimal.animals.korean_name}
              </h3>
              <p className="text-gray-600 mb-2">{userAnimal.animals.description}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>레벨 {userAnimal.level}</span>
                <span>경험치 {userAnimal.experience}</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-red-100 rounded p-2">
                  <span className="text-xs text-gray-600">공격력</span>
                  <p className="font-bold text-red-600">{userAnimal.animals.power}</p>
                </div>
                <div className="bg-blue-100 rounded p-2">
                  <span className="text-xs text-gray-600">방어력</span>
                  <p className="font-bold text-blue-600">{userAnimal.animals.defense}</p>
                </div>
                <div className="bg-green-100 rounded p-2">
                  <span className="text-xs text-gray-600">속도</span>
                  <p className="font-bold text-green-600">{userAnimal.animals.speed}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/battle">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
          >
            배틀 시작! ⚔️
          </motion.button>
        </Link>
        <Link href="/animals">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary"
          >
            동물 도감 📖
          </motion.button>
        </Link>
        <Link href="/leaderboard">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary"
          >
            랭킹 보기 🏆
          </motion.button>
        </Link>
      </div>
    </main>
  );
}