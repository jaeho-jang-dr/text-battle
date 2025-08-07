'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyBattleLimit, setDailyBattleLimit] = useState<number>(10);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // 배틀 제한 횟수 가져오기
    fetch('/api/settings/battle-limit')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDailyBattleLimit(data.data.dailyBattleLimit);
        }
      })
      .catch(error => {
        console.error('Failed to fetch battle limit:', error);
      });
  }, []);

  const handleGuestPlay = () => {
    // 게스트로 바로 게임 시작
    window.location.href = '/play?guest=true';
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, isGuest: false })
      });

      const data = await response.json();
      
      if (data.success) {
        // 토큰 저장
        localStorage.setItem('token', data.data.token);
        // Play 페이지로 이동
        window.location.href = '/play';
      } else {
        alert(data.error || '로그인에 실패했습니다');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('로그인 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // 자동 슬라이드
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: '🎮',
      title: '재미있는 텍스트 배틀',
      description: '친구들과 함께 즐기는 텍스트 대결!',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: '🦁',
      title: '80가지 동물 캐릭터',
      description: '좋아하는 동물로 나만의 캐릭터를 만들어요',
      color: 'from-green-400 to-green-600'
    },
    {
      icon: '🏆',
      title: '랭킹 시스템',
      description: '최고의 텍스트 배틀러가 되어보세요!',
      color: 'from-yellow-400 to-orange-500'
    }
  ];

  return (
    <main className="min-h-screen pb-20">
      {/* 상단 헤더 */}
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-1">🦁 동물 텍스트 배틀 🦄</h1>
          <p className="text-sm opacity-90">친구들과 함께하는 재미있는 모험!</p>
        </div>
      </header>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* 특징 슬라이드 */}
        <div className="mobile-card mb-6 overflow-hidden">
          <div className="relative h-40">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-500 flex flex-col items-center justify-center text-center p-4 ${
                  index === currentSlide ? 'opacity-100 translate-x-0' : 
                  index < currentSlide ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'
                }`}
              >
                <div className={`text-5xl mb-3 ${index === currentSlide ? 'animate-bounce-in' : ''}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-2 mt-4">
            {features.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-blue-500 w-8' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>

        {/* 빠른 시작 카드 */}
        <div className="mobile-card mb-6">
          <h2 className="text-xl font-bold text-center mb-4">
            🎮 빠른 시작
          </h2>

          {!showLogin ? (
            <div className="space-y-4">
              {/* 게스트로 바로 시작 버튼 */}
              <button
                onClick={handleGuestPlay}
                className="w-full btn-success text-lg flex items-center justify-center gap-2 shadow-md"
              >
                <span className="emoji-md">🎯</span>
                바로 게임 시작하기!
              </button>

              {/* 이메일로 로그인 버튼 */}
              <button
                onClick={() => setShowLogin(true)}
                className="w-full btn-primary text-lg flex items-center justify-center gap-2 shadow-md"
              >
                <span className="emoji-md">📧</span>
                이메일로 시작하기
              </button>

              {/* 도움말 */}
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-center text-gray-700 flex items-center justify-center gap-1">
                  <span className="emoji-sm">💡</span>
                  <span>이메일로 시작하면 캐릭터를 저장할 수 있어요!</span>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-lg font-medium mb-2">
                  이메일 주소
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-blue-500"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="flex-1 btn-secondary"
                  disabled={isLoading}
                >
                  뒤로가기
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? '로그인 중...' : '시작하기'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 빠른 메뉴 그리드 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => router.push('/animals')}
            className="mobile-card bg-gradient-to-br from-green-50 to-green-100 text-center group"
          >
            <div className="emoji-lg mb-2 group-hover:scale-110 transition-transform">🦁</div>
            <h4 className="font-bold text-base">동물 도감</h4>
            <p className="text-xs text-gray-600 mt-1">80종의 동물들</p>
          </button>
          <button
            onClick={() => router.push('/play')}
            className="mobile-card bg-gradient-to-br from-red-50 to-orange-100 text-center group"
          >
            <div className="emoji-lg mb-2 group-hover:scale-110 transition-transform">⚔️</div>
            <h4 className="font-bold text-base">배틀 시작</h4>
            <p className="text-xs text-gray-600 mt-1">친구와 대결!</p>
          </button>
          <button
            onClick={() => router.push('/leaderboard')}
            className="mobile-card bg-gradient-to-br from-yellow-50 to-yellow-100 text-center group"
          >
            <div className="emoji-lg mb-2 group-hover:scale-110 transition-transform">🏆</div>
            <h4 className="font-bold text-base">순위표</h4>
            <p className="text-xs text-gray-600 mt-1">최고의 배틀러</p>
          </button>

          <button
            onClick={() => router.push('/text-guide')}
            className="mobile-card bg-gradient-to-br from-purple-50 to-purple-100 text-center group"
          >
            <div className="emoji-lg mb-2 group-hover:scale-110 transition-transform">✍️</div>
            <h4 className="font-bold text-base">작성 가이드</h4>
            <p className="text-xs text-gray-600 mt-1">배틀 텍스트 팁</p>
          </button>
        </div>

        {/* 게임 특징 카드들 */}
        <div className="space-y-3">
          <div className="mobile-card bg-gradient-to-r from-blue-50 to-blue-100 flex items-start gap-3">
            <span className="emoji-md flex-shrink-0 mt-1">🎯</span>
            <div className="flex-1">
              <h4 className="font-bold text-sm mb-1">일일 배틀 제한</h4>
              <p className="text-xs text-gray-600">
                하루 {dailyBattleLimit}번 배틀 가능! 🤖 봇과는 무제한
              </p>
            </div>
          </div>
          <div className="mobile-card bg-gradient-to-r from-purple-50 to-purple-100 flex items-start gap-3">
            <span className="emoji-md flex-shrink-0 mt-1">📊</span>
            <div className="flex-1">
              <h4 className="font-bold text-sm mb-1">공정한 점수</h4>
              <p className="text-xs text-gray-600">
                ELO 시스템으로 실력 측정
              </p>
            </div>
          </div>
          <div className="mobile-card bg-gradient-to-r from-green-50 to-green-100 flex items-start gap-3">
            <span className="emoji-md flex-shrink-0 mt-1">🦄</span>
            <div className="flex-1">
              <h4 className="font-bold text-sm mb-1">80종의 동물</h4>
              <p className="text-xs text-gray-600">
                현존 50종 + 전설 15종 + 고생대 15종
              </p>
            </div>
          </div>
          <div className="mobile-card bg-gradient-to-r from-yellow-50 to-yellow-100 flex items-start gap-3">
            <span className="emoji-md flex-shrink-0 mt-1">🛡️</span>
            <div className="flex-1">
              <h4 className="font-bold text-sm mb-1">안전한 환경</h4>
              <p className="text-xs text-gray-600">
                자동 필터링으로 깨끗한 게임
              </p>
            </div>
          </div>
        </div>

        {/* 플레이 버튼 - 플로팅 액션 버튼 */}
        <button
          onClick={handleGuestPlay}
          className="fab bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse"
        >
          <span className="text-2xl">⚔️</span>
        </button>
      </div>
    </main>
  );
}