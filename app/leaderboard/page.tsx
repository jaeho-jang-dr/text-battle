"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { LeaderboardEntry } from '@/types';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(25);

      if (!error && data) {
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 border-yellow-400';
      case 2: return 'bg-gray-100 border-gray-400';
      case 3: return 'bg-orange-100 border-orange-400';
      default: return 'bg-white';
    }
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
        <Link href="/dashboard" className="flex items-center gap-2">
          <button className="bg-kid-blue text-white p-3 rounded-full shadow-lg hover:scale-110 transition">
            <span className="text-2xl">←</span>
          </button>
          <h1 className="text-title">랭킹 🏆</h1>
        </Link>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className="bg-kid-yellow p-3 rounded-full shadow-lg hover:scale-110 transition"
        >
          <span className="text-2xl">❓</span>
        </button>
      </div>

      {/* 도움말 풍선 */}
      {showHelp && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="help-bubble top-24 right-4 max-w-xs"
        >
          <p className="text-gray-800">
            🦉 여기서 최고의 플레이어들을 볼 수 있어요!<br/>
            열심히 연습해서 1등이 되어보세요!
          </p>
        </motion.div>
      )}

      {/* 상위 3명 포디움 */}
      <div className="flex justify-center gap-4 mb-12">
        {leaderboard.slice(0, 3).map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`card-animal text-center ${
              index === 0 ? 'order-2 transform scale-110' : index === 1 ? 'order-1' : 'order-3'
            }`}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
            >
              <span className="text-6xl block mb-2">{getRankEmoji(index + 1)}</span>
            </motion.div>
            <div className="text-5xl mb-2">{entry.avatar || '🦁'}</div>
            <h3 className="text-xl font-bold text-gray-800">{entry.username}</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-600">승리: {entry.wins}</p>
              <p className="text-sm text-gray-600">승률: {entry.winRate}%</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 전체 랭킹 테이블 */}
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card-animal overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-kid-blue text-white">
                <tr>
                  <th className="py-3 px-4 text-left">순위</th>
                  <th className="py-3 px-4 text-left">플레이어</th>
                  <th className="py-3 px-4 text-center">승리</th>
                  <th className="py-3 px-4 text-center">패배</th>
                  <th className="py-3 px-4 text-center">총 배틀</th>
                  <th className="py-3 px-4 text-center">승률</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-b hover:bg-gray-50 transition ${getRankColor(index + 1)}`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getRankEmoji(index + 1)}</span>
                        <span className="font-bold">{index + 1}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{entry.avatar || '🦁'}</span>
                        <span className="font-bold">{entry.username}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-green-600 font-bold">{entry.wins}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-red-600 font-bold">{entry.losses}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold">{entry.totalBattles}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${entry.winRate}%` }}
                            transition={{ duration: 1, delay: index * 0.05 }}
                            className={`h-3 rounded-full ${
                              entry.winRate >= 70 ? 'bg-green-500' :
                              entry.winRate >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                          />
                        </div>
                        <span className="font-bold text-sm">{entry.winRate}%</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 빈 랭킹 메시지 */}
        {leaderboard.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <span className="text-6xl block mb-4">🏆</span>
            <p className="text-xl text-gray-600">
              아직 랭킹이 없어요!<br/>
              첫 번째 챔피언이 되어보세요!
            </p>
          </motion.div>
        )}
      </div>

      {/* 동기부여 메시지 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-12"
      >
        <div className="card-animal inline-block p-6">
          <p className="text-lg text-gray-700">
            💪 열심히 연습하면 누구나 1등이 될 수 있어요!
          </p>
        </div>
      </motion.div>
    </main>
  );
}