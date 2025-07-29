'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🎮 캐릭터 만들기</h1>
              <p className="text-purple-200">
                나만의 캐릭터를 만들어보세요! ({existingCharacters.length}/3)
              </p>
            </div>
            <button
              onClick={() => router.push('/play')}
              className="bg-white/20 hover:bg-white/30 backdrop-blur px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105"
            >
              🏠 돌아가기
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 동물 선택 */}
            <div>
              <label className="block text-lg font-bold mb-4">
                1️⃣ 동물 선택
              </label>
              {selectedAnimal ? (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 text-center">
                  <div className="text-6xl mb-2">{selectedAnimal.emoji}</div>
                  <h3 className="text-xl font-bold">{selectedAnimal.korean_name}</h3>
                  <p className="text-gray-600 mt-2">{selectedAnimal.description}</p>
                  <button
                    type="button"
                    onClick={() => router.push('/animals')}
                    className="mt-4 text-purple-600 hover:text-purple-700 font-bold"
                  >
                    다른 동물 선택하기 →
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push('/animals')}
                  className="w-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 p-8 rounded-2xl transition-all duration-200"
                >
                  <div className="text-4xl mb-2">🦁</div>
                  <p className="text-gray-700 font-bold">동물 도감에서 선택하기</p>
                </button>
              )}
            </div>

            {/* 캐릭터 이름 */}
            <div>
              <label className="block text-lg font-bold mb-4">
                2️⃣ 캐릭터 이름 (2-20자)
              </label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value.slice(0, 20))}
                placeholder="예: 용감한 사자왕"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
                required
              />
              <div className="text-right mt-2 text-sm text-gray-600">
                {characterName.length}/20자
              </div>
            </div>

            {/* 배틀 텍스트 */}
            <div>
              <label className="block text-lg font-bold mb-4">
                3️⃣ 배틀 텍스트 (10-100자)
              </label>
              <textarea
                value={battleText}
                onChange={(e) => setBattleText(e.target.value.slice(0, 100))}
                placeholder="예: 나는 정글의 왕! 용감하고 강력한 사자다. 모든 동물들이 나를 존경한다!"
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none resize-none h-32 text-lg"
                required
              />
              <div className="flex justify-between mt-2 text-sm">
                <button
                  type="button"
                  onClick={() => router.push('/text-guide')}
                  className="text-purple-600 hover:text-purple-700 font-bold"
                >
                  📝 작성 가이드 보기
                </button>
                <span className={`${
                  battleText.length < 10 ? 'text-red-600' : 
                  battleText.length > 100 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {battleText.length}/100자
                </span>
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 text-red-700">
                {error}
              </div>
            )}

            {/* 제출 버튼 */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading || !selectedAnimal || !characterName || !battleText}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
              >
                {isLoading ? '생성 중...' : '🎮 캐릭터 생성하기'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/play')}
                className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl text-lg transition-all duration-200"
              >
                취소
              </button>
            </div>
          </form>
        </motion.div>

        {/* 캐릭터 목록 */}
        {existingCharacters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-white rounded-3xl shadow-xl p-8"
          >
            <h2 className="text-xl font-bold mb-4">내 캐릭터 목록 ({existingCharacters.length}/3)</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {existingCharacters.map((char) => (
                <div key={char.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">{char.animal.emoji}</div>
                  <p className="font-bold">{char.name}</p>
                  <p className="text-sm text-gray-600">{char.animal.korean_name}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}