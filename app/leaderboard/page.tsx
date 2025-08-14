"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Character } from "@/types";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import NavigationLayout from "@/components/NavigationLayout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { pageTransition, staggerContainer, staggerItem } from "@/lib/animations";
import { CharacterCardSkeleton } from "@/components/ui/skeleton";

export default function LeaderboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myCharacters, setMyCharacters] = useState<Character[]>([]);
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
    if (session?.user) {
      loadMyCharacters();
    }
  }, [session]);

  // Load active character from localStorage
  useEffect(() => {
    const savedActiveCharId = localStorage.getItem('activeCharacterId');
    if (savedActiveCharId && myCharacters.some(char => char.id === savedActiveCharId)) {
      setActiveCharacterId(savedActiveCharId);
    } else if (myCharacters.length > 0 && !activeCharacterId) {
      setActiveCharacterId(myCharacters[0].id);
    }
  }, [myCharacters]);

  const loadLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard?limit=50");
      if (!response.ok) throw new Error("Failed to load leaderboard");
      
      const data = await response.json();
      setCharacters(data.data || []);
    } catch (err) {
      setError("Failed to load leaderboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMyCharacters = async () => {
    try {
      const response = await fetch("/api/characters/my");
      if (response.ok) {
        const data = await response.json();
        setMyCharacters(data.characters || []);
      }
    } catch (err) {
      console.error("Failed to load my characters:", err);
    }
  };

  const handleCharacterSwitch = (characterId: string) => {
    setActiveCharacterId(characterId);
    localStorage.setItem('activeCharacterId', characterId);
    // Dispatch custom event for same-window updates
    window.dispatchEvent(new Event('activeCharacterChanged'));
  };

  const getActiveCharacter = () => {
    return myCharacters.find(char => char.id === activeCharacterId) || null;
  };

  const startBattle = (opponentId: string) => {
    const activeChar = getActiveCharacter();
    if (!activeChar) {
      alert("먼저 활성 캐릭터를 선택해주세요!");
      return;
    }
    
    // Navigate to the battle page
    router.push(`/battle/${activeChar.id}/${opponentId}`);
  };

  if (loading) {
    return (
      <NavigationLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8">
          <div className="container mx-auto px-4">
            <div className="space-y-4">
              <CharacterCardSkeleton />
              <CharacterCardSkeleton />
              <CharacterCardSkeleton />
            </div>
          </div>
        </div>
      </NavigationLayout>
    );
  }

  if (error) {
    return (
      <NavigationLayout>
        <motion.div 
          className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center"
          {...pageTransition}
          initial="initial"
          animate="animate"
        >
          <div className="bg-red-900/50 backdrop-blur border-2 border-red-500 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-300 mb-2">Error</h2>
            <p className="text-gray-300">{error}</p>
            <Button
              onClick={() => router.push("/mypage")}
              variant="destructive"
              className="mt-4"
            >
              내 페이지로 돌아가기
            </Button>
          </div>
        </motion.div>
      </NavigationLayout>
    );
  }

  return (
    <NavigationLayout>
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8"
        {...pageTransition}
        initial="initial"
        animate="animate"
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div className="mb-8" variants={staggerItem}>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold gradient-text">리더보드</h1>
                <Link href="/mypage">
                  <Button variant="secondary">
                    내 페이지로
                  </Button>
                </Link>
              </div>

              {/* Character Switcher */}
              {myCharacters.length > 0 && (
                <div className="bg-gray-800/50 backdrop-blur rounded-lg p-4 border-2 border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">활성 캐릭터 선택</h3>
                  <div className="flex flex-wrap gap-3">
                    {myCharacters.map((character) => (
                      <button
                        key={character.id}
                        onClick={() => handleCharacterSwitch(character.id)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          activeCharacterId === character.id
                            ? 'bg-blue-600 text-white border-2 border-blue-400'
                            : 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{character.name}</span>
                          <span className="text-sm opacity-75">
                            ({character.eloScore} ELO)
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {getActiveCharacter() && (
                    <p className="mt-3 text-sm text-gray-400">
                      전적: <span className="text-green-400">{getActiveCharacter()!.wins}승</span> - <span className="text-red-400">{getActiveCharacter()!.losses}패</span>
                    </p>
                  )}
                </div>
              )}

              {myCharacters.length === 0 && session && (
                <div className="bg-yellow-900/30 backdrop-blur rounded-lg p-4 border-2 border-yellow-600 mb-4">
                  <p className="text-yellow-300">
                    캐릭터가 없습니다. 
                    <Link href="/create-character" className="ml-2 underline hover:text-yellow-200">
                      캐릭터를 생성하세요!
                    </Link>
                  </p>
                </div>
              )}
            </motion.div>

            {/* Leaderboard Table */}
            {characters.length === 0 ? (
              <motion.div
                variants={staggerItem}
                className="bg-gray-800/50 backdrop-blur rounded-lg border-2 border-gray-700 p-8 text-center"
              >
                <p className="text-gray-400">아직 전투기록이 없습니다. 첫 번째 전사가 되어보세요!</p>
              </motion.div>
            ) : (
              <motion.div
                variants={staggerItem}
                className="bg-gray-800/50 backdrop-blur rounded-lg border-2 border-gray-700 overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900/50 border-b border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          순위
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          전사
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          ELO 점수
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          전적
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          승률
                        </th>
                        {getActiveCharacter() && (
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            액션
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {characters.map((character, index) => {
                        const totalGames = character.wins + character.losses;
                        const winRate = totalGames > 0 
                          ? ((character.wins / totalGames) * 100).toFixed(1)
                          : "0.0";
                        const isMyCharacter = myCharacters.some(myChar => myChar.id === character.id);
                        
                        return (
                          <motion.tr
                            key={character.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className={`hover:bg-gray-700/50 transition-colors ${
                              isMyCharacter ? 'bg-blue-900/20' : ''
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                                {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                                {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                                <span className="text-lg font-semibold text-white">
                                  #{index + 1}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="text-white font-medium">
                                  {character.name}
                                  {isMyCharacter && (
                                    <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                                      내 캐릭터
                                    </span>
                                  )}
                                </p>
                                {character.isNPC && (
                                  <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded">
                                    NPC
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-lg font-bold text-yellow-400">
                                {character.eloScore || 1000}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-green-400">{character.wins}승</span>
                              <span className="text-gray-500"> - </span>
                              <span className="text-red-400">{character.losses}패</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`font-medium ${
                                parseFloat(winRate) >= 50 ? "text-green-400" : "text-red-400"
                              }`}>
                                {winRate}%
                              </span>
                            </td>
                            {getActiveCharacter() && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                {character.id !== getActiveCharacter()?.id ? (
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startBattle(character.id);
                                    }}
                                    variant="destructive"
                                    size="sm"
                                  >
                                    배틀
                                  </Button>
                                ) : (
                                  <span className="text-gray-500 text-sm">활성 캐릭터</span>
                                )}
                              </td>
                            )}
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </NavigationLayout>
  );
}