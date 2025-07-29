'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BattleStats {
  character_name: string;
  emoji: string;
  owner_name: string;
  total_battles: number;
  wins: number;
  losses: number;
  win_rate: number;
  avg_score_change: number;
  most_faced_opponent: string;
  most_faced_count: number;
}

export default function BattlesTab() {
  const [battleStats, setBattleStats] = useState<BattleStats[]>([]);
  const [dateRange, setDateRange] = useState('week'); // today, week, month, all
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBattleStats();
  }, [dateRange]);

  const fetchBattleStats = async () => {
    setIsLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/battles/stats?range=${dateRange}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await response.json();
      if (data.success) {
        setBattleStats(data.data.battleStats);
      }
    } catch (error) {
      console.error('Failed to fetch battle stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* 필터 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-3xl shadow-xl p-6 mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">⚔️ 배틀 통계</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setDateRange('today')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
              dateRange === 'today' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            오늘
          </button>
          <button
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
              dateRange === 'week' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            이번 주
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
              dateRange === 'month' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            이번 달
          </button>
          <button
            onClick={() => setDateRange('all')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
              dateRange === 'all' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            전체
          </button>
        </div>
      </motion.div>

      {/* 배틀 통계 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl shadow-xl p-8"
      >
        <h3 className="text-xl font-bold mb-6">상위 100명 배틀 통계</h3>
        {isLoading ? (
          <div className="text-center py-8">로딩중...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-100 to-pink-100">
                <tr>
                  <th className="px-4 py-3 text-left">순위</th>
                  <th className="px-4 py-3 text-left">캐릭터</th>
                  <th className="px-4 py-3 text-left">소유자</th>
                  <th className="px-4 py-3 text-center">총 배틀</th>
                  <th className="px-4 py-3 text-center">승</th>
                  <th className="px-4 py-3 text-center">패</th>
                  <th className="px-4 py-3 text-center">승률</th>
                  <th className="px-4 py-3 text-center">평균 점수 변화</th>
                  <th className="px-4 py-3 text-left">최다 대전 상대</th>
                </tr>
              </thead>
              <tbody>
                {battleStats.map((stat, index) => (
                  <motion.tr
                    key={`${stat.character_name}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b hover:bg-purple-50"
                  >
                    <td className="px-4 py-3">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{stat.emoji}</span>
                        <span className="font-bold">{stat.character_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{stat.owner_name}</td>
                    <td className="px-4 py-3 text-center font-bold">{stat.total_battles}</td>
                    <td className="px-4 py-3 text-center text-green-600 font-bold">{stat.wins}</td>
                    <td className="px-4 py-3 text-center text-red-600 font-bold">{stat.losses}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${
                        stat.win_rate >= 60 ? 'text-green-600' :
                        stat.win_rate >= 40 ? 'text-gray-700' : 'text-red-600'
                      }`}>
                        {stat.win_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={stat.avg_score_change > 0 ? 'text-green-600' : 'text-red-600'}>
                        {stat.avg_score_change > 0 ? '+' : ''}{stat.avg_score_change.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {stat.most_faced_opponent} ({stat.most_faced_count}회)
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* 배틀 통계 차트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          <h3 className="text-xl font-bold mb-6">🏆 승률 분포</h3>
          <div className="space-y-4">
            {['60% 이상', '50-60%', '40-50%', '40% 미만'].map((range, index) => {
              const count = battleStats.filter(stat => {
                if (index === 0) return stat.win_rate >= 60;
                if (index === 1) return stat.win_rate >= 50 && stat.win_rate < 60;
                if (index === 2) return stat.win_rate >= 40 && stat.win_rate < 50;
                return stat.win_rate < 40;
              }).length;
              
              return (
                <div key={range} className="flex items-center gap-4">
                  <div className="w-24 text-right">{range}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / battleStats.length) * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`h-full rounded-full ${
                        index === 0 ? 'bg-green-500' :
                        index === 1 ? 'bg-blue-500' :
                        index === 2 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-bold">
                      {count}명
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          <h3 className="text-xl font-bold mb-6">📊 배틀 활동량</h3>
          <div className="space-y-4">
            {['100+ 배틀', '50-100 배틀', '20-50 배틀', '20 미만'].map((range, index) => {
              const count = battleStats.filter(stat => {
                if (index === 0) return stat.total_battles >= 100;
                if (index === 1) return stat.total_battles >= 50 && stat.total_battles < 100;
                if (index === 2) return stat.total_battles >= 20 && stat.total_battles < 50;
                return stat.total_battles < 20;
              }).length;
              
              return (
                <div key={range} className="flex items-center gap-4">
                  <div className="w-28 text-right">{range}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / battleStats.length) * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="h-full rounded-full bg-purple-500"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-bold">
                      {count}명
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}