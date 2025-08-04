'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [currentView, setCurrentView] = useState<'main' | 'email' | 'guest'>('main');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [dailyBattleLimit, setDailyBattleLimit] = useState(10);
  const { login, guestLogin, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // 클라이언트 상태 설정
  useEffect(() => {
    setIsClient(true);
    loadBattleLimit();
  }, []);

  const loadBattleLimit = async () => {
    try {
      const response = await fetch(`/api/settings/battle-limit?_t=${Date.now()}`);
      const data = await response.json();
      if (data.success) {
        setDailyBattleLimit(data.data.dailyBattleLimit);
      }
    } catch (error) {
      console.error('Failed to load battle limit:', error);
    }
  };

  // 이미 로그인된 사용자는 게임 페이지로 리다이렉트 (클라이언트에서만)
  useEffect(() => {
    if (isClient && isAuthenticated && !authLoading) {
      router.push('/play');
    }
  }, [isClient, isAuthenticated, authLoading, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), isGuest: false })
      });

      const data = await response.json();
      if (data.success) {
        login(data.data.token, data.data.user);
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

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      const success = await guestLogin();
      if (!success) {
        alert('게스트 로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Guest login failed:', error);
      alert('게스트 로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentView('main');
    setEmail('');
  };

  // 클라이언트에서만 로딩 상태 표시
  if (isClient && authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 서버 렌더링이나 클라이언트 초기 렌더링에서는 기본 UI 표시
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <header className="text-center mb-12">
            <div className="mb-6">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
                🦁 동물 텍스트 배틀 🦄
              </h1>
              <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
                동물 친구들과 함께하는 재미있는 텍스트 배틀 게임!
              </p>
            </div>
          </header>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* 헤더 */}
        <header className="text-center mb-12">
          <div className="mb-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
              🦁 동물 텍스트 배틀 🦄
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
              동물 친구들과 함께하는 재미있는 텍스트 배틀 게임!
            </p>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="space-y-8">
          
          {/* 로그인 선택 카드 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 md:p-8">
              
              {/* 메인 선택 화면 */}
              {currentView === 'main' && (
                <div className="space-y-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">
                    🎮 어떻게 시작할까요?
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* 게스트 로그인 버튼 */}
                    <button
                      onClick={() => setCurrentView('guest')}
                      className="group p-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      <div className="text-4xl mb-3">🎯</div>
                      <h3 className="text-xl font-bold mb-2">바로 게임 시작!</h3>
                      <p className="text-green-100 text-sm">
                        즉시 플레이 가능한<br />게스트 모드
                      </p>
                    </button>

                    {/* 이메일 로그인 버튼 */}
                    <button
                      onClick={() => setCurrentView('email')}
                      className="group p-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      <div className="text-4xl mb-3">📧</div>
                      <h3 className="text-xl font-bold mb-2">이메일로 시작</h3>
                      <p className="text-blue-100 text-sm">
                        데이터 저장 및<br />순위 기록 가능
                      </p>
                    </button>
                  </div>

                  {/* 도움말 */}
                  <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">💡</div>
                      <div>
                        <p className="text-amber-800 font-medium mb-1">게임 방법</p>
                        <p className="text-amber-700 text-sm">
                          좋아하는 동물을 선택하고 멋진 배틀 텍스트를 작성해서 다른 플레이어와 대결하세요!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 이메일 로그인 폼 */}
              {currentView === 'email' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-4">📧</div>
                    <h2 className="text-2xl font-bold text-gray-800">이메일로 시작하기</h2>
                    <p className="text-gray-600 mt-2">이메일 주소를 입력하면 자동으로 계정이 생성됩니다</p>
                  </div>

                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        이메일 주소
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={resetForm}
                        disabled={isLoading}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        뒤로가기
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || !email.trim()}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoading ? '로그인 중...' : '시작하기'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 게스트 안내 화면 */}
              {currentView === 'guest' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-4">🎮</div>
                    <h2 className="text-2xl font-bold text-gray-800">게스트로 시작하기</h2>
                  </div>

                  {/* 게스트 모드 특징 */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                        <span className="text-xl mr-2">✨</span>
                        게스트 모드 특징
                      </h3>
                      <ul className="space-y-2 text-sm text-blue-700">
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          즉시 게임 시작 가능
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          캐릭터 3개까지 생성
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          하루 {dailyBattleLimit}회 배틀 제한
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          🤖 연습 상대와 무제한 배틀
                        </li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h3 className="font-bold text-orange-800 mb-2 flex items-center">
                        <span className="text-xl mr-2">⚠️</span>
                        주의사항
                      </h3>
                      <p className="text-sm text-orange-700">
                        게스트 계정은 브라우저를 닫으면 데이터가 사라집니다. 
                        지속적인 플레이를 원한다면 이메일 가입을 추천합니다!
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={isLoading}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      뒤로가기
                    </button>
                    <button
                      onClick={handleGuestLogin}
                      disabled={isLoading}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? '시작 중...' : '게스트로 시작!'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* 게임 특징 카드들 */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">일일 배틀 시스템</h3>
              <p className="text-gray-600 text-sm">
                캐릭터당 하루 {dailyBattleLimit}번의 배틀 제한이 있지만, 🤖 연습 상대와는 무제한으로 배틀할 수 있어요!
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">ELO 점수 시스템</h3>
              <p className="text-gray-600 text-sm">
                실력에 따른 정확한 점수 측정! 강한 상대를 이기면 더 많은 점수를 획득할 수 있어요.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <div className="text-3xl mb-3">🦄</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">다양한 동물들</h3>
              <p className="text-gray-600 text-sm">
                현존 동물, 전설의 동물, 고생대 동물까지! 총 80여 종의 동물로 캐릭터를 만들 수 있어요.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">안전한 환경</h3>
              <p className="text-gray-600 text-sm">
                부적절한 내용은 자동으로 필터링되어 모든 연령대가 안전하게 즐길 수 있는 환경입니다.
              </p>
            </div>
          </div>

          {/* 빠른 링크 */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">🔗 빠른 링크</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <a
                href="/animals"
                className="flex flex-col items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
              >
                <span className="text-2xl mb-1">🐻</span>
                <span className="text-sm font-medium text-gray-700">동물 도감</span>
              </a>
              <a
                href="/leaderboard"
                className="flex flex-col items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
              >
                <span className="text-2xl mb-1">🏆</span>
                <span className="text-sm font-medium text-gray-700">순위표</span>
              </a>
              <a
                href="/text-guide"
                className="flex flex-col items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
              >
                <span className="text-2xl mb-1">✍️</span>
                <span className="text-sm font-medium text-gray-700">작성 가이드</span>
              </a>
            </div>
          </div>

        </main>

        {/* 관리자 버튼 (숨김) */}
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => window.location.href = '/admin'}
            className="opacity-20 hover:opacity-100 transition-all duration-300 transform hover:scale-110 hover:rotate-12"
            title="관리자 페이지"
          >
            <span className="text-3xl drop-shadow-lg">🦄</span>
          </button>
        </div>

      </div>
    </div>
  );
}