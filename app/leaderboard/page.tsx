'use client';

import { useEffect, useState } from 'react';
import { User, Character } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface LeaderboardEntry {
  rank: number;
  id: string;
  characterName: string;
  animalName: string;
  animalIcon: string;
  animalCategory: string;
  playerName: string;
  isGuest: boolean;
  isBot?: boolean;
  baseScore: number;
  eloScore: number;
  wins: number;
  losses: number;
  totalBattles: number;
  winRate: number;
  createdAt: string;
}

interface BattleMode {
  isActive: boolean;
  myCharacter: Character | null;
  opponent: LeaderboardEntry | null;
  result: any | null;
  isBattling: boolean;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'elo'>('elo');
  const [user, setUser] = useState<User | null>(null);
  const [myCharacters, setMyCharacters] = useState<Character[]>([]);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<LeaderboardEntry | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [battleMode, setBattleMode] = useState<BattleMode>({
    isActive: false,
    myCharacter: null,
    opponent: null,
    result: null,
    isBattling: false
  });

  useEffect(() => {
    checkAuth();
    fetchLeaderboard();
  }, [category, sortBy]);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch('/api/auth/verify', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success) {
          setUser(data.data.user);
          setMyCharacters(data.data.user.characters || []);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      params.append('sortBy', sortBy);

      const response = await fetch(`/api/leaderboard?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setEntries(data.data.leaderboard || []);
      } else {
        console.error('API error:', data.error);
      }
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startBattle = (opponent: LeaderboardEntry) => {
    if (!user) {
      alert('배틀하려면 로그인이 필요해요!');
      window.location.href = '/';
      return;
    }

    if (myCharacters.length === 0) {
      alert('먼저 캐릭터를 만들어주세요!');
      window.location.href = '/play';
      return;
    }

    setSelectedOpponent(opponent);
    setShowCharacterSelect(true);
  };

  const selectCharacterForBattle = (character: Character) => {
    if (!selectedOpponent?.isBot && character.activeBattlesToday >= 10) {
      alert('이 캐릭터는 오늘 배틀을 모두 마쳤어요!\n🤖 대기 계정과는 무제한 배틀이 가능해요!');
      return;
    }

    setBattleMode({
      isActive: true,
      myCharacter: character,
      opponent: selectedOpponent,
      result: null,
      isBattling: false
    });
    setShowCharacterSelect(false);
  };

  const executeBattle = async () => {
    if (!battleMode.myCharacter || !battleMode.opponent) return;

    setBattleMode(prev => ({ ...prev, isBattling: true }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/battles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          attackerId: battleMode.myCharacter.id,
          defenderId: battleMode.opponent.id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setBattleMode(prev => ({
          ...prev,
          result: data.data,
          isBattling: false
        }));

        const updatedCharacters = myCharacters.map(char => {
          if (char.id === battleMode.myCharacter!.id) {
            return {
              ...char,
              activeBattlesToday: char.activeBattlesToday + 1,
              wins: char.wins + (data.data.result.winner === 'attacker' ? 1 : 0),
              losses: char.losses + (data.data.result.winner === 'defender' ? 1 : 0),
              baseScore: data.data.updatedStats.attacker.baseScore,
              eloScore: data.data.updatedStats.attacker.eloScore
            };
          }
          return char;
        });
        setMyCharacters(updatedCharacters);

        setTimeout(() => {
          fetchLeaderboard();
        }, 2000);
      } else {
        alert(data.error || '배틀 중 오류가 발생했어요');
        setBattleMode(prev => ({ ...prev, isBattling: false }));
      }
    } catch (error) {
      console.error('Battle error:', error);
      alert('배틀 실행 중 오류가 발생했어요');
      setBattleMode(prev => ({ ...prev, isBattling: false }));
    }
  };

  const closeBattleMode = () => {
    setBattleMode({
      isActive: false,
      myCharacter: null,
      opponent: null,
      result: null,
      isBattling: false
    });
    setSelectedOpponent(null);
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white';
      case 2: return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white';
      case 3: return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white';
      default: return 'bg-white';
    }
  };

  const isMyCharacter = (characterId: string) => {
    return myCharacters.some(char => char.id === characterId);
  };

  const categoryOptions = [
    { value: 'all', label: '🌍 전체', color: 'from-purple-500 to-pink-500' },
    { value: 'current', label: '🦁 현존', color: 'from-green-500 to-emerald-500' },
    { value: 'mythical', label: '🦄 전설', color: 'from-blue-500 to-indigo-500' },
    { value: 'prehistoric', label: '🦕 고생대', color: 'from-orange-500 to-red-500' }
  ];

  const sortOptions = [
    { value: 'elo', label: '🎯 실력 점수', description: 'ELO 랭킹' },
    { value: 'score', label: '📊 기본 점수', description: '활동 점수' }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 safe-bottom">
      {/* 모바일 헤더 */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg safe-top">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-3xl">🏆</span>
                <span>명예의 전당</span>
              </h1>
              <p className="text-purple-200 text-sm mt-1">최강의 동물 전사들</p>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg transition-all duration-200"
            >
              <span className="text-2xl">🏠</span>
            </button>
          </div>
        </div>
      </header>

      {/* 점수 설명 (컴팩트) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-3 bg-white/80 backdrop-blur-sm border-b"
      >
        <details className="cursor-pointer">
          <summary className="font-bold text-sm flex items-center gap-2">
            <span>📊</span>
            <span>점수 시스템 안내</span>
            <span className="text-xs text-gray-500 ml-auto">터치해서 보기</span>
          </summary>
          <div className="mt-3 space-y-3 animate-slide-down">
            <div className="mobile-card p-3">
              <h3 className="font-bold text-sm text-blue-600 mb-1">🎯 ELO 점수</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• 시작: 1500점</li>
                <li>• 강한 상대 승리 시 많은 점수</li>
                <li>• 실력 기반 매칭</li>
              </ul>
            </div>
            <div className="mobile-card p-3">
              <h3 className="font-bold text-sm text-green-600 mb-1">📈 기본 점수</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• 승리: +10점</li>
                <li>• 패배: -5점 (최소 0점)</li>
                <li>• 활동량 측정</li>
              </ul>
            </div>
          </div>
        </details>
      </motion.div>

      {/* 필터 버튼 */}
      <div className="px-4 py-3 bg-white shadow-sm">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between py-2 px-4 bg-gray-100 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">⚙️</span>
            <div className="text-left">
              <p className="font-bold text-sm">필터 & 정렬</p>
              <p className="text-xs text-gray-600">
                {categoryOptions.find(opt => opt.value === category)?.label} • {sortOptions.find(opt => opt.value === sortBy)?.label}
              </p>
            </div>
          </div>
          <motion.span
            animate={{ rotate: showFilters ? 180 : 0 }}
            className="text-gray-400"
          >
            ▼
          </motion.span>
        </button>

        {/* 필터 옵션 (슬라이드) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                {/* 카테고리 선택 */}
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-2">카테고리</p>
                  <div className="grid grid-cols-2 gap-2">
                    {categoryOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setCategory(option.value);
                          setShowFilters(false);
                        }}
                        className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                          category === option.value
                            ? `bg-gradient-to-r ${option.color} text-white`
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 정렬 선택 */}
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-2">정렬 기준</p>
                  <div className="space-y-2">
                    {sortOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value as 'score' | 'elo');
                          setShowFilters(false);
                        }}
                        className={`w-full py-3 px-4 rounded-lg text-left transition-all ${
                          sortBy === option.value
                            ? 'bg-purple-100 border-2 border-purple-500'
                            : 'bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        <p className="font-medium text-sm">{option.label}</p>
                        <p className="text-xs text-gray-600">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 리더보드 리스트 */}
      <div className="px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-6xl mb-4 inline-block"
            >
              ⏳
            </motion.div>
            <p className="text-lg text-gray-600">순위를 불러오는 중...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 mobile-card">
            <div className="text-6xl mb-4">🦥</div>
            <p className="text-lg font-bold text-gray-700">아직 순위가 없어요!</p>
            <p className="text-sm text-gray-500 mt-2">첫 번째 전사가 되어보세요!</p>
            <button
              onClick={() => window.location.href = '/play'}
              className="btn-primary mt-4"
            >
              게임 시작하기
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`mobile-card ${getRankStyle(entry.rank)} ${
                  entry.rank <= 3 ? 'shadow-lg' : ''
                } ${isMyCharacter(entry.id) ? 'ring-2 ring-purple-400' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* 순위 */}
                  <div className="flex-shrink-0 text-center">
                    {getRankEmoji(entry.rank) ? (
                      <div className="text-3xl">{getRankEmoji(entry.rank)}</div>
                    ) : (
                      <div className={`text-2xl font-bold ${entry.rank <= 3 ? '' : 'text-gray-600'}`}>
                        {entry.rank}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">위</p>
                  </div>

                  {/* 캐릭터 정보 */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{entry.animalIcon}</span>
                      <div>
                        <h3 className="font-bold text-base leading-tight">
                          {entry.characterName}
                          {isMyCharacter(entry.id) && (
                            <span className="ml-1 text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">
                              내 캐릭터
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {entry.animalName} • {entry.playerName || '익명의 전사'}
                          {entry.isBot && (
                            <span className="ml-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                              🤖 AI
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* 점수 정보 */}
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">{sortBy === 'elo' ? 'ELO' : '기본'}</p>
                        <p className="font-bold text-sm">
                          {sortBy === 'elo' ? entry.eloScore : entry.baseScore}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">승률</p>
                        <p className="font-bold text-sm">{entry.winRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">전적</p>
                        <p className="text-xs">
                          <span className="text-green-600 font-bold">{entry.wins}승</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-red-600 font-bold">{entry.losses}패</span>
                        </p>
                      </div>
                    </div>

                    {/* 배틀 버튼 */}
                    {!isMyCharacter(entry.id) && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startBattle(entry)}
                        className="w-full mt-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-md flex items-center justify-center gap-2"
                      >
                        <span>⚔️</span>
                        <span>도전하기</span>
                        {entry.isBot && <span className="text-xs">(무제한)</span>}
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* 하단 플로팅 버튼 */}
      <div className="fixed bottom-20 left-4 right-4 flex justify-center gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.href = '/play'}
          className="fab bg-gradient-to-r from-purple-500 to-pink-500 text-white"
        >
          <span className="text-2xl">🎮</span>
        </motion.button>
        {!user && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/'}
            className="fab bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
          >
            <span className="text-2xl">🔑</span>
          </motion.button>
        )}
      </div>

      {/* 캐릭터 선택 모달 (모바일 최적화) */}
      <AnimatePresence>
        {showCharacterSelect && selectedOpponent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
            onClick={() => setShowCharacterSelect(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-3xl shadow-2xl p-6 w-full max-w-lg safe-bottom"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
              
              <h2 className="text-xl font-bold text-center mb-4">
                캐릭터 선택 🤔
              </h2>
              
              <div className="mb-4 p-3 bg-gray-100 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedOpponent.animalIcon}</span>
                    <div>
                      <p className="font-bold">{selectedOpponent.characterName}</p>
                      <p className="text-xs text-gray-600">
                        ELO: {selectedOpponent.eloScore} • 승률: {selectedOpponent.winRate}%
                      </p>
                    </div>
                  </div>
                  {selectedOpponent.isBot && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      🤖 무제한
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar mb-4">
                {myCharacters.map((character) => (
                  <motion.button
                    key={character.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectCharacterForBattle(character)}
                    disabled={!selectedOpponent?.isBot && character.activeBattlesToday >= 10}
                    className={`w-full p-3 rounded-xl border-2 transition-all ${
                      !selectedOpponent?.isBot && character.activeBattlesToday >= 10
                        ? 'bg-gray-100 border-gray-300 opacity-50'
                        : 'bg-white border-blue-400 hover:bg-blue-50 active:bg-blue-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{character.animal?.emoji || '🐾'}</span>
                        <div className="text-left">
                          <p className="font-bold text-sm">{character.characterName}</p>
                          <p className="text-xs text-gray-600">
                            {character.animal?.koreanName} • ELO: {character.eloScore}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs">
                          오늘: {character.activeBattlesToday}/10
                        </p>
                        <p className="text-xs text-gray-600">
                          {character.wins}승 {character.losses}패
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={() => setShowCharacterSelect(false)}
                className="w-full btn-secondary"
              >
                취소
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 배틀 모달 (모바일 최적화) */}
      <AnimatePresence>
        {battleMode.isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md"
            >
              {!battleMode.result ? (
                <>
                  <h2 className="text-2xl font-bold text-center mb-6">⚔️ 배틀 준비!</h2>
                  
                  <div className="flex justify-around items-center mb-6">
                    <motion.div 
                      className="text-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="emoji-xl mb-2">{battleMode.myCharacter?.animal?.emoji || '🐾'}</div>
                      <h3 className="font-bold text-sm">{battleMode.myCharacter?.characterName}</h3>
                    </motion.div>
                    
                    <motion.div 
                      className="text-3xl"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      VS
                    </motion.div>
                    
                    <motion.div 
                      className="text-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      <div className="emoji-xl mb-2">{battleMode.opponent?.animalIcon || '🐾'}</div>
                      <h3 className="font-bold text-sm">{battleMode.opponent?.characterName}</h3>
                    </motion.div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={executeBattle}
                    disabled={battleMode.isBattling}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg disabled:opacity-50"
                  >
                    {battleMode.isBattling ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          ⚔️
                        </motion.span>
                        배틀 중...
                      </span>
                    ) : (
                      '배틀 시작! 🔥'
                    )}
                  </motion.button>

                  <button
                    onClick={closeBattleMode}
                    className="w-full mt-3 btn-secondary"
                  >
                    취소
                  </button>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center mb-6"
                  >
                    <div className="text-6xl mb-3">
                      {battleMode.result.result.winner === 'attacker' ? '🎉' : '😢'}
                    </div>
                    <h2 className="text-2xl font-bold">
                      {battleMode.result.result.winner === 'attacker' ? '승리!' : '패배...'}
                    </h2>
                  </motion.div>
                  
                  <div className="bg-blue-50 rounded-xl p-4 mb-4">
                    <p className="font-bold text-base mb-2">{battleMode.result.result.judgment}</p>
                    <p className="text-sm text-gray-700 mb-3">{battleMode.result.result.reasoning}</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center bg-white rounded-lg p-2">
                        <p className="text-xs text-gray-600">점수 변화</p>
                        <p className={`text-lg font-bold ${
                          battleMode.result.result.attackerScoreChange > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {battleMode.result.result.attackerScoreChange > 0 ? '+' : ''}
                          {battleMode.result.result.attackerScoreChange}
                        </p>
                      </div>
                      <div className="text-center bg-white rounded-lg p-2">
                        <p className="text-xs text-gray-600">ELO 변화</p>
                        <p className={`text-lg font-bold ${
                          battleMode.result.result.attackerEloChange > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {battleMode.result.result.attackerEloChange > 0 ? '+' : ''}
                          {battleMode.result.result.attackerEloChange}
                        </p>
                      </div>
                    </div>

                    {battleMode.result.result.encouragement && (
                      <p className="text-center text-sm font-medium text-purple-600 mt-3">
                        {battleMode.result.result.encouragement}
                      </p>
                    )}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={closeBattleMode}
                    className="w-full btn-primary"
                  >
                    확인
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}