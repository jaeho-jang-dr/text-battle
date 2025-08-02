'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Character } from '../types';

interface BattleOpponentsProps {
  currentCharacter: Character | null;
  onSelectOpponent: (opponent: any) => void;
  onRefresh?: () => void;
}

interface LeaderboardEntry {
  rank: number;
  id: string;
  characterName: string;
  animalName: string;
  animalIcon: string;
  animalCategory: string;
  playerName: string;
  isGuest: boolean;
  isBot?: boolean;
  baseScore: number;
  eloScore: number;
  wins: number;
  losses: number;
  totalBattles: number;
  winRate: number;
}

export default function BattleOpponents({ 
  currentCharacter, 
  onSelectOpponent,
  onRefresh 
}: BattleOpponentsProps) {
  const [opponents, setOpponents] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchOpponents();
  }, [selectedCategory]);

  const fetchOpponents = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      const response = await fetch(`/api/leaderboard?${params}`);
      const data = await response.json();
      
      if (data.success) {
        // 자신의 캐릭터를 제외한 상대만 표시
        const filteredOpponents = data.data.leaderboard.filter(
          (entry: LeaderboardEntry) => entry.id !== currentCharacter?.id
        );
        setOpponents(filteredOpponents.slice(0, 10)); // 상위 10명만 표시
      }
    } catch (error) {
      console.error('Failed to fetch opponents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreDifference = (opponent: LeaderboardEntry) => {
    if (!currentCharacter) return 0;
    return opponent.eloScore - currentCharacter.eloScore;
  };

  const getDifficultyColor = (diff: number) => {
    if (diff > 200) return 'text-red-600'; // 매우 어려움
    if (diff > 100) return 'text-orange-600'; // 어려움
    if (diff > -100) return 'text-yellow-600'; // 보통
    return 'text-green-600'; // 쉬움
  };

  const getDifficultyText = (diff: number) => {
    if (diff > 200) return '🔥 매우 강함';
    if (diff > 100) return '⚡ 강함';
    if (diff > -100) return '⚔️ 비슷함';
    return '🌱 약함';
  };

  if (!currentCharacter) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-xl p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-purple-800">
          ⚔️ 대기 중인 상대들
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500 bg-white"
          >
            <option value="all">🌍 전체</option>
            <option value="current">🦁 현존 동물</option>
            <option value="mythical">🦄 전설의 동물</option>
            <option value="prehistoric">🦕 고생대 동물</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              fetchOpponents();
              onRefresh?.();
            }}
            className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg transition-colors"
          >
            🔄
          </motion.button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-4xl inline-block"
          >
            ⚔️
          </motion.div>
          <p className="text-gray-600 mt-2">상대를 찾는 중...</p>
        </div>
      ) : opponents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">현재 대기 중인 상대가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {opponents.map((opponent, index) => {
              const scoreDiff = getScoreDifference(opponent);
              return (
                <motion.div
                  key={opponent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{opponent.animalIcon}</div>
                      <div>
                        <div className="font-bold text-lg">
                          {opponent.rank}위 {opponent.characterName}
                          {opponent.isBot && (
                            <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                              🤖 대기 계정
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {opponent.animalName} • ELO: {opponent.eloScore}
                        </div>
                        <div className="text-xs text-gray-500">
                          {opponent.wins}승 {opponent.losses}패 (승률 {opponent.winRate}%)
                          {opponent.isBot && (
                            <span className="ml-2 text-purple-600">
                              • 무제한 배틀 가능
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-bold ${getDifficultyColor(scoreDiff)}`}>
                        {getDifficultyText(scoreDiff)}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelectOpponent(opponent)}
                        className="mt-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-lg hover:shadow-xl transition-all"
                      >
                        ⚔️ 도전하기
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <div className="mt-6 text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.href = '/leaderboard'}
          className="text-purple-600 hover:text-purple-800 font-medium"
        >
          전체 순위 보기 →
        </motion.button>
      </div>
    </motion.div>
  );
}