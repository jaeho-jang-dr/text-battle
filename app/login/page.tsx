"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 사용자 이름으로 로그인
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (userError || !user) {
        setError('친구를 찾을 수 없어요. 회원가입을 해주세요!');
        setLoading(false);
        return;
      }

      // 로그인 성공 - 세션 저장
      localStorage.setItem('kid-battle-user', JSON.stringify(user));
      router.push('/dashboard');
    } catch (err) {
      setError('로그인 중 문제가 발생했어요. 다시 시도해주세요!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* 도움말 버튼 */}
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="absolute top-4 right-4 bg-kid-yellow p-3 rounded-full shadow-lg hover:scale-110 transition"
      >
        <span className="text-2xl">❓</span>
      </button>

      {/* 도움말 풍선 */}
      {showHelp && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="help-bubble top-20 right-4 max-w-xs"
        >
          <p className="text-gray-800">
            🦉 여기서 로그인해요!<br/>
            처음이라면 회원가입을 먼저 해주세요!
          </p>
        </motion.div>
      )}

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

          {/* 사용자 이름 입력 */}
          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-700 mb-2">
              닉네임을 입력해주세요
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="예: 사자왕"
              className="input-primary w-full"
              maxLength={20}
              required
            />
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
            disabled={loading || !username}
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