'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { User, Character, Animal } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import BattleOpponents from '@/components/BattleOpponents';

interface BattleMode {
  isActive: boolean;
  selectedCharacter: Character | null;
  opponents: Character[];
  selectedOpponent: Character | null;
  battleResult: any | null;
  isBattling: boolean;
}

export default function PlayPage() {
  const searchParams = useSearchParams();
  const isGuest = searchParams.get('guest') === 'true';
  const [user, setUser] = useState<User | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [characterName, setCharacterName] = useState('');
  const [battleText, setBattleText] = useState('');
  const [error, setError] = useState('');
  const [battleMode, setBattleMode] = useState<BattleMode>({
    isActive: false,
    selectedCharacter: null,
    opponents: [],
    selectedOpponent: null,
    battleResult: null,
    isBattling: false
  });

  useEffect(() => {
    // 로그인 처리 및 데이터 로드
    initializeUser();
    loadAnimals();
  }, []);

  // 로그아웃 및 첫 화면으로 돌아가기
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const initializeUser = async () => {
    try {
      // 게스트 로그인
      if (isGuest) {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isGuest: true })
        });

        const data = await response.json();
        if (data.success) {
          setUser(data.data.user);
          localStorage.setItem('token', data.data.token);
        }
      } else {
        // 토큰 확인
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/';
          return;
        }

        const response = await fetch('/api/auth/verify', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success) {
          setUser(data.data.user);
          setCharacters(data.data.user.characters || []);
        } else {
          window.location.href = '/';
        }
      }
    } catch (error) {
      console.error('User initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnimals = async () => {
    try {
      const response = await fetch('/api/animals');
      const data = await response.json();
      if (data.success) {
        setAnimals(data.data);
      }
    } catch (error) {
      console.error('Failed to load animals:', error);
    }
  };

  const handleCreateCharacter = async () => {
    if (!selectedAnimal || !characterName || !battleText) {
      setError('모든 항목을 입력해주세요!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          animalId: selectedAnimal.id,
          characterName,
          battleText
        })
      });

      const data = await response.json();
      if (data.success) {
        setCharacters([...characters, data.data]);
        setShowCharacterCreation(false);
        setSelectedAnimal(null);
        setCharacterName('');
        setBattleText('');
        setError('');
      } else {
        setError(data.error || '캐릭터 생성에 실패했습니다');
      }
    } catch (error) {
      console.error('Character creation error:', error);
      setError('캐릭터 생성 중 오류가 발생했습니다');
    }
  };

  // 배틀 모드 시작
  const startBattleMode = async (character: Character) => {
    if (character.activeBattlesToday >= 10) {
      setError('오늘의 배틀 횟수를 모두 사용했어요!');
      return;
    }

    try {
      // 대전 가능한 상대 캐릭터 목록 불러오기
      const response = await fetch('/api/characters?excludeUserId=' + user?.id);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setBattleMode({
          isActive: true,
          selectedCharacter: character,
          opponents: data.data,
          selectedOpponent: null,
          battleResult: null,
          isBattling: false
        });
      } else {
        setError('대전할 상대를 찾을 수 없어요!');
      }
    } catch (error) {
      console.error('Failed to load opponents:', error);
      setError('상대 목록을 불러오는데 실패했어요');
    }
  };

  // 배틀 실행
  const executeBattle = async () => {
    if (!battleMode.selectedCharacter || !battleMode.selectedOpponent) return;

    setBattleMode(prev => ({ ...prev, isBattling: true }));
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/battles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          attackerId: battleMode.selectedCharacter.id,
          defenderId: battleMode.selectedOpponent.id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setBattleMode(prev => ({
          ...prev,
          battleResult: data.data,
          isBattling: false
        }));

        // 캐릭터 정보 업데이트
        const updatedCharacters = characters.map(char => {
          if (char.id === battleMode.selectedCharacter.id) {
            return {
              ...char,
              activeBattlesToday: char.activeBattlesToday + 1,
              wins: char.wins + (data.data.result.winner === 'attacker' ? 1 : 0),
              losses: char.losses + (data.data.result.winner === 'defender' ? 1 : 0),
              baseScore: char.baseScore + data.data.result.attackerScoreChange
            };
          }
          return char;
        });
        setCharacters(updatedCharacters);
      } else {
        setError(data.error || '배틀 중 오류가 발생했어요');
        setBattleMode(prev => ({ ...prev, isBattling: false }));
      }
    } catch (error) {
      console.error('Battle execution error:', error);
      setError('배틀 실행 중 오류가 발생했어요');
      setBattleMode(prev => ({ ...prev, isBattling: false }));
    }
  };

  // 배틀 모드 종료
  const exitBattleMode = () => {
    setBattleMode({
      isActive: false,
      selectedCharacter: null,
      opponents: [],
      selectedOpponent: null,
      battleResult: null,
      isBattling: false
    });
    setError('');
  };

  // 대기 중인 상대 선택 핸들러
  const handleSelectOpponentFromList = async (opponent: any) => {
    if (characters.length === 0) {
      alert('먼저 캐릭터를 만들어주세요!');
      setShowCharacterCreation(true);
      return;
    }

    // 사용 가능한 캐릭터 확인 (봇과의 배틀은 무제한)
    const availableCharacters = opponent.isBot 
      ? characters // 봇과의 배틀은 모든 캐릭터 사용 가능
      : characters.filter(char => char.activeBattlesToday < 10);
      
    if (availableCharacters.length === 0) {
      alert('모든 캐릭터가 오늘의 배틀을 모두 마쳤어요!\n🤖 대기 계정과는 무제한 배틀이 가능해요!');
      return;
    }

    // 캐릭터가 하나면 바로 선택, 여러 개면 선택 모달
    if (availableCharacters.length === 1) {
      setBattleMode({
        isActive: true,
        selectedCharacter: availableCharacters[0],
        opponents: [],
        selectedOpponent: opponent,
        battleResult: null,
        isBattling: false
      });
    } else {
      // 여러 캐릭터 중 선택하기 위한 상태 설정
      setBattleMode({
        isActive: false,
        selectedCharacter: null,
        opponents: availableCharacters,
        selectedOpponent: opponent,
        battleResult: null,
        isBattling: false
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-green-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <p className="text-xl">게임을 준비하고 있어요...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-100 to-green-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">
            🎮 동물 텍스트 배틀
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-lg font-medium">
                {user?.displayName || user?.email || '플레이어'}
              </p>
              <p className="text-sm text-gray-600">
                캐릭터: {characters.length}/3
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
              title="로그아웃 및 처음으로"
            >
              🏠 처음으로
            </button>
          </div>
        </header>

        {/* 캐릭터 목록 또는 생성 */}
        {!showCharacterCreation ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">내 캐릭터들 🦁</h2>
            
            {characters.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xl mb-4">아직 캐릭터가 없어요!</p>
                <button
                  onClick={() => setShowCharacterCreation(true)}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl text-lg"
                >
                  첫 캐릭터 만들기 ✨
                </button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {characters.map((character) => (
                    <div key={character.id} className="bg-gray-50 rounded-xl p-6">
                      <div className="text-center mb-4">
                        <div className="text-5xl mb-2">
                          {character.animal?.emoji || '🐾'}
                        </div>
                        <h3 className="text-xl font-bold">{character.characterName}</h3>
                        <p className="text-sm text-gray-600">
                          {character.animal?.koreanName}
                        </p>
                      </div>
                      <div className="text-sm space-y-1">
                        <p>📊 점수: {character.baseScore}</p>
                        <p>🏆 승리: {character.wins}</p>
                        <p>💔 패배: {character.losses}</p>
                        <p>⚔️ 오늘 배틀: {character.activeBattlesToday}/10</p>
                      </div>
                      <button 
                        onClick={() => startBattleMode(character)}
                        disabled={character.activeBattlesToday >= 10}
                        className={`w-full mt-4 font-bold py-2 px-4 rounded-lg ${
                          character.activeBattlesToday >= 10
                            ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {character.activeBattlesToday >= 10 ? '오늘은 충분히 싸웠어요!' : '배틀하기!'}
                      </button>
                    </div>
                  ))}
                </div>
                
                {characters.length < 3 && (
                  <button
                    onClick={() => setShowCharacterCreation(true)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl"
                  >
                    새 캐릭터 만들기 ➕
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">새 캐릭터 만들기 🎨</h2>
            
            {/* 동물 선택 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">1. 동물 선택하기</h3>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {animals.map((animal) => (
                  <button
                    key={animal.id}
                    onClick={() => setSelectedAnimal(animal)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedAnimal?.id === animal.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-4xl mb-1">{animal.emoji}</div>
                    <p className="text-xs">{animal.koreanName}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 캐릭터 이름 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">2. 캐릭터 이름 정하기</h3>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-blue-500"
                placeholder="멋진 이름을 지어주세요!"
                maxLength={20}
              />
              <p className="text-sm text-gray-500 mt-1">
                {characterName.length}/20자
              </p>
            </div>

            {/* 배틀 텍스트 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">3. 배틀 텍스트 작성하기</h3>
              <textarea
                value={battleText}
                onChange={(e) => setBattleText(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-blue-500"
                placeholder="강력한 배틀 텍스트를 써보세요! (100자 이내)"
                rows={4}
                maxLength={100}
              />
              <p className="text-sm text-gray-500 mt-1">
                {battleText.length}/100자
              </p>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* 버튼들 */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCharacterCreation(false);
                  setSelectedAnimal(null);
                  setCharacterName('');
                  setBattleText('');
                  setError('');
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg"
              >
                취소
              </button>
              <button
                onClick={handleCreateCharacter}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg"
              >
                캐릭터 만들기!
              </button>
            </div>
          </div>
        )}

        {/* 대기 중인 상대 리스트 */}
        {!showCharacterCreation && characters.length > 0 && (
          <BattleOpponents
            currentCharacter={characters[0]}
            onSelectOpponent={handleSelectOpponentFromList}
            onRefresh={() => {
              // 캐릭터 정보 새로고침
              initializeUser();
            }}
          />
        )}

        {/* 배틀 모드 UI */}
        {battleMode.isActive && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {!battleMode.battleResult ? (
                <>
                  <h2 className="text-3xl font-bold text-center mb-6">⚔️ 배틀 준비!</h2>
                  
                  {/* 선택된 캐릭터 표시 */}
                  <div className="flex justify-between items-center mb-8">
                    <div className="text-center">
                      <div className="text-6xl mb-2">{battleMode.selectedCharacter?.animal?.emoji || '🐾'}</div>
                      <h3 className="text-xl font-bold">{battleMode.selectedCharacter?.characterName}</h3>
                      <p className="text-sm text-gray-600">나의 캐릭터</p>
                    </div>
                    
                    <div className="text-4xl animate-pulse">VS</div>
                    
                    <div className="text-center">
                      {battleMode.selectedOpponent ? (
                        <>
                          <div className="text-6xl mb-2">{battleMode.selectedOpponent.animalIcon || '🐾'}</div>
                          <h3 className="text-xl font-bold">{battleMode.selectedOpponent.characterName}</h3>
                          <p className="text-sm text-gray-600">
                            상대 캐릭터
                            {battleMode.selectedOpponent.isBot && ' (🤖 대기 계정)'}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="text-6xl mb-2">❓</div>
                          <h3 className="text-xl font-bold">???</h3>
                          <p className="text-sm text-gray-600">상대를 선택하세요</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 상대 선택 */}
                  {!battleMode.selectedOpponent && (
                    <>
                      <h3 className="text-lg font-bold mb-4">상대를 선택하세요!</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        {battleMode.opponents.slice(0, 9).map((opponent) => (
                          <button
                            key={opponent.id}
                            onClick={() => setBattleMode(prev => ({ ...prev, selectedOpponent: opponent }))}
                            className="p-4 bg-gray-50 hover:bg-blue-50 rounded-xl border-2 border-gray-200 hover:border-blue-400 transition-all"
                          >
                            <div className="text-4xl mb-1">{opponent.animal?.emoji || '🐾'}</div>
                            <p className="font-bold">{opponent.characterName}</p>
                            <p className="text-xs text-gray-600">점수: {opponent.baseScore}</p>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* 배틀 시작 버튼 */}
                  {battleMode.selectedOpponent && (
                    <div className="text-center">
                      <button
                        onClick={executeBattle}
                        disabled={battleMode.isBattling}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-xl text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {battleMode.isBattling ? '배틀 중... ⚔️' : '배틀 시작! 🔥'}
                      </button>
                    </div>
                  )}

                  <button
                    onClick={exitBattleMode}
                    className="mt-6 w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded-lg"
                  >
                    취소
                  </button>
                </>
              ) : (
                <>
                  {/* 배틀 결과 */}
                  <h2 className="text-3xl font-bold text-center mb-6">
                    {battleMode.battleResult.result.winner === 'attacker' ? '🎉 승리!' : '😢 패배...'}
                  </h2>
                  
                  <div className="bg-blue-50 rounded-xl p-6 mb-6">
                    <p className="text-xl font-bold mb-2">{battleMode.battleResult.result.judgment}</p>
                    <p className="text-gray-700 mb-4">{battleMode.battleResult.result.reasoning}</p>
                    
                    {/* 점수 변화 */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">내 점수 변화</p>
                        <p className={`text-2xl font-bold ${
                          battleMode.battleResult.result.attackerScoreChange > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {battleMode.battleResult.result.attackerScoreChange > 0 ? '+' : ''}
                          {battleMode.battleResult.result.attackerScoreChange}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">상대 점수 변화</p>
                        <p className={`text-2xl font-bold ${
                          battleMode.battleResult.result.defenderScoreChange > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {battleMode.battleResult.result.defenderScoreChange > 0 ? '+' : ''}
                          {battleMode.battleResult.result.defenderScoreChange}
                        </p>
                      </div>
                    </div>

                    {/* 격려 메시지 */}
                    {battleMode.battleResult.result.encouragement && (
                      <p className="text-center text-lg font-medium text-purple-600">
                        {battleMode.battleResult.result.encouragement}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={exitBattleMode}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl text-lg"
                  >
                    확인
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* 캐릭터 선택 모달 (대기 중인 상대에서 선택했을 때) */}
        {battleMode.selectedOpponent && battleMode.opponents.length > 0 && !battleMode.isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full"
            >
              <h2 className="text-2xl font-bold text-center mb-6">
                어떤 캐릭터로 도전할까요? 🤔
              </h2>
              
              <div className="mb-4 text-center">
                <p className="text-lg">
                  상대: <span className="font-bold">{battleMode.selectedOpponent.characterName}</span>
                  ({battleMode.selectedOpponent.animalIcon} {battleMode.selectedOpponent.animalName})
                  {battleMode.selectedOpponent.isBot && (
                    <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      🤖 대기 계정
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  ELO: {battleMode.selectedOpponent.eloScore} | 승률: {battleMode.selectedOpponent.winRate}%
                </p>
              </div>

              <div className="grid gap-4 mb-6">
                {battleMode.opponents.map((character) => (
                  <motion.button
                    key={character.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setBattleMode(prev => ({
                        ...prev,
                        isActive: true,
                        selectedCharacter: character,
                        opponents: []
                      }));
                    }}
                    className="p-4 rounded-xl border-2 bg-white border-blue-400 hover:bg-blue-50 hover:border-blue-600 transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{character.animal?.emoji || '🐾'}</span>
                        <div>
                          <p className="font-bold">{character.characterName}</p>
                          <p className="text-sm text-gray-600">
                            {character.animal?.koreanName} | ELO: {character.eloScore}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          오늘 배틀: {character.activeBattlesToday}/10
                          {battleMode.selectedOpponent?.isBot && (
                            <span className="text-purple-600"> (무제한)</span>
                          )}
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
                onClick={() => {
                  setBattleMode({
                    isActive: false,
                    selectedCharacter: null,
                    opponents: [],
                    selectedOpponent: null,
                    battleResult: null,
                    isBattling: false
                  });
                }}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg"
              >
                취소
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* 에러 메시지 표시 */}
        {error && !battleMode.isActive && (
          <div className="fixed top-4 right-4 bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
            <p className="font-bold">앗!</p>
            <p>{error}</p>
          </div>
        )}

        {/* 도움말 */}
        <div className="bg-yellow-100 rounded-xl p-4">
          <h3 className="font-bold mb-2">💡 도움말</h3>
          <ul className="text-sm space-y-1">
            <li>• 캐릭터는 최대 3개까지 만들 수 있어요</li>
            <li>• 하루에 캐릭터당 10번까지 능동 배틀이 가능해요</li>
            <li>• 🤖 대기 계정과는 무제한으로 배틀할 수 있어요!</li>
            <li>• 배틀 텍스트는 신중하게 작성해주세요!</li>
            <li>• 부적절한 내용은 경고를 받을 수 있어요</li>
          </ul>
        </div>
      </div>
    </main>
  );
}