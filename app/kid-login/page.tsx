"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import HelpButton from '@/components/HelpButton';

const characterEmojis = [
  { emoji: '🦁', name: '사자' },
  { emoji: '🐧', name: '펭귄' },
  { emoji: '🦄', name: '유니콘' },
  { emoji: '🐬', name: '돌고래' },
  { emoji: '🦖', name: '공룡' },
  { emoji: '🐉', name: '용' },
  { emoji: '🐘', name: '코끼리' },
  { emoji: '🦅', name: '독수리' },
  { emoji: '🐼', name: '판다' },
  { emoji: '🦊', name: '여우' },
  { emoji: '🐢', name: '거북이' },
  { emoji: '🦋', name: '나비' }
];

export default function KidLoginPage() {
  const router = useRouter();
  const [parentEmail, setParentEmail] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCharacters, setShowCharacters] = useState(false);
  const [checkingAutoLogin, setCheckingAutoLogin] = useState(true);

  // 자동 로그인 체크
  useEffect(() => {
    const checkAutoLogin = async () => {
      const token = localStorage.getItem('kid-battle-auto-token');
      if (token) {
        try {
          const response = await fetch('/api/auth/auto-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            const data = await response.json();
            const user = data.data.user;
            localStorage.setItem('kid-battle-user', JSON.stringify(user));
            document.cookie = `kid-battle-session=${JSON.stringify({
              userId: user.id,
              role: user.role
            })}; path=/; max-age=86400`;
            router.push('/dashboard');
            return;
          }
        } catch (err) {
          console.error('자동 로그인 오류:', err);
        }
      }
      setCheckingAutoLogin(false);
    };

    checkAutoLogin();
  }, [router]);

  const handleCheckParentEmail = async () => {
    if (!parentEmail) {
      setError('부모님 이메일을 입력해주세요!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 부모 이메일로 등록된 아이들 캐릭터 조회
      const response = await fetch('/api/auth/kid-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parentEmail }),
      });

      const data = await response.json();

      if (response.ok && data.data.accounts.length > 0) {
        setShowCharacters(true);
      } else {
        setError('등록된 계정이 없어요. 먼저 회원가입을 해주세요!');
      }
    } catch (err) {
      setError('문제가 발생했어요. 다시 시도해주세요!');
    } finally {
      setLoading(false);
    }
  };

  const handleCharacterLogin = async () => {
    if (!selectedCharacter || !nickname) {
      setError('캐릭터와 닉네임을 선택해주세요!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/kid-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentEmail,
          avatar: selectedCharacter,
          username: nickname,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 로그인 성공
        const user = data.data.user;
        localStorage.setItem('kid-battle-user', JSON.stringify(user));
        
        // 세션 쿠키 설정
        document.cookie = `kid-battle-session=${JSON.stringify({
          userId: user.id,
          role: user.role
        })}; path=/; max-age=86400`;
        
        router.push('/dashboard');
      } else {
        setError(data.error || '로그인에 실패했어요!');
      }
    } catch (err) {
      setError('로그인 중 문제가 발생했어요!');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAutoLogin) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl mb-4"
        >
          🎮
        </motion.div>
        <p className="text-xl text-gray-700">로그인 확인 중...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-kid-blue/20 to-kid-purple/20">
      {/* 도움말 버튼 */}
      <HelpButton 
        page="kid-login" 
        customHelp={[
          {
            id: '1',
            title: '🧒 아이들을 위한 쉬운 로그인',
            content: '부모님 이메일을 입력하고, 내 캐릭터를 선택하면 돼요!\n\n비밀번호를 기억할 필요가 없어요!',
            emoji: '🎮'
          }
        ]}
      />

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
          <motion.h1 
            className="text-title mb-4"
            animate={{ 
              rotate: [0, -5, 5, -5, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            캐릭터로 로그인 🎭
          </motion.h1>
          <p className="text-xl text-gray-700">내 캐릭터를 선택해서 들어가요!</p>
        </div>

        {!showCharacters ? (
          // 부모 이메일 입력 단계
          <motion.div
            className="card-animal p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-6">
              <span className="text-8xl">👨‍👩‍👧‍👦</span>
            </div>

            <div className="mb-6">
              <label className="block text-lg font-bold text-gray-700 mb-2">
                부모님 이메일 주소
              </label>
              <input
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="부모님 이메일을 입력해주세요"
                className="input-primary w-full text-lg"
                required
              />
              <p className="text-sm text-gray-600 mt-2">
                💡 부모님이 회원가입할 때 사용한 이메일이에요
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center"
              >
                {error}
              </motion.div>
            )}

            <button
              onClick={handleCheckParentEmail}
              disabled={loading || !parentEmail}
              className="btn-primary w-full text-lg"
            >
              {loading ? '확인 중...' : '다음 단계로!'}
            </button>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                처음이신가요?{' '}
                <Link href="/signup" className="text-kid-blue font-bold hover:underline">
                  회원가입하기
                </Link>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                일반 로그인은{' '}
                <Link href="/login" className="text-kid-purple font-bold hover:underline">
                  여기
                </Link>
              </p>
            </div>
          </motion.div>
        ) : (
          // 캐릭터 선택 단계
          <motion.div
            className="card-animal p-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-2xl font-bold text-center mb-6">
              내 캐릭터를 선택해요! 🎨
            </h2>

            {/* 캐릭터 그리드 */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {characterEmojis.map((char) => (
                <motion.button
                  key={char.emoji}
                  onClick={() => setSelectedCharacter(char.emoji)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-4 rounded-xl transition ${
                    selectedCharacter === char.emoji
                      ? 'bg-kid-yellow shadow-lg ring-4 ring-kid-orange'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-4xl mb-1">{char.emoji}</div>
                  <div className="text-xs">{char.name}</div>
                </motion.button>
              ))}
            </div>

            {/* 닉네임 입력 */}
            <div className="mb-6">
              <label className="block text-lg font-bold text-gray-700 mb-2">
                내 닉네임
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="예: 용감한사자"
                className="input-primary w-full text-lg"
                maxLength={20}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center"
              >
                {error}
              </motion.div>
            )}

            {/* 선택된 캐릭터 미리보기 */}
            {selectedCharacter && nickname && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-kid-blue/20 rounded-lg text-center"
              >
                <div className="text-6xl mb-2">{selectedCharacter}</div>
                <p className="font-bold text-lg">{nickname}</p>
              </motion.div>
            )}

            <button
              onClick={handleCharacterLogin}
              disabled={loading || !selectedCharacter || !nickname}
              className="btn-primary w-full text-lg mb-4"
            >
              {loading ? '로그인 중...' : '게임 시작!'}
            </button>

            <button
              onClick={() => {
                setShowCharacters(false);
                setSelectedCharacter('');
                setNickname('');
                setError('');
              }}
              className="btn-secondary w-full"
            >
              뒤로 가기
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* 움직이는 캐릭터들 배경 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl opacity-10"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
          >
            {characterEmojis[i % characterEmojis.length].emoji}
          </motion.div>
        ))}
      </div>
    </main>
  );
}