"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHelpCircle, FiX, FiSearch } from 'react-icons/fi';

interface HelpContent {
  id: string;
  title: string;
  content: string;
  emoji?: string;
}

interface HelpButtonProps {
  page: string;
  section?: string;
  customHelp?: HelpContent[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export default function HelpButton({ 
  page, 
  section, 
  customHelp = [],
  position = 'top-right' 
}: HelpButtonProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [helpContents, setHelpContents] = useState<HelpContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (showHelp && helpContents.length === 0) {
      fetchHelpContents();
    }
  }, [showHelp, page]);

  const fetchHelpContents = async () => {
    if (customHelp.length > 0) {
      setHelpContents(customHelp);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (section) params.append('section', section);

      const response = await fetch(`/api/help?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setHelpContents(data.data.contents || []);
      }
    } catch (error) {
      console.error('도움말 로드 오류:', error);
      // 오류 시 기본 도움말 표시
      setHelpContents(getDefaultHelp(page));
    } finally {
      setLoading(false);
    }
  };

  const filteredContents = helpContents.filter(content =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  const modalPositionClasses = {
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4',
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4'
  };

  return (
    <>
      {/* 도움말 버튼 */}
      <motion.button
        onClick={() => setShowHelp(!showHelp)}
        className={`fixed ${positionClasses[position]} bg-yellow-400 p-3 rounded-full shadow-lg hover:scale-110 transition z-50`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <FiHelpCircle className="text-2xl text-gray-800" />
      </motion.button>

      {/* 도움말 모달 */}
      <AnimatePresence>
        {showHelp && (
          <>
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setShowHelp(false)}
            />

            {/* 도움말 내용 */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={`fixed ${modalPositionClasses[position]} bg-white rounded-2xl shadow-2xl max-w-md w-96 max-h-[80vh] overflow-hidden z-50`}
            >
              {/* 헤더 */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold flex items-center">
                    <span className="text-2xl mr-2">🦉</span>
                    도움말
                  </h3>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>
                
                {/* 검색 바 */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-70" />
                  <input
                    type="text"
                    placeholder="도움말 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-white bg-opacity-20 placeholder-white placeholder-opacity-70 text-white focus:outline-none focus:bg-opacity-30 transition"
                  />
                </div>
              </div>

              {/* 내용 */}
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {loading ? (
                  <div className="text-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="inline-block text-4xl"
                    >
                      ⏳
                    </motion.div>
                    <p className="mt-2 text-gray-600">도움말을 불러오는 중...</p>
                  </div>
                ) : filteredContents.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl">🔍</span>
                    <p className="mt-2 text-gray-600">
                      {searchTerm ? '검색 결과가 없어요!' : '도움말이 없어요!'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredContents.map((content, index) => (
                      <motion.div
                        key={content.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition"
                      >
                        <h4 className="font-bold text-lg mb-2 flex items-center">
                          {content.emoji && <span className="text-2xl mr-2">{content.emoji}</span>}
                          {content.title}
                        </h4>
                        <p className="text-gray-700 whitespace-pre-line">
                          {content.content}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* 푸터 */}
              <div className="border-t p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    💡 더 도움이 필요하면 부모님께 물어보세요!
                  </p>
                  <button
                    onClick={() => {
                      // TODO: 도움 요청 기능
                      alert('관리자에게 도움을 요청했어요! 곧 답변이 올 거예요 💌');
                    }}
                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition"
                  >
                    도움 요청
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// 기본 도움말 내용
function getDefaultHelp(page: string): HelpContent[] {
  const defaultHelp: Record<string, HelpContent[]> = {
    home: [
      {
        id: '1',
        title: 'Kid Text Battle에 오신 걸 환영해요!',
        content: '동물 친구들과 함께 재미있는 텍스트 배틀을 즐겨보세요!\n\n1. 회원가입을 해요\n2. 동물을 선택해요\n3. 친구와 배틀해요!',
        emoji: '🎮'
      },
      {
        id: '2',
        title: '안전한 게임 환경',
        content: '우리 게임은 아이들을 위해 만들어졌어요.\n\n• 나쁜 말은 자동으로 걸러져요\n• 개인정보는 안전하게 보호돼요\n• 부모님이 확인할 수 있어요',
        emoji: '🛡️'
      }
    ],
    battle: [
      {
        id: '1',
        title: '배틀 방법',
        content: '1. 동물을 선택해요\n2. 상대를 고르세요\n3. 200자 이내로 멋진 이야기를 써요\n4. 배틀 시작!',
        emoji: '⚔️'
      },
      {
        id: '2',
        title: '승리 비결',
        content: '• 길고 창의적인 텍스트를 써요\n• 동물의 특성을 활용해요\n• 다양한 단어를 사용해요\n• 재미있는 이야기를 만들어요',
        emoji: '🏆'
      }
    ],
    animals: [
      {
        id: '1',
        title: '동물 친구들',
        content: '4가지 종류의 동물이 있어요:\n\n🦁 현존 동물 - 실제 동물들\n🐉 신화 동물 - 전설의 동물들\n🦖 선사시대 - 공룡과 고대 동물\n🎨 커스텀 - 직접 만든 동물',
        emoji: '🌈'
      }
    ],
    // 다른 페이지들의 기본 도움말...
  };

  return defaultHelp[page] || [
    {
      id: 'default',
      title: '도움말',
      content: '이 페이지의 도움말을 준비 중이에요!\n곧 업데이트될 예정이니 조금만 기다려주세요 😊',
      emoji: '📚'
    }
  ];
}