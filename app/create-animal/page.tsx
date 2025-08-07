"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
// import { useAuth } from '@/hooks/useAuth';
import HelpButton from '@/components/help/HelpButton';

const animalEmojis = ['🦁', '🐯', '🐻', '🦊', '🐺', '🦄', '🐉', '🦅', '🦜', '🦚', '🐸', '🦎', '🐢', '🦂', '🦋'];
const habitatOptions = ['숲', '바다', '하늘', '사막', '극지방', '초원', '산', '동굴', '강', '호수'];
const foodOptions = ['고기', '풀', '과일', '물고기', '곤충', '꿀', '열매', '씨앗', '뿌리', '잡식'];

export default function CreateAnimalPage() {
  const router = useRouter();
  // const { user, requireAuth } = useAuth();
  const user: { id: string } | null = null; // 임시
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('관리자 로그인이 필요합니다!');
      router.push('/');
      return;
    }

    try {
      const response = await fetch('/api/admin/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success && data.data.isAdmin) {
        setIsAdmin(true);
      } else {
        alert('관리자 권한이 필요합니다!');
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to verify admin status:', error);
      alert('권한 확인 중 오류가 발생했습니다.');
      router.push('/');
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // 동물 정보 상태
  const [animalData, setAnimalData] = useState({
    name: '',
    korean_name: '',
    emoji: '🦁',
    description: '',
    kid_description: '',
    habitat: '',
    food: '',
    speciality: '',
    fun_fact: '',
    battle_cry: '',
    // 스탯 (0-100)
    power: 50,
    defense: 50,
    speed: 50,
    intelligence: 50,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 입력값 검증
      if (!animalData.korean_name || animalData.korean_name.length < 2) {
        setError('동물 이름은 2글자 이상이어야 해요!');
        setLoading(false);
        return;
      }

      if (!animalData.kid_description || animalData.kid_description.length < 10) {
        setError('동물 설명은 10글자 이상 써주세요!');
        setLoading(false);
        return;
      }

      // 스탯 합계 검증 (최대 280점)
      const totalStats = animalData.power + animalData.defense + animalData.speed + animalData.intelligence;
      if (totalStats > 280) {
        setError('스탯 합계가 280을 넘을 수 없어요! 현재: ' + totalStats);
        setLoading(false);
        return;
      }

      // API 호출
      const response = await fetch('/api/animals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer anonymous`
        },
        body: JSON.stringify({
          ...animalData,
          category: 'custom',
          sub_category: '플레이어 제작',
          rarity: 'rare',
          unlock_level: 1,
          created_by: 'anonymous'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '동물 생성에 실패했어요!');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/animals');
        }, 2000);
      }
    } catch (err) {
      console.error('동물 생성 오류:', err);
      setError('동물을 만드는 중 문제가 발생했어요!');
    } finally {
      setLoading(false);
    }
  };

  const handleStatChange = (stat: string, value: number) => {
    setAnimalData(prev => ({
      ...prev,
      [stat]: Math.max(0, Math.min(100, value))
    }));
  };

  const totalStats = animalData.power + animalData.defense + animalData.speed + animalData.intelligence;
  const statsPercentage = (totalStats / 280) * 100;

  // 권한 확인 중일 때 로딩 화면
  if (isCheckingAuth) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🦄</div>
          <p className="text-xl font-bold text-gray-700">권한을 확인하는 중...</p>
        </div>
      </main>
    );
  }

  // 관리자가 아닌 경우 (이미 redirect 되었을 것이지만 안전장치)
  if (!isAdmin) {
    return null;
  }

  return (
    <main className="min-h-screen p-8">
      {/* 도움말 버튼 */}
      <HelpButton 
        title="🎨 나만의 동물 만들기"
        content="상상력을 발휘해서 특별한 동물을 만들어보세요! 이름과 설명을 정해주고, 서식지와 먹이를 선택해요. 스탯을 조절해서 강점을 만들어요!"
      />

      {/* 뒤로가기 버튼 */}
      <Link href="/animals" className="fixed top-4 left-4">
        <button className="bg-kid-blue text-white p-3 rounded-full shadow-lg hover:scale-110 transition">
          <span className="text-2xl">←</span>
        </button>
      </Link>

      <div className="max-w-4xl mx-auto">
        {/* 타이틀 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-title mb-4">나만의 동물 만들기 🎨</h1>
          <p className="text-xl text-gray-700">상상력을 발휘해서 특별한 동물을 만들어보세요!</p>
        </motion.div>

        {success ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="card-animal p-8 text-center"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-kid-green mb-4">
              {animalData.korean_name}가 탄생했어요!
            </h2>
            <p className="text-gray-700">동물 도감에서 확인해보세요!</p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* 기본 정보 */}
            <div className="card-animal p-6">
              <h3 className="text-xl font-bold mb-4 text-kid-blue">🦁 기본 정보</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    동물 이름 (한글)
                  </label>
                  <input
                    type="text"
                    value={animalData.korean_name}
                    onChange={(e) => setAnimalData(prev => ({ ...prev, korean_name: e.target.value }))}
                    placeholder="예: 무지개 유니콘"
                    className="input-primary w-full"
                    maxLength={20}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    영어 이름 (선택)
                  </label>
                  <input
                    type="text"
                    value={animalData.name}
                    onChange={(e) => setAnimalData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="예: Rainbow Unicorn"
                    className="input-primary w-full"
                    maxLength={30}
                  />
                </div>
              </div>

              {/* 이모지 선택 */}
              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  대표 이모지
                </label>
                <div className="flex flex-wrap gap-2">
                  {animalEmojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAnimalData(prev => ({ ...prev, emoji }))}
                      className={`text-3xl p-2 rounded-lg transition ${
                        animalData.emoji === emoji 
                          ? 'bg-kid-yellow shadow-lg scale-110' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 설명 */}
            <div className="card-animal p-6">
              <h3 className="text-xl font-bold mb-4 text-kid-orange">📝 설명</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    아이들을 위한 설명
                  </label>
                  <textarea
                    value={animalData.kid_description}
                    onChange={(e) => setAnimalData(prev => ({ ...prev, kid_description: e.target.value }))}
                    placeholder="이 동물은 어떤 특징이 있나요? 아이들이 이해하기 쉽게 설명해주세요!"
                    className="input-primary w-full h-24 resize-none"
                    maxLength={200}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {animalData.kid_description.length}/200자
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    전투 함성
                  </label>
                  <input
                    type="text"
                    value={animalData.battle_cry}
                    onChange={(e) => setAnimalData(prev => ({ ...prev, battle_cry: e.target.value }))}
                    placeholder="예: 무지개 파워!"
                    className="input-primary w-full"
                    maxLength={30}
                  />
                </div>
              </div>
            </div>

            {/* 특성 */}
            <div className="card-animal p-6">
              <h3 className="text-xl font-bold mb-4 text-kid-green">🌿 특성</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    서식지
                  </label>
                  <select
                    value={animalData.habitat}
                    onChange={(e) => setAnimalData(prev => ({ ...prev, habitat: e.target.value }))}
                    className="input-primary w-full"
                    required
                  >
                    <option value="">선택하세요</option>
                    {habitatOptions.map(habitat => (
                      <option key={habitat} value={habitat}>{habitat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    좋아하는 음식
                  </label>
                  <select
                    value={animalData.food}
                    onChange={(e) => setAnimalData(prev => ({ ...prev, food: e.target.value }))}
                    className="input-primary w-full"
                    required
                  >
                    <option value="">선택하세요</option>
                    {foodOptions.map(food => (
                      <option key={food} value={food}>{food}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    특기
                  </label>
                  <input
                    type="text"
                    value={animalData.speciality}
                    onChange={(e) => setAnimalData(prev => ({ ...prev, speciality: e.target.value }))}
                    placeholder="예: 무지개 만들기"
                    className="input-primary w-full"
                    maxLength={30}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    재미있는 사실
                  </label>
                  <input
                    type="text"
                    value={animalData.fun_fact}
                    onChange={(e) => setAnimalData(prev => ({ ...prev, fun_fact: e.target.value }))}
                    placeholder="예: 행복할 때 뿔이 반짝여요"
                    className="input-primary w-full"
                    maxLength={50}
                  />
                </div>
              </div>
            </div>

            {/* 스탯 */}
            <div className="card-animal p-6">
              <h3 className="text-xl font-bold mb-4 text-kid-purple">📊 능력치</h3>
              
              {/* 스탯 총합 표시 */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">총 스탯</span>
                  <span className={`font-bold ${totalStats > 280 ? 'text-red-500' : 'text-green-500'}`}>
                    {totalStats} / 280
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <motion.div
                    className={`h-full ${totalStats > 280 ? 'bg-red-500' : 'bg-green-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, statsPercentage)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* 각 스탯 */}
              <div className="space-y-4">
                {[
                  { name: 'power', label: '힘', emoji: '💪', color: 'bg-red-500' },
                  { name: 'defense', label: '방어', emoji: '🛡️', color: 'bg-blue-500' },
                  { name: 'speed', label: '속도', emoji: '⚡', color: 'bg-yellow-500' },
                  { name: 'intelligence', label: '지능', emoji: '🧠', color: 'bg-purple-500' }
                ].map(stat => (
                  <div key={stat.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold flex items-center gap-2">
                        <span className="text-xl">{stat.emoji}</span>
                        {stat.label}
                      </span>
                      <span className="font-mono font-bold">
                        {animalData[stat.name as keyof typeof animalData]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={animalData[stat.name as keyof typeof animalData]}
                        onChange={(e) => handleStatChange(stat.name, parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={animalData[stat.name as keyof typeof animalData]}
                        onChange={(e) => handleStatChange(stat.name, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border rounded text-center"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-100 text-red-700 rounded-lg text-center"
              >
                {error}
              </motion.div>
            )}

            {/* 제출 버튼 */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || totalStats > 280}
                className="btn-primary flex-1"
              >
                {loading ? '만드는 중...' : '동물 만들기!'}
              </button>
              <Link href="/animals" className="flex-1">
                <button type="button" className="btn-secondary w-full">
                  취소
                </button>
              </Link>
            </div>
          </motion.form>
        )}
      </div>

      {/* 움직이는 동물들 장식 */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-around p-4 pointer-events-none">
        {['🦄', '🐉', '🦅'].map((emoji, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3 + i, 
              delay: i * 0.5 
            }}
            className="text-4xl"
          >
            {emoji}
          </motion.div>
        ))}
      </div>
    </main>
  );
}