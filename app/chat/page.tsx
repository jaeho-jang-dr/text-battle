"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import HelpButton from '@/components/HelpButton';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  created_at: string;
  is_filtered: boolean;
}

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 사용자 정보 확인
    const savedUser = localStorage.getItem('kid-battle-user');
    if (!savedUser) {
      router.push('/kid-login');
      return;
    }
    setUser(JSON.parse(savedUser));

    // 채팅 메시지 로드
    loadMessages();

    // 10초마다 새 메시지 확인
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    // 새 메시지가 있을 때 스크롤
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const response = await fetch('/api/chat/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.data.messages);
      }
    } catch (err) {
      console.error('메시지 로드 오류:', err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      // 메시지 필터링 확인
      const filterResponse = await fetch('/api/content/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          userId: user.id
        }),
      });

      const filterData = await filterResponse.json();

      if (filterData.warning?.suspended) {
        setError('계정이 정지되었어요. 부모님께 연락해주세요.');
        setNewMessage('');
        setLoading(false);
        return;
      }

      // 메시지 전송
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          message: filterData.filtered ? filterData.filteredContent : newMessage,
          is_filtered: filterData.filtered
        }),
      });

      if (response.ok) {
        setNewMessage('');
        loadMessages();
        
        if (filterData.warning) {
          setError(filterData.warning.message);
        }
      } else {
        const data = await response.json();
        setError(data.error || '메시지 전송에 실패했어요!');
      }
    } catch (err) {
      setError('메시지 전송 중 문제가 발생했어요!');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <main className="min-h-screen flex flex-col p-4 max-w-4xl mx-auto">
      <HelpButton 
        page="chat" 
        customHelp={[
          {
            id: '1',
            title: '💬 채팅 규칙',
            content: '1. 친구들에게 친절하게 대해요\n2. 나쁜 말은 하지 않아요\n3. 개인정보는 공유하지 않아요',
            emoji: '📜'
          },
          {
            id: '2',
            title: '⚠️ 경고 시스템',
            content: '나쁜 말을 하면 경고를 받아요.\n3번 경고받으면 게임을 할 수 없어요.',
            emoji: '🚨'
          }
        ]}
      />

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard">
          <button className="bg-kid-blue text-white p-3 rounded-full shadow-lg hover:scale-110 transition">
            <span className="text-2xl">←</span>
          </button>
        </Link>
        
        <h1 className="text-3xl font-bold text-kid-blue">채팅방 💬</h1>
        
        <div className="text-sm text-gray-600">
          온라인: {messages.filter((m, i, arr) => 
            arr.findIndex(msg => msg.username === m.username) === i
          ).length}명
        </div>
      </div>

      {/* 채팅 메시지 영역 */}
      <div className="flex-1 bg-white rounded-xl shadow-lg p-4 mb-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
        <AnimatePresence>
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              아직 메시지가 없어요. 첫 번째로 인사해보세요! 👋
            </div>
          ) : (
            messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`mb-3 ${msg.username === user?.username ? 'text-right' : 'text-left'}`}
              >
                <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.username === user?.username 
                    ? 'bg-kid-blue text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="font-bold text-sm mb-1">
                    {msg.username}
                  </div>
                  <div className={msg.is_filtered ? 'italic' : ''}>
                    {msg.message}
                  </div>
                  <div className={`text-xs mt-1 ${
                    msg.username === user?.username ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(msg.created_at)}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* 에러 메시지 */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center"
        >
          {error}
        </motion.div>
      )}

      {/* 메시지 입력 폼 */}
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요... (최대 200자)"
          className="flex-1 input-primary text-lg"
          maxLength={200}
          disabled={loading}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading || !newMessage.trim()}
          className="btn-primary px-6"
        >
          {loading ? '전송 중...' : '보내기 📤'}
        </motion.button>
      </form>

      {/* 채팅 규칙 안내 */}
      <div className="mt-4 p-3 bg-kid-yellow/30 rounded-lg text-sm text-gray-700">
        💡 채팅 메시지는 24시간 후에 자동으로 사라져요!
      </div>
    </main>
  );
}