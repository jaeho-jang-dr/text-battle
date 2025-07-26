"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import HelpButton from '@/components/HelpButton';

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<'username' | 'email'>('username');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // API를 통해 로그인 처리
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginMethod,
          username: loginMethod === 'username' ? username : undefined,
          email: loginMethod === 'email' ? email : undefined,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '로그인 중 문제가 발생했어요!');
        setLoading(false);
        return;
      }

      // 로그인 성공 - 세션 저장
      const user = data.data.user;
      localStorage.setItem('kid-battle-user', JSON.stringify(user));
      
      // 세션 쿠키 설정
      document.cookie = `kid-battle-session=${JSON.stringify({
        userId: user.id,
        role: user.role
      })}; path=/; max-age=86400`; // 24시간
      
      // 관리자는 관리자 페이지로, 일반 사용자는 대시보드로
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('로그인 중 문제가 발생했어요. 다시 시도해주세요!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* 도움말 버튼 */}
      <HelpButton page="login" />

      {/* 뒤로가기 버튼 */}
      <Link href="/" className="absolute top-4 left-4">
        <button className="bg-kid-blue text-white p-3 rounded-full shadow-lg hover:scale-110 transition">
          <span className="text-2xl">←</span>
        </button>
      </Link>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-full max-w-md"
      >
        {/* 타이틀 */}
        <div className="text-center mb-8">
          <h1 className="text-title mb-4">로그인 🎮</h1>
          <p className="text-xl text-gray-700">다시 만나서 반가워요!</p>
        </div>

        {/* 로그인 폼 */}
        <motion.form
          onSubmit={handleLogin}
          className="card-animal p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* 캐릭터 애니메이션 */}
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="text-center mb-6"
          >
            <span className="text-8xl">🦁</span>
          </motion.div>

          {/* 로그인 방법 선택 */}
          <div className="flex justify-center mb-6 space-x-4">
            <button
              type="button"
              onClick={() => setLoginMethod('username')}
              className={`px-4 py-2 rounded-lg transition ${
                loginMethod === 'username' 
                  ? 'bg-kid-blue text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              닉네임으로
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className={`px-4 py-2 rounded-lg transition ${
                loginMethod === 'email' 
                  ? 'bg-kid-blue text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              이메일로
            </button>
          </div>

          {/* 닉네임 또는 이메일 입력 */}
          {loginMethod === 'username' ? (
            <div className="mb-6">
              <label className="block text-lg font-bold text-gray-700 mb-2">
                닉네임을 입력해주세요
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="예: 용감한사자"
                className="input-primary w-full"
                maxLength={20}
                required
              />
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-lg font-bold text-gray-700 mb-2">
                이메일을 입력해주세요
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="input-primary w-full"
                required
              />
            </div>
          )}

          {/* 비밀번호 입력 */}
          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-700 mb-2">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="input-primary w-full pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-2xl"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center"
            >
              {error}
            </motion.div>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading || (!username && !email) || !password}
            className="btn-primary w-full mb-4"
          >
            {loading ? '로그인 중...' : '로그인하기'}
          </button>

          {/* 회원가입 링크 */}
          <div className="text-center">
            <p className="text-gray-600">
              처음이신가요?{' '}
              <Link href="/signup" className="text-kid-blue font-bold hover:underline">
                회원가입하기
              </Link>
            </p>
          </div>

          {/* 비밀번호 찾기 */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              비밀번호를 잊으셨나요?{' '}
              <button 
                type="button"
                onClick={() => alert('부모님께 도움을 요청하세요! 👨‍👩‍👧')}
                className="text-kid-purple font-bold hover:underline"
              >
                도움받기
              </button>
            </p>
          </div>
        </motion.form>
      </motion.div>

      {/* 움직이는 동물들 장식 */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-around p-4 pointer-events-none">
        {['🐧', '🐬', '🦄'].map((emoji, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}
            className="text-4xl"
          >
            {emoji}
          </motion.div>
        ))}
      </div>
    </main>
  );
}