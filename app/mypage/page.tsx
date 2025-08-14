'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import CharacterCard from '@/components/character/CharacterCard';
import { Character } from '@/types';
import NavigationLayout from '@/components/NavigationLayout';
import { motion } from 'framer-motion';
import { pageTransition, staggerContainer, staggerItem } from '@/lib/animations';
import { CharacterCardSkeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import BattleChatEditor from '@/components/BattleChatEditor';

export default function MyPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeCharacterId');
    }
    return null;
  });
  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  const [deletingCharId, setDeletingCharId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/');
      return;
    }

    fetchCharacters();
  }, [session, status, router]);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters/my');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setCharacters(data.characters || []);
      
      // Load active character from localStorage or set the first one
      const savedActiveCharId = localStorage.getItem('activeCharacterId');
      if (data.characters?.length > 0) {
        if (savedActiveCharId && data.characters.some(char => char.id === savedActiveCharId)) {
          setActiveCharacterId(savedActiveCharId);
        } else if (!activeCharacterId) {
          const firstCharId = data.characters[0].id;
          setActiveCharacterId(firstCharId);
          localStorage.setItem('activeCharacterId', firstCharId);
        }
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
      setError('Failed to load characters');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCharacter = async (characterId: string) => {
    if (!confirm('정말로 이 캐릭터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setDeletingCharId(characterId);
    try {
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      // Remove from local state
      setCharacters(prev => prev.filter(char => char.id !== characterId));
      
      // Reset active character if deleted
      if (activeCharacterId === characterId) {
        const remaining = characters.filter(char => char.id !== characterId);
        const newActiveId = remaining.length > 0 ? remaining[0].id : null;
        setActiveCharacterId(newActiveId);
        if (newActiveId) {
          localStorage.setItem('activeCharacterId', newActiveId);
        } else {
          localStorage.removeItem('activeCharacterId');
        }
      }
    } catch (error) {
      console.error('Error deleting character:', error);
      setError('Failed to delete character');
    } finally {
      setDeletingCharId(null);
    }
  };

  const handleUpdateCharacter = (updatedCharacter: Character) => {
    setCharacters(prev => 
      prev.map(char => char.id === updatedCharacter.id ? updatedCharacter : char)
    );
    setEditingCharId(null);
  };

  const handleSetActiveCharacter = async (characterId: string) => {
    setActiveCharacterId(characterId);
    localStorage.setItem('activeCharacterId', characterId);
    // Dispatch custom event for same-window updates
    window.dispatchEvent(new Event('activeCharacterChanged'));
  };

  if (status === 'loading' || isLoading) {
    return (
      <NavigationLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CharacterCardSkeleton />
              <CharacterCardSkeleton />
              <CharacterCardSkeleton />
            </div>
          </div>
        </div>
      </NavigationLayout>
    );
  }

  return (
    <NavigationLayout>
      <motion.main 
        className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8"
        {...pageTransition}
        initial="initial"
        animate="animate"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div 
              className="flex justify-between items-center mb-8"
              variants={staggerItem}
            >
              <h1 className="text-4xl font-bold gradient-text">내 페이지</h1>
              <div className="flex gap-4">
                <Button 
                  onClick={fetchCharacters}
                  variant="secondary"
                  disabled={isLoading}
                  size="sm"
                >
                  {isLoading ? '새로고침 중...' : '🔄 새로고침'}
                </Button>
                {characters.length < 3 && (
                  <Link href="/create-character">
                    <Button variant="primary" glow={true}>
                      새 캐릭터 생성
                    </Button>
                  </Link>
                )}
                <Link href="/leaderboard">
                  <Button variant="secondary">
                    리더보드로 이동
                  </Button>
                </Link>
              </div>
            </motion.div>

            {error && (
              <motion.div 
                className="bg-red-900/50 backdrop-blur border-2 border-red-500 rounded-lg p-4 mb-6"
                variants={staggerItem}
              >
                <p className="text-red-300">{error}</p>
              </motion.div>
            )}

            {/* Character Count */}
            <motion.div 
              className="mb-6 text-gray-300"
              variants={staggerItem}
            >
              <p>캐릭터 수: {characters.length} / 3</p>
            </motion.div>

            {/* Characters Grid */}
            {characters.length === 0 ? (
              <motion.div 
                className="bg-gray-800/50 backdrop-blur rounded-lg p-8 text-center"
                variants={staggerItem}
              >
                <p className="text-gray-400 mb-4">아직 생성된 캐릭터가 없습니다.</p>
                <Link href="/create-character">
                  <Button variant="primary" glow={true}>
                    첫 캐릭터 생성하기
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div 
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
              >
                {characters.map((character) => (
                  <motion.div
                    key={character.id}
                    variants={staggerItem}
                    className={`relative ${
                      activeCharacterId === character.id 
                        ? 'ring-2 ring-blue-500 rounded-lg' 
                        : ''
                    }`}
                  >
                    {/* Active Badge */}
                    {activeCharacterId === character.id && (
                      <div className="absolute -top-3 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                        활성 캐릭터
                      </div>
                    )}
                    
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border-2 border-gray-700 hover:border-gray-600 transition-colors">
                      <CharacterCard character={character} />
                      
                      {/* Character Actions */}
                      <div className="mt-4 space-y-2">
                        {editingCharId === character.id ? (
                          <div className="space-y-2">
                            <BattleChatEditor 
                              character={character}
                              onUpdate={handleUpdateCharacter}
                              onCancel={() => setEditingCharId(null)}
                              showCancel={true}
                            />
                          </div>
                        ) : (
                          <>
                            {activeCharacterId !== character.id && (
                              <Button
                                onClick={() => handleSetActiveCharacter(character.id)}
                                variant="primary"
                                className="w-full"
                                size="sm"
                              >
                                활성 캐릭터로 설정
                              </Button>
                            )}
                            <Button
                              onClick={() => setEditingCharId(character.id)}
                              variant="secondary"
                              className="w-full"
                              size="sm"
                            >
                              배틀 챗 수정
                            </Button>
                            <Button
                              onClick={() => handleDeleteCharacter(character.id)}
                              variant="destructive"
                              className="w-full"
                              size="sm"
                              disabled={deletingCharId === character.id}
                            >
                              {deletingCharId === character.id ? '삭제 중...' : '캐릭터 삭제'}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div 
              className="mt-8 bg-gray-800/50 backdrop-blur rounded-lg p-6"
              variants={staggerItem}
            >
              <h2 className="text-xl font-bold text-white mb-4">빠른 액션</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link href="/leaderboard">
                  <Button variant="primary" className="w-full" glow={true}>
                    배틀 시작하기
                  </Button>
                </Link>
                <Link href="/battle-history">
                  <Button variant="secondary" className="w-full">
                    배틀 기록 보기
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.main>
    </NavigationLayout>
  );
}