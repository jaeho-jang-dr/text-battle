'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Animal {
  id: number;
  name: string;
  korean_name: string;
  category: string;
  description: string;
  abilities: string;
  emoji: string;
  color?: string;
}

interface Character {
  id: number;
  name: string;
  animal: Animal;
}

export default function CreateCharacterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const animalId = searchParams.get('animal');
  
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [characterName, setCharacterName] = useState('');
  const [battleText, setBattleText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [existingCharacters, setExistingCharacters] = useState<Character[]>([]);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    checkAuthAndFetchData();
  }, [animalId]);

  const checkAuthAndFetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다!');
      router.push('/');
      return;
    }

    // Fetch existing characters to check limit
    try {
      const response = await fetch('/api/characters', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setExistingCharacters(data.data || []);
        
        // Check character limit
        if (data.data && data.data.length >= 3) {
          alert('캐릭터는 최대 3개까지만 만들 수 있어요!');
          router.push('/play');
          return;
        }
      }
    } catch (error) {
      console.error('Failed to fetch characters:', error);
    }

    // Fetch selected animal if animalId is provided
    if (animalId) {
      fetchAnimal(animalId);
    }
  };

  const fetchAnimal = async (id: string) => {
    try {
      const response = await fetch('/api/animals');
      const data = await response.json();
      if (data.success) {
        const animal = data.data.find((a: Animal) => a.id === parseInt(id));
        if (animal) {
          setSelectedAnimal(animal);
        }
      }
    } catch (error) {
      console.error('Failed to fetch animal:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAnimal) {
      setError('동물을 선택해주세요!');
      return;
    }

    if (characterName.length < 2 || characterName.length > 20) {
      setError('이름은 2자 이상 20자 이하로 입력해주세요!');
      return;
    }

    if (battleText.length < 10 || battleText.length > 100) {
      setError('배틀 텍스트는 10자 이상 100자 이하로 입력해주세요!');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: characterName,
          animalId: selectedAnimal.id,
          battleText: battleText
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('캐릭터가 생성되었습니다!');
        router.push('/play');
      } else {
        setError(data.error || '캐릭터 생성에 실패했습니다');
      }
    } catch (error) {
      console.error('Character creation error:', error);
      setError('캐릭터 생성 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // 단계 이동 함수
  const goToStep = (step: number) => {
    if (step === 2 && !selectedAnimal) {
      setError('먼저 동물을 선택해주세요!');
      return;
    }
    if (step === 3 && (!selectedAnimal || !characterName)) {
      setError('먼저 동물과 이름을 입력해주세요!');
      return;
    }
    setError('');
    setCurrentStep(step);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 pb-20">
      {/* 상단 헤더 */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg safe-top">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold">🎮 캐릭터 만들기</h1>
              <p className="text-purple-200 text-sm mt-1">
                {existingCharacters.length}/3 캐릭터 보유중
              </p>
            </div>
            <button
              onClick={() => router.push('/play')}
              className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg transition-all duration-200 active:scale-95"
              aria-label="돌아가기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 단계 표시기 */}
      <div className="px-4 py-4 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <button
                onClick={() => goToStep(step)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  currentStep >= step
                    ? 'bg-purple-600 text-white scale-110'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step}
              </button>
              {step < 3 && (
                <div className="flex-1 h-1 mx-2">
                  <div className={`h-full rounded transition-all duration-300 ${
                    currentStep > step ? 'bg-purple-600' : 'bg-gray-300'
                  }`} />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs mt-2 max-w-md mx-auto">
          <span className={`font-bold ${currentStep === 1 ? 'text-purple-600' : 'text-gray-600'}`}>동물 선택</span>
          <span className={`font-bold ${currentStep === 2 ? 'text-purple-600' : 'text-gray-600'}`}>이름 짓기</span>
          <span className={`font-bold ${currentStep === 3 ? 'text-purple-600' : 'text-gray-600'}`}>대사 작성</span>
        </div>
      </div>

      <div className="px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Step 1: 동물 선택 */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mobile-card"
            >
              <div className="text-center py-4">
                <h2 className="text-2xl font-bold mb-4">1단계: 동물 선택</h2>
                {selectedAnimal ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-4"
                  >
                    <div className="emoji-xl mb-2 floating">{selectedAnimal.emoji}</div>
                    <h3 className="text-xl font-bold">{selectedAnimal.korean_name}</h3>
                    <p className="text-gray-600 text-sm mt-2">{selectedAnimal.description}</p>
                    <p className="text-purple-600 text-sm font-bold mt-2">{selectedAnimal.abilities}</p>
                  </motion.div>
                ) : (
                  <div className="py-8">
                    <div className="emoji-xl mb-4">❓</div>
                    <p className="text-gray-600 mb-4">아직 동물을 선택하지 않았어요!</p>
                  </div>
                )}
                
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => router.push('/animals')}
                    className="w-full btn-primary text-lg py-4"
                  >
                    🦁 동물 도감에서 선택하기
                  </button>
                  
                  {selectedAnimal && (
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="w-full btn-success text-lg py-4"
                    >
                      다음 단계로 →
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: 이름 입력 */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mobile-card"
            >
              <div className="py-4">
                <h2 className="text-2xl font-bold text-center mb-6">2단계: 이름 짓기</h2>
                
                {/* 미리보기 */}
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="inline-block"
                  >
                    <div className="emoji-xl mb-2">{selectedAnimal?.emoji}</div>
                    <p className="text-lg font-bold text-purple-600">
                      {characterName || '???'}
                    </p>
                    <p className="text-sm text-gray-600">{selectedAnimal?.korean_name}</p>
                  </motion.div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">
                      캐릭터 이름 (2-20자)
                    </label>
                    <input
                      type="text"
                      value={characterName}
                      onChange={(e) => setCharacterName(e.target.value.slice(0, 20))}
                      placeholder="예: 용감한 사자왕"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
                      autoFocus
                    />
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-gray-600">멋진 이름을 지어주세요!</span>
                      <span className={`font-bold ${
                        characterName.length < 2 ? 'text-red-600' : 
                        characterName.length > 20 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {characterName.length}/20자
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="flex-1 btn-secondary"
                    >
                      ← 이전
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      disabled={characterName.length < 2}
                      className="flex-1 btn-success disabled:opacity-50"
                    >
                      다음 →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: 배틀 텍스트 */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mobile-card"
            >
              <div className="py-4">
                <h2 className="text-2xl font-bold text-center mb-6">3단계: 배틀 대사</h2>
                
                {/* 캐릭터 미리보기 */}
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mb-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="emoji-lg">{selectedAnimal?.emoji}</div>
                    <div className="flex-1">
                      <p className="font-bold text-lg">{characterName}</p>
                      <p className="text-sm text-gray-600">{selectedAnimal?.korean_name}</p>
                    </div>
                  </div>
                  {battleText && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-white rounded-lg"
                    >
                      <p className="text-sm text-gray-700">💬 "{battleText}"</p>
                    </motion.div>
                  )}
                </motion.div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">
                      배틀할 때 외칠 대사 (10-100자)
                    </label>
                    <textarea
                      value={battleText}
                      onChange={(e) => setBattleText(e.target.value.slice(0, 100))}
                      placeholder="예: 나는 정글의 왕! 용감하고 강력한 사자다. 모든 동물들이 나를 존경한다!"
                      className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none resize-none h-32 text-base"
                      autoFocus
                    />
                    <div className="flex justify-between mt-2 text-sm">
                      <button
                        type="button"
                        onClick={() => router.push('/text-guide')}
                        className="text-purple-600 hover:text-purple-700 font-bold active:scale-95"
                      >
                        📝 작성 가이드
                      </button>
                      <span className={`font-bold ${
                        battleText.length < 10 ? 'text-red-600' : 
                        battleText.length > 100 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {battleText.length}/100자
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="btn-secondary"
                    >
                      ← 이전
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPreview(true)}
                      disabled={battleText.length < 10}
                      className="btn-primary flex-1 disabled:opacity-50"
                    >
                      미리보기
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 에러 메시지 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 bg-red-100 border-2 border-red-300 rounded-xl p-4 text-red-700 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 최종 미리보기 모달 */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowPreview(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-3xl p-6 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold text-center mb-6">캐릭터 미리보기</h3>
                
                <div className="text-center mb-6">
                  <div className="emoji-xl mb-2 floating">{selectedAnimal?.emoji}</div>
                  <h4 className="text-xl font-bold">{characterName}</h4>
                  <p className="text-gray-600">{selectedAnimal?.korean_name}</p>
                </div>

                <div className="bg-gray-100 rounded-xl p-4 mb-6">
                  <p className="text-sm font-bold text-gray-700 mb-2">배틀 대사:</p>
                  <p className="text-gray-800">💬 "{battleText}"</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-xl text-lg transition-all duration-200 active:scale-95"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        생성 중...
                      </span>
                    ) : (
                      '🎮 캐릭터 생성하기'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    disabled={isLoading}
                    className="w-full btn-secondary"
                  >
                    다시 수정하기
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 내 캐릭터 목록 */}
        {existingCharacters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mobile-card mt-6"
          >
            <h3 className="text-lg font-bold mb-3">내 캐릭터 ({existingCharacters.length}/3)</h3>
            <div className="space-y-2">
              {existingCharacters.map((char, index) => (
                <motion.div
                  key={char.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3"
                >
                  <div className="emoji-md">{char.animal.emoji}</div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{char.name}</p>
                    <p className="text-xs text-gray-600">{char.animal.korean_name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            {existingCharacters.length === 3 && (
              <p className="text-center text-sm text-orange-600 font-bold mt-3">
                ⚠️ 캐릭터 최대 개수에 도달했어요!
              </p>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}