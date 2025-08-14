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

interface BattleData {
  id: string;
  player1Id: string;
  player2Id: string;
  winnerId: string;
  player1EloChange: number;
  player2EloChange: number;
  createdAt: Date | string;
}

interface BattleWithOpponent extends BattleData {
  opponentName?: string;
  isVictory?: boolean;
  eloChange?: number;
}

export default function BattleHistoryPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [battles, setBattles] = useState<BattleWithOpponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);
  const [myCharacters, setMyCharacters] = useState<Character[]>([]);
  const [characterMap, setCharacterMap] = useState<Map<string, Character>>(new Map());

  useEffect(() => {
    if (session?.user) {
      loadMyCharacters();
    }
  }, [session]);

  useEffect(() => {
    const savedActiveCharId = localStorage.getItem('activeCharacterId');
    if (savedActiveCharId && myCharacters.some(char => char.id === savedActiveCharId)) {
      setActiveCharacterId(savedActiveCharId);
    } else if (myCharacters.length > 0 && !activeCharacterId) {
      setActiveCharacterId(myCharacters[0].id);
      localStorage.setItem('activeCharacterId', myCharacters[0].id);
    }
  }, [myCharacters]);

  useEffect(() => {
    if (activeCharacterId) {
      loadBattleHistory();
    }
  }, [activeCharacterId]);

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

  const loadBattleHistory = async () => {
    if (!activeCharacterId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/battles/history?characterId=${activeCharacterId}`);
      if (!response.ok) throw new Error("Failed to load battle history");
      
      const data = await response.json();
      const battlesData = data.data || [];
      
      // Load character data for all battles
      const characterIds = new Set<string>();
      battlesData.forEach((battle: any) => {
        characterIds.add(battle.player1Id);
        characterIds.add(battle.player2Id);
      });
      
      // Fetch character data
      const charMap = new Map<string, Character>();
      
      // Try to fetch all characters at once
      try {
        const charResponse = await fetch('/api/characters');
        if (charResponse.ok) {
          const charData = await charResponse.json();
          const allCharacters = charData.characters || [];
          
          // Create map from characters that are in our battles
          allCharacters.forEach((char: Character) => {
            if (characterIds.has(char.id)) {
              charMap.set(char.id, char);
            }
          });
        }
      } catch (err) {
        console.error('Failed to load characters:', err);
      }
      setCharacterMap(charMap);
      
      // Process battles with additional info
      const processedBattles = battlesData.map((battle: any) => {
        const isPlayer1 = battle.player1Id === activeCharacterId;
        const opponentId = isPlayer1 ? battle.player2Id : battle.player1Id;
        const opponent = charMap.get(opponentId);
        const isVictory = battle.winnerId === activeCharacterId;
        
        // Calculate ELO change
        const eloChange = isPlayer1 ? battle.player1EloChange : battle.player2EloChange;
        
        return {
          ...battle,
          opponentName: opponent?.name || "Unknown",
          isVictory,
          eloChange
        };
      });
      
      setBattles(processedBattles);
    } catch (err) {
      setError("Failed to load battle history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCharacterSwitch = (characterId: string) => {
    setActiveCharacterId(characterId);
    localStorage.setItem('activeCharacterId', characterId);
    window.dispatchEvent(new Event('activeCharacterChanged'));
  };

  const getActiveCharacter = () => {
    return myCharacters.find(char => char.id === activeCharacterId) || null;
  };

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  if (!session) {
    return (
      <NavigationLayout>
        <motion.div 
          className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center"
          {...pageTransition}
          initial="initial"
          animate="animate"
        >
          <div className="bg-gray-800/50 backdrop-blur border-2 border-gray-700 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-white mb-2">로그인 필요</h2>
            <p className="text-gray-300">전투 기록을 보려면 로그인이 필요합니다.</p>
            <Button
              onClick={() => router.push("/")}
              variant="default"
              className="mt-4"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </motion.div>
      </NavigationLayout>
    );
  }

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
                <h1 className="text-4xl font-bold gradient-text">전투 기록</h1>
                <div className="flex gap-4">
                  <Link href="/leaderboard">
                    <Button variant="secondary">
                      리더보드
                    </Button>
                  </Link>
                  <Link href="/mypage">
                    <Button variant="secondary">
                      내 페이지
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Character Switcher */}
              {myCharacters.length > 0 && (
                <div className="bg-gray-800/50 backdrop-blur rounded-lg p-4 border-2 border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">캐릭터 선택</h3>
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

              {myCharacters.length === 0 && (
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

            {/* Battle History List */}
            {battles.length === 0 ? (
              <motion.div
                variants={staggerItem}
                className="bg-gray-800/50 backdrop-blur rounded-lg border-2 border-gray-700 p-8 text-center"
              >
                <p className="text-gray-400">아직 전투 기록이 없습니다. 첫 전투를 시작해보세요!</p>
                <Link href="/leaderboard">
                  <Button variant="default" className="mt-4">
                    리더보드로 이동
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                variants={staggerItem}
                className="space-y-4"
              >
                {battles.map((battle, index) => (
                  <motion.div
                    key={battle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-gray-800/50 backdrop-blur rounded-lg border-2 p-6 ${
                      battle.isVictory ? 'border-green-600' : 'border-red-600'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`text-4xl ${battle.isVictory ? 'text-green-400' : 'text-red-400'}`}>
                          {battle.isVictory ? '✓' : '✗'}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            vs {battle.opponentName}
                          </h3>
                          <p className={`text-sm ${battle.isVictory ? 'text-green-400' : 'text-red-400'}`}>
                            {battle.isVictory ? '승리' : '패배'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-400">ELO 변화</p>
                          <p className={`text-xl font-bold ${
                            battle.eloChange && battle.eloChange > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {battle.eloChange && battle.eloChange > 0 ? '+' : ''}{battle.eloChange}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-400">전투 시간</p>
                          <p className="text-sm text-gray-300">
                            {formatDate(battle.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </NavigationLayout>
  );
}