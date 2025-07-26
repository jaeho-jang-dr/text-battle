"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { animalsData } from '@/data/animals-extended';
import HelpButton from '@/components/HelpButton';

export default function AnimalsPage() {
  const [selectedCategory, setSelectedCategory] = useState<'current' | 'mythical' | 'prehistoric' | 'custom'>('current');
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
  const [customAnimals, setCustomAnimals] = useState<any[]>([]);

  const categories = [
    { value: 'current' as const, label: '현존 동물', emoji: '🦁' },
    { value: 'mythical' as const, label: '신화/상상의 동물', emoji: '🦄' },
    { value: 'prehistoric' as const, label: '선사시대 동물', emoji: '🦖' },
    { value: 'custom' as const, label: '커스텀 동물', emoji: '🎨' }
  ];

  const filteredAnimals = animalsData.filter(animal => animal.category === selectedCategory);
  const selectedAnimalData = animalsData.find(a => a.name === selectedAnimal) || customAnimals.find(a => a.name === selectedAnimal);

  return (
    <main className="min-h-screen p-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <button className="bg-kid-blue text-white p-3 rounded-full shadow-lg hover:scale-110 transition">
            <span className="text-2xl">←</span>
          </button>
          <h1 className="text-title">동물 도감 📖</h1>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/create-animal">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-kid-purple text-white px-4 py-2 rounded-full shadow-lg font-bold flex items-center gap-2"
            >
              <span className="text-xl">🎨</span>
              나만의 동물 만들기
            </motion.button>
          </Link>
          <HelpButton page="animals" />
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-4 mb-8 flex-wrap justify-center">
        {categories.map((cat) => (
          <motion.button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-3 rounded-full font-bold transition ${
              selectedCategory === cat.value
                ? 'bg-kid-blue text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="mr-2">{cat.emoji}</span>
            {cat.label}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 동물 목록 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {categories.find(c => c.value === selectedCategory)?.label}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredAnimals.map((animal, index) => (
              <motion.div
                key={animal.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedAnimal(animal.name)}
                className={`card-animal cursor-pointer ${
                  selectedAnimal === animal.name ? 'ring-4 ring-kid-blue' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{animal.emoji}</span>
                  <div>
                    <h3 className="font-bold text-lg">{animal.korean_name}</h3>
                    <p className="text-sm text-gray-600">{animal.name}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-2">{animal.kid_description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 선택된 동물 상세 정보 */}
        <div>
          {selectedAnimalData ? (
            <motion.div
              key={selectedAnimalData.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-animal sticky top-4"
            >
              {/* 동물 이미지와 이름 */}
              <div className="text-center mb-6">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span className="text-8xl">{selectedAnimalData.emoji}</span>
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-800 mt-4">
                  {selectedAnimalData.korean_name}
                </h2>
                <p className="text-xl text-gray-600">{selectedAnimalData.name}</p>
                <p className="text-sm text-kid-orange font-bold mt-2">
                  {selectedAnimalData.rarity === 'legendary' ? '🌟 전설급' : 
                   selectedAnimalData.rarity === 'epic' ? '💎 에픽' :
                   selectedAnimalData.rarity === 'rare' ? '✨ 레어' : '⭐ 일반'}
                </p>
              </div>

              {/* 배틀 크라이 */}
              <div className="bg-kid-yellow rounded-lg p-4 mb-6 text-center">
                <p className="text-lg font-bold text-gray-800">
                  "{selectedAnimalData.battle_cry}"
                </p>
              </div>

              {/* 상세 정보 */}
              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-700 mb-1">🏠 서식지</h4>
                  <p className="text-gray-600">{selectedAnimalData.habitat}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-700 mb-1">🍖 먹이</h4>
                  <p className="text-gray-600">{selectedAnimalData.food}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-700 mb-1">⭐ 특기</h4>
                  <p className="text-gray-600">{selectedAnimalData.speciality}</p>
                </div>
                <div className="bg-pink-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-700 mb-1">💡 재미있는 사실</h4>
                  <p className="text-gray-600">{selectedAnimalData.fun_fact}</p>
                </div>
              </div>

              {/* 능력치 */}
              <div>
                <h4 className="font-bold text-gray-700 mb-3">전투 능력치</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-red-600">💪 힘</span>
                      <span className="text-sm font-bold">{selectedAnimalData.power}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedAnimalData.power}%` }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-red-500 h-3 rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-blue-600">🛡️ 방어</span>
                      <span className="text-sm font-bold">{selectedAnimalData.defense}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedAnimalData.defense}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-blue-500 h-3 rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-green-600">⚡ 속도</span>
                      <span className="text-sm font-bold">{selectedAnimalData.speed}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedAnimalData.speed}%` }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-green-500 h-3 rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-purple-600">🧠 지능</span>
                      <span className="text-sm font-bold">{selectedAnimalData.intelligence}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedAnimalData.intelligence}%` }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-purple-500 h-3 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="card-animal text-center py-16">
              <span className="text-6xl mb-4 block">📖</span>
              <p className="text-xl text-gray-600">
                동물을 선택하면 자세한 정보를 볼 수 있어요!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}