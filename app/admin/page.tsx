'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminStats {
  totalUsers: number;
  totalCharacters: number;
  totalBattles: number;
  activeUsers: number;
  suspendedUsers: number;
  todayBattles: number;
  averageElo: number;
  topCharacters: any[];
  recentBattles: any[];
  warningUsers: any[];
}

interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  permissions: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showMagicEffect, setShowMagicEffect] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'battles' | 'settings'>('stats');

  useEffect(() => {
    // 관리자 토큰 확인
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      const adminData = localStorage.getItem('adminUser');
      if (adminData) {
        setAdminUser(JSON.parse(adminData));
        setIsAuthorized(true);
        setShowLogin(false);
        fetchStats();
      }
    }
    setIsLoading(false);
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (data.success) {
        // 마법 효과 표시
        setShowMagicEffect(true);
        setTimeout(() => setShowMagicEffect(false), 2000);

        // 관리자 정보 저장
        localStorage.setItem('adminToken', data.data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.data.adminUser));
        
        setAdminUser(data.data.adminUser);
        setIsAuthorized(true);
        setShowLogin(false);
        fetchStats();
      } else {
        setLoginError(data.error || '로그인에 실패했습니다');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setLoginError('로그인 중 오류가 발생했습니다');
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/');
  };

  // 로그인 화면
  if (showLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* 배경 마법 효과 */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{
                x: Math.random() * 1920,
                y: Math.random() * 1080,
                opacity: 0
              }}
              animate={{
                y: -100,
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-md w-full relative z-10"
        >
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-8xl mb-4 inline-block"
            >
              🦄
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">관리자 포털</h1>
            <p className="text-blue-200">마법의 세계로 들어가세요</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label className="block text-white mb-2">사용자명</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="관리자 아이디"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">비밀번호</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="비밀번호"
                required
              />
            </div>

            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-300 text-sm text-center"
              >
                {loginError}
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              🪄 마법의 문 열기
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-blue-300 hover:text-blue-200 text-sm"
            >
              ← 메인으로 돌아가기
            </a>
          </div>
        </motion.div>

        {/* 마법 효과 */}
        <AnimatePresence>
          {showMagicEffect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white z-50 flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 2, 1], rotate: 360 }}
                transition={{ duration: 1.5 }}
                className="text-9xl"
              >
                ✨
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 관리자 대시보드
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-4xl"
            >
              🦄
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold">관리자 대시보드</h1>
              <p className="text-purple-200">Kid Text Battle 관리 시스템</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">
              {adminUser?.displayName} ({adminUser?.username})
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex">
            {['stats', 'users', 'battles', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-4 px-6 font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-purple-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-purple-100'
                }`}
              >
                {tab === 'stats' && '📊 통계'}
                {tab === 'users' && '👥 사용자'}
                {tab === 'battles' && '⚔️ 배틀'}
                {tab === 'settings' && '⚙️ 설정'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="max-w-7xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* 주요 통계 */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-xl shadow-lg p-6 text-center"
                >
                  <div className="text-3xl mb-2">👥</div>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <div className="text-gray-600">전체 사용자</div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-xl shadow-lg p-6 text-center"
                >
                  <div className="text-3xl mb-2">🦁</div>
                  <div className="text-2xl font-bold">{stats?.totalCharacters || 0}</div>
                  <div className="text-gray-600">전체 캐릭터</div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-xl shadow-lg p-6 text-center"
                >
                  <div className="text-3xl mb-2">⚔️</div>
                  <div className="text-2xl font-bold">{stats?.totalBattles || 0}</div>
                  <div className="text-gray-600">전체 배틀</div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-xl shadow-lg p-6 text-center"
                >
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
                  <div className="text-gray-600">활성 사용자</div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-xl shadow-lg p-6 text-center"
                >
                  <div className="text-3xl mb-2">🚫</div>
                  <div className="text-2xl font-bold text-red-600">{stats?.suspendedUsers || 0}</div>
                  <div className="text-gray-600">정지 사용자</div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-xl shadow-lg p-6 text-center"
                >
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-2xl font-bold">{stats?.todayBattles || 0}</div>
                  <div className="text-gray-600">오늘 배틀</div>
                </motion.div>
              </div>

              {/* 상위 캐릭터 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl shadow-xl p-8"
              >
                <h2 className="text-2xl font-bold mb-6">🏆 상위 캐릭터 TOP 10</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-purple-100 to-pink-100">
                      <tr>
                        <th className="px-4 py-3 text-left">순위</th>
                        <th className="px-4 py-3 text-left">캐릭터</th>
                        <th className="px-4 py-3 text-left">동물</th>
                        <th className="px-4 py-3 text-center">ELO</th>
                        <th className="px-4 py-3 text-center">승률</th>
                        <th className="px-4 py-3 text-center">전적</th>
                        <th className="px-4 py-3 text-left">소유자</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.topCharacters?.map((char, index) => (
                        <motion.tr
                          key={char.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b hover:bg-purple-50"
                        >
                          <td className="px-4 py-3">
                            {index === 0 && '🥇'}
                            {index === 1 && '🥈'}
                            {index === 2 && '🥉'}
                            {index > 2 && `${index + 1}`}
                          </td>
                          <td className="px-4 py-3 font-bold">{char.character_name}</td>
                          <td className="px-4 py-3">
                            <span className="mr-2">{char.emoji}</span>
                            {char.korean_name}
                          </td>
                          <td className="px-4 py-3 text-center font-bold">{char.elo_score}</td>
                          <td className="px-4 py-3 text-center">
                            {char.total_battles > 0 
                              ? Math.round((char.wins / char.total_battles) * 100) 
                              : 0}%
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-green-600">{char.wins}승</span>
                            {' / '}
                            <span className="text-red-600">{char.losses}패</span>
                          </td>
                          <td className="px-4 py-3">
                            {char.owner_email || '게스트'}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 플로팅 액션 버튼들 */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push('/leaderboard')}
          className="bg-purple-500 hover:bg-purple-600 text-white rounded-full p-4 shadow-lg"
        >
          🏆
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push('/play')}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg"
        >
          🎮
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push('/')}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg"
        >
          🏠
        </motion.button>
      </div>
    </main>
  );
}