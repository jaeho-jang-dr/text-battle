"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const avatarEmojis = ['🦁', '🐧', '🦄', '🐬', '🦖', '🐉', '🐘', '🦅', '🐼', '🦊'];

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [avatar, setAvatar] = useState('🦁');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 나이 체크
      const userAge = parseInt(age);
      if (userAge < 7 || userAge > 15) {
        setError('7살부터 15살까지 참여할 수 있어요!');
        setLoading(false);
        return;
      }

        // 중복 체크
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .single();

        if (existingUser) {
          setError('이미 사용중인 닉네임이에요. 다른 닉네임을 선택해주세요!');
          setLoading(false);
          return;
        }

        // 사용자 생성
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([
            {
              username,
              age: userAge,
              avatar
            }
          ])
          .select()
          .single();

        if (createError) throw createError;

        // 첫 동물 친구 추가 (사자)
        await supabase
          .from('user_animals')
          .insert([
            {
              user_id: newUser.id,
              animal_id: 1, // 사자
              nickname: `${username}의 사자`,
              level: 1,
              experience: 0,
              battles_won: 0,
              battles_lost: 0
            }
          ]);

        // 로그인 처리
        localStorage.setItem('kid-battle-user', JSON.stringify(newUser));
        router.push('/welcome');
    } catch (err) {
      setError('회원가입 중 문제가 발생했어요. 다시 시도해주세요!');
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
            🦉 새로운 친구가 되어주세요!<br/>
            닉네임과 나이를 알려주고,<br/>
            좋아하는 아바타를 골라봐요!
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
          <h1 className="text-title mb-4">회원가입 🎉</h1>
          <p className="text-xl text-gray-700">동물 친구들과 함께해요!</p>
        </div>

        {/* 회원가입 폼 */}
        <motion.form
          onSubmit={handleSignup}
          className="card-animal p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* 사용자 이름 입력 */}
          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-700 mb-2">
              멋진 닉네임을 정해주세요
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

          {/* 나이 입력 */}
          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-700 mb-2">
              몇 살이에요?
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="예: 10"
              className="input-primary w-full"
              min="7"
              max="15"
              required
            />
          </div>

          {/* 아바타 선택 */}
          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-700 mb-2">
              좋아하는 동물을 골라주세요
            </label>
            <div className="grid grid-cols-5 gap-3">
              {avatarEmojis.map((emoji) => (
                <motion.button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-4 rounded-lg text-4xl transition ${
                    avatar === emoji
                      ? 'bg-kid-blue shadow-lg'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>

          {/* 선택된 아바타 미리보기 */}
          <div className="text-center mb-6">
            <motion.div
              key={avatar}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              className="inline-block"
            >
              <span className="text-8xl">{avatar}</span>
            </motion.div>
            <p className="text-gray-600 mt-2">내 아바타</p>
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

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            disabled={loading || !username || !age}
            className="btn-primary w-full mb-4"
          >
            {loading ? '가입 중...' : '시작하기'}
          </button>

          {/* 로그인 링크 */}
          <div className="text-center">
            <p className="text-gray-600">
              이미 계정이 있나요?{' '}
              <Link href="/login" className="text-kid-blue font-bold hover:underline">
                로그인하기
              </Link>
            </p>
          </div>
        </motion.form>
      </motion.div>
    </main>
  );
}