'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { animalCharacteristics, calculateTotalPower, getStatGrade } from '@/lib/animal-stats';

interface Animal {
  id: number;
  name: string;
  korean_name: string;
  category: string;
  description: string;
  abilities: string;
  emoji: string;
  image_url?: string;
  color?: string;
}

export default function AnimalsPage() {
  const router = useRouter();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchAnimals();
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      setIsAdmin(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setIsLoggedIn(true);
        setIsAdmin(data.data.isAdmin);
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Failed to verify user status:', error);
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  };

  const fetchAnimals = async () => {
    try {
      const response = await fetch('/api/animals');
      const data = await response.json();
      if (data.success) {
        setAnimals(data.data);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch animals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAnimals = animals.filter(animal => {
    const matchesCategory = selectedCategory === 'all' || animal.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      animal.korean_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'current': return '🌍 현존 동물';
      case 'mythical': return '✨ 전설의 동물';
      case 'prehistoric': return '🦖 고생대 동물';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'current': return 'from-green-400 to-blue-500';
      case 'mythical': return 'from-purple-400 to-pink-500';
      case 'prehistoric': return 'from-orange-400 to-red-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <main className="min-h-screen pb-20">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 shadow-lg sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🦁 동물 도감</h1>
            <p className="text-sm opacity-90">총 {animals.length}종의 동물 친구들</p>
          </div>
          <div className="text-2xl animate-bounce">📚</div>
        </div>
      </header>

      <div className="px-4 py-4">
        {/* 검색 바 */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="동물 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 pr-4 text-base border-2 border-gray-200 rounded-full focus:outline-none focus:border-green-500 bg-white"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">🔍</span>
          </div>
        </div>

        
        {/* 카테고리 필터 - 횡스크롤 */}
        <div className="flex gap-3 mb-4 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            전체보기
          </button>
          {['current', 'mythical', 'prehistoric'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? `bg-gradient-to-r ${getCategoryColor(category)} text-white shadow-md`
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {getCategoryName(category)}
            </button>
          ))}
        </div>

        {/* 동물 그리드 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-4xl animate-bounce">🦄</div>
            <p className="text-gray-600 mt-4">동물들을 불러오는 중...</p>
          </div>
        ) : filteredAnimals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-gray-600">검색 결과가 없어요...</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filteredAnimals.map((animal, index) => {
              const animalData = animalCharacteristics[animal.korean_name];
              const totalPower = animalData ? calculateTotalPower(animalData.baseStats) : 0;
              const grade = animalData ? getStatGrade(totalPower) : { grade: '?', color: 'text-gray-400' };
              
              return (
                <motion.div
                  key={animal.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(index * 0.02, 0.5) }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedAnimal(animal)}
                  className="mobile-card p-3 cursor-pointer relative overflow-hidden"
                >
                  {/* 등급 배지 */}
                  {animalData && (
                    <div className={`absolute top-1 right-1 font-bold text-xs ${grade.color}`}>
                      {grade.grade}
                    </div>
                  )}
                  
                  {/* 동물 이모지 */}
                  <div className="text-4xl text-center mb-1">{animal.emoji}</div>
                  
                  {/* 동물 이름 */}
                  <h3 className="font-bold text-center text-xs text-gray-800 mb-1">{animal.korean_name}</h3>
                  
                  {/* 전투력 */}
                  {animalData && (
                    <div className="text-center">
                      <span className="text-xs text-gray-500">💪</span>
                      <span className="text-xs font-medium text-gray-700"> {totalPower}</span>
                    </div>
                  )}
                  
                  {/* 카테고리 표시 */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${getCategoryColor(animal.category)}`} />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 동물 상세 모달 */}
      <AnimatePresence>
        {selectedAnimal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAnimal(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* 모달 헤더 */}
              <div className={`bg-gradient-to-r ${getCategoryColor(selectedAnimal.category)} p-6 text-white relative`}>
                <button
                  onClick={() => setSelectedAnimal(null)}
                  className="absolute top-3 right-3 text-2xl bg-white/20 w-8 h-8 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
                <div className="text-6xl text-center mb-2">{selectedAnimal.emoji}</div>
                <h2 className="text-2xl font-bold text-center">{selectedAnimal.korean_name}</h2>
                <p className="text-sm text-center mt-1 opacity-90">{selectedAnimal.name}</p>
              </div>

              {/* 모달 내용 */}
              <div className="p-6">
                {/* 캐릭터 스탯 */}
                {(() => {
                  const animalData = animalCharacteristics[selectedAnimal.korean_name];
                  if (animalData) {
                    const totalPower = calculateTotalPower(animalData.baseStats);
                    const grade = getStatGrade(totalPower);
                    
                    return (
                      <div className="mb-6">
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                          <span>📊</span> 기본 능력치
                        </h3>
                        
                        {/* 전투력 및 등급 */}
                        <div className="bg-gray-100 rounded-lg p-3 mb-3 flex items-center justify-between">
                          <div>
                            <span className="text-sm text-gray-600">총 전투력</span>
                            <div className="text-2xl font-bold">{totalPower}</div>
                          </div>
                          <div className={`text-3xl font-bold ${grade.color}`}>
                            {grade.grade}
                          </div>
                        </div>
                        
                        {/* 각 스탯 */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-16 text-sm">💚 체력</span>
                            <div className="flex-1 stat-bar">
                              <div className="stat-bar-fill" style={{ width: `${animalData.baseStats.hp}%` }} />
                            </div>
                            <span className="w-10 text-right font-medium">{animalData.baseStats.hp}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="w-16 text-sm">⚔️ 공격</span>
                            <div className="flex-1 stat-bar">
                              <div className="stat-bar-fill bg-gradient-to-r from-red-400 to-red-600" style={{ width: `${animalData.baseStats.power}%` }} />
                            </div>
                            <span className="w-10 text-right font-medium">{animalData.baseStats.power}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="w-16 text-sm">🛡️ 방어</span>
                            <div className="flex-1 stat-bar">
                              <div className="stat-bar-fill bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${animalData.baseStats.defense}%` }} />
                            </div>
                            <span className="w-10 text-right font-medium">{animalData.baseStats.defense}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="w-16 text-sm">💨 속도</span>
                            <div className="flex-1 stat-bar">
                              <div className="stat-bar-fill bg-gradient-to-r from-yellow-400 to-yellow-600" style={{ width: `${animalData.baseStats.speed}%` }} />
                            </div>
                            <span className="w-10 text-right font-medium">{animalData.baseStats.speed}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="w-16 text-sm">✨ 특수</span>
                            <div className="flex-1 stat-bar">
                              <div className="stat-bar-fill bg-gradient-to-r from-purple-400 to-purple-600" style={{ width: `${animalData.baseStats.special}%` }} />
                            </div>
                            <span className="w-10 text-right font-medium">{animalData.baseStats.special}</span>
                          </div>
                        </div>
                        
                        {/* 특수 능력 */}
                        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                          <h4 className="font-bold text-sm text-purple-700 mb-1">🌟 {animalData.ability}</h4>
                          <p className="text-xs text-gray-600">{animalData.description}</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <span>📖</span> 설명
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedAnimal.description}</p>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <span>⚡</span> 특수 능력
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedAnimal.abilities}</p>
                </div>

                {/* 액션 버튼 */}
                <div className="mt-6">
                  {isLoggedIn ? (
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          router.push(`/create-character?animal=${selectedAnimal.id}`);
                        }}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                      >
                        🎮 캐릭터 만들기
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            router.push(`/create-animal?animal=${selectedAnimal.id}`);
                          }}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                        >
                          🦄 나만의 동물 만들기 (관리자)
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center mb-4">
                      <p className="text-gray-600 mb-4">캐릭터를 만들려면 로그인이 필요해요!</p>
                      <button
                        onClick={() => router.push('/')}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                      >
                        🏠 로그인하러 가기
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedAnimal(null)}
                    className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}