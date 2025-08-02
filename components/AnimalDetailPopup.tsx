'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Animal } from '../types';

interface AnimalDetailPopupProps {
  animal: Animal | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect?: () => void;
}

export default function AnimalDetailPopup({ animal, isOpen, onClose, onSelect }: AnimalDetailPopupProps) {
  if (!animal) return null;

  // 카테고리별 색상
  const categoryColors = {
    current: 'from-green-400 to-blue-500',
    mythical: 'from-purple-400 to-pink-500',
    prehistoric: 'from-orange-400 to-red-500',
    legend: 'from-yellow-400 to-orange-500'
  };

  // 카테고리 한글명
  const categoryNames = {
    current: '현존 동물',
    mythical: '전설의 동물',
    prehistoric: '고생대 동물',
    legend: '전설 동물'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* 헤더 - 그라데이션 배경 */}
            <div className={`bg-gradient-to-r ${categoryColors[animal.category]} p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="text-6xl bg-white/20 rounded-2xl p-3"
                  >
                    {animal.emoji}
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold">{animal.koreanName}</h2>
                    <p className="text-white/80">{animal.name}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 내용 */}
            <div className="p-6 space-y-4">
              {/* 카테고리 배지 */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                  ${animal.category === 'current' ? 'bg-green-100 text-green-800' :
                    animal.category === 'mythical' ? 'bg-purple-100 text-purple-800' :
                    'bg-orange-100 text-orange-800'}`}
                >
                  {categoryNames[animal.category]}
                </span>
              </div>

              {/* 설명 */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-gray-700 mb-1">설명</h3>
                  <p className="text-gray-600">{animal.description}</p>
                </div>

                {animal.abilities && (
                  <div>
                    <h3 className="font-bold text-gray-700 mb-1">특별한 능력</h3>
                    <p className="text-gray-600">{animal.abilities}</p>
                  </div>
                )}

                {/* 추가 정보 (있다면) */}
                {(animal as any).detailedInfo && (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <h3 className="font-bold text-gray-700">상세 정보</h3>
                    {(animal as any).detailedInfo.habitat && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">서식지:</span> {(animal as any).detailedInfo.habitat}
                      </p>
                    )}
                    {(animal as any).detailedInfo.food && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">먹이:</span> {(animal as any).detailedInfo.food}
                      </p>
                    )}
                    {(animal as any).detailedInfo.speciality && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">특기:</span> {(animal as any).detailedInfo.speciality}
                      </p>
                    )}
                    {(animal as any).detailedInfo.funFact && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">재미있는 사실:</span> {(animal as any).detailedInfo.funFact}
                      </p>
                    )}
                  </div>
                )}

                {/* 전투 능력치 */}
                {(animal.attack_power || animal.strength || animal.speed || animal.energy) && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-700">전투 능력치</h3>
                    <div className="space-y-2">
                      {animal.attack_power !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium w-16">공격력</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${animal.attack_power}%` }}
                              transition={{ delay: 0.3, duration: 0.5 }}
                              className="bg-red-500 h-2 rounded-full"
                            />
                          </div>
                          <span className="text-sm font-medium w-10 text-right">{animal.attack_power}</span>
                        </div>
                      )}
                      {animal.strength !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium w-16">힘</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${animal.strength}%` }}
                              transition={{ delay: 0.4, duration: 0.5 }}
                              className="bg-orange-500 h-2 rounded-full"
                            />
                          </div>
                          <span className="text-sm font-medium w-10 text-right">{animal.strength}</span>
                        </div>
                      )}
                      {animal.speed !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium w-16">속도</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${animal.speed}%` }}
                              transition={{ delay: 0.5, duration: 0.5 }}
                              className="bg-green-500 h-2 rounded-full"
                            />
                          </div>
                          <span className="text-sm font-medium w-10 text-right">{animal.speed}</span>
                        </div>
                      )}
                      {animal.energy !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium w-16">에너지</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${animal.energy}%` }}
                              transition={{ delay: 0.6, duration: 0.5 }}
                              className="bg-blue-500 h-2 rounded-full"
                            />
                          </div>
                          <span className="text-sm font-medium w-10 text-right">{animal.energy}</span>
                        </div>
                      )}
                    </div>
                    {/* 총 전투력 표시 */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">총 전투력</span>
                        <span className="text-lg font-bold text-purple-600">
                          {(animal.attack_power || 0) + (animal.strength || 0) + (animal.speed || 0) + (animal.energy || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 배틀 크라이 (있다면) */}
                {(animal as any).battleCry && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200"
                  >
                    <p className="text-center font-bold text-orange-700">
                      "{(animal as any).battleCry}"
                    </p>
                  </motion.div>
                )}
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-4">
                {onSelect && (
                  <button
                    onClick={onSelect}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    이 동물 선택하기!
                  </button>
                )}
                <button
                  onClick={onClose}
                  className={`${onSelect ? 'w-1/3' : 'flex-1'} bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all duration-200`}
                >
                  닫기
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}