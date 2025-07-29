'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-100 to-green-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-blue-600 mb-2">
            🦁 동물 텍스트 배틀 🦄
          </h1>
          <p className="text-xl text-gray-700">
            동물 친구들과 함께하는 재미있는 텍스트 배틀!
          </p>
        </header>

        {/* 로그인 옵션 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">
            어떻게 시작할까요? 🎮
          </h2>

          {!showLogin ? (
            <div className="space-y-4">
              {/* 게스트로 바로 시작 버튼 */}
              <button
                onClick={handleGuestPlay}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl text-xl transition-colors duration-200 flex items-center justify-center gap-3"
              >
                <span className="text-2xl">🎯</span>
                바로 게임 시작하기!
              </button>

              {/* 이메일로 로그인 버튼 */}
              <button
                onClick={() => setShowLogin(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl text-xl transition-colors duration-200 flex items-center justify-center gap-3"
              >
                <span className="text-2xl">📧</span>
                이메일로 시작하기
              </button>

              {/* 도움말 */}
              <div className="mt-6 p-4 bg-yellow-100 rounded-xl">
                <p className="text-center text-gray-700">
                  <span className="font-bold">💡 도움말:</span> 이메일로 시작하면 
                  캐릭터를 저장하고 순위를 기록할 수 있어요!
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
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                  disabled={isLoading}
                >
                  뒤로가기
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? '로그인 중...' : '시작하기'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 게임 소개 및 네비게이션 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6 text-center">
            🎮 게임 방법
          </h3>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <button
              onClick={() => window.location.href = '/animals'}
              className="group cursor-pointer transform transition-all duration-200 hover:scale-105"
            >
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 text-center hover:shadow-lg">
                <div className="text-5xl mb-3">🐻</div>
                <h4 className="font-bold mb-2 text-lg">1. 동물 선택</h4>
                <p className="text-gray-600 text-sm mb-3">
                  좋아하는 동물을 골라 캐릭터를 만들어요
                </p>
                <p className="text-purple-600 font-bold text-sm group-hover:underline">
                  동물 도감 보기 →
                </p>
              </div>
            </button>
            <button
              onClick={() => window.location.href = '/text-guide'}
              className="group cursor-pointer transform transition-all duration-200 hover:scale-105"
            >
              <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-2xl p-6 text-center hover:shadow-lg">
                <div className="text-5xl mb-3">✍️</div>
                <h4 className="font-bold mb-2 text-lg">2. 텍스트 작성</h4>
                <p className="text-gray-600 text-sm mb-3">
                  100자 이내로 멋진 배틀 텍스트를 써요
                </p>
                <p className="text-green-600 font-bold text-sm group-hover:underline">
                  작성 가이드 보기 →
                </p>
              </div>
            </button>
            <button
              onClick={() => window.location.href = '/leaderboard'}
              className="group cursor-pointer transform transition-all duration-200 hover:scale-105"
            >
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 text-center hover:shadow-lg">
                <div className="text-5xl mb-3">🏆</div>
                <h4 className="font-bold mb-2 text-lg">3. 배틀 & 순위</h4>
                <p className="text-gray-600 text-sm mb-3">
                  다른 친구들과 배틀하고 순위를 올려요
                </p>
                <p className="text-orange-600 font-bold text-sm group-hover:underline">
                  순위표 보기 →
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h3 className="text-xl font-bold mb-4 text-center">
            ✨ 게임 특징
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-bold text-blue-700 mb-2">🎯 일일 배틀 제한</h4>
              <p className="text-sm text-gray-700">
                캐릭터당 하루 10번까지 배틀 가능해요. 
                하지만 🤖 대기 계정과는 무제한으로 연습할 수 있어요!
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <h4 className="font-bold text-purple-700 mb-2">📊 공정한 점수 시스템</h4>
              <p className="text-sm text-gray-700">
                ELO 시스템으로 실력을 정확히 측정해요. 
                강한 상대를 이기면 더 많은 점수를 얻어요!
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <h4 className="font-bold text-green-700 mb-2">🦄 다양한 동물들</h4>
              <p className="text-sm text-gray-700">
                현존하는 동물부터 전설의 동물, 고생대 동물까지! 
                16가지 동물로 캐릭터를 만들 수 있어요.
              </p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4">
              <h4 className="font-bold text-yellow-700 mb-2">🛡️ 안전한 환경</h4>
              <p className="text-sm text-gray-700">
                부적절한 내용은 자동으로 필터링돼요. 
                모두가 즐거운 게임을 만들어가요!
              </p>
            </div>
          </div>
        </div>

        {/* 관리자 아이콘 (숨김) */}
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => window.location.href = '/admin'}
            className="opacity-20 hover:opacity-100 transition-all duration-300 cursor-pointer hover:scale-110 hover:rotate-12"
            title="관리자 페이지"
          >
            <span className="text-4xl drop-shadow-lg">🦄</span>
          </button>
        </div>
      </div>
    </main>
  );
}