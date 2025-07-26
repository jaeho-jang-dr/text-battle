"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { BattleState, initializeBattle, processTextAttack, processDefend, processSpecialAttack } from '@/lib/battle-engine';
import { animals } from '@/data/animals';

export default function BattlePage() {
  const router = useRouter();
  const { user, requireAuth } = useAuth();
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [attackText, setAttackText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState<number>(1);
  const [userAnimals, setUserAnimals] = useState<any[]>([]);

  useEffect(() => {
    requireAuth();
    loadUserAnimals();
  }, []);

  const loadUserAnimals = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_animals')
      .select('*, animals(*)')
      .eq('user_id', user.id);

    if (data) {
      setUserAnimals(data);
    }
  };

  const startBattle = () => {
    const playerAnimal = animals.find(a => a.id === selectedAnimalId) || animals[0];
    // AI 상대는 랜덤 동물
    const aiAnimal = animals[Math.floor(Math.random() * animals.length)];
    
    const newBattle = initializeBattle(playerAnimal, aiAnimal);
    setBattleState(newBattle);
  };

  const handlePlayerAction = (action: 'attack' | 'defend' | 'special') => {
    if (!battleState || battleState.isFinished || battleState.currentTurn !== 'player1') return;

    let newState: BattleState;

    switch (action) {
      case 'attack':
        if (!attackText.trim()) {
          alert('공격 텍스트를 입력해주세요!');
          return;
        }
        newState = processTextAttack(battleState, attackText, true);
        setAttackText('');
        break;
      case 'defend':
        newState = processDefend(battleState, true);
        break;
      case 'special':
        newState = processSpecialAttack(battleState, true);
        break;
      default:
        return;
    }

    setBattleState(newState);

    // AI 턴 자동 실행
    if (!newState.isFinished && newState.currentTurn === 'player2') {
      setTimeout(() => {
        handleAITurn(newState);
      }, 1500);
    }
  };

  const handleAITurn = (currentState: BattleState) => {
    const aiActions = ['attack', 'defend', 'special'];
    const action = aiActions[Math.floor(Math.random() * aiActions.length)];
    
    let newState: BattleState;

    switch (action) {
      case 'attack':
        const aiAttackTexts = [
          '강력한 공격!',
          '필살의 일격!',
          '전력을 다한 공격!',
          '빠른 연속 공격!',
          '회심의 일격!'
        ];
        const aiText = aiAttackTexts[Math.floor(Math.random() * aiAttackTexts.length)];
        newState = processTextAttack(currentState, aiText, false);
        break;
      case 'defend':
        newState = processDefend(currentState, false);
        break;
      case 'special':
        newState = processSpecialAttack(currentState, false);
        break;
      default:
        return;
    }

    setBattleState(newState);

    // 배틀 종료 시 결과 저장
    if (newState.isFinished) {
      saveBattleResult(newState);
    }
  };

  const saveBattleResult = async (finalState: BattleState) => {
    if (!user) return;

    try {
      // 배틀 기록 저장
      await supabase.from('battles').insert({
        player1_id: user.id,
        player2_id: user.id, // AI 상대는 같은 유저 ID 사용
        player1_animal_id: finalState.player1.animal.id,
        player2_animal_id: finalState.player2.animal.id,
        winner_id: finalState.winner === 'player1' ? user.id : null,
        battle_log: finalState.battleLog
      });

      // 사용자 동물 업데이트
      if (finalState.winner === 'player1') {
        const userAnimal = userAnimals.find(ua => ua.animal_id === selectedAnimalId);
        if (userAnimal) {
          await supabase
            .from('user_animals')
            .update({
              battles_won: userAnimal.battles_won + 1,
              experience: userAnimal.experience + 50
            })
            .eq('id', userAnimal.id);
        }
      }
    } catch (error) {
      console.error('Error saving battle result:', error);
    }
  };

  if (!battleState) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard" className="inline-block mb-8">
            <button className="bg-kid-blue text-white p-3 rounded-full shadow-lg hover:scale-110 transition">
              <span className="text-2xl">←</span>
            </button>
          </Link>

          <h1 className="text-title text-center mb-8">배틀 준비! ⚔️</h1>

          <div className="card-animal p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">동물 친구 선택</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {userAnimals.map((ua) => (
                <motion.button
                  key={ua.id}
                  onClick={() => setSelectedAnimalId(ua.animal_id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 rounded-lg transition ${
                    selectedAnimalId === ua.animal_id
                      ? 'bg-kid-blue text-white shadow-lg'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  <span className="text-4xl block mb-2">{ua.animals.emoji}</span>
                  <p className="font-bold">{ua.nickname || ua.animals.korean_name}</p>
                  <p className="text-sm">Lv.{ua.level}</p>
                </motion.button>
              ))}
            </div>

            <motion.button
              onClick={startBattle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary w-full"
            >
              배틀 시작!
            </motion.button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* 도움말 버튼 */}
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="absolute top-4 right-4 bg-kid-yellow p-3 rounded-full shadow-lg hover:scale-110 transition z-10"
      >
        <span className="text-2xl">❓</span>
      </button>

      {/* 도움말 풍선 */}
      {showHelp && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="help-bubble top-20 right-4 max-w-xs z-20"
        >
          <p className="text-gray-800">
            🦉 배틀 팁!<br/>
            • 200자까지 공격 텍스트를 쓸 수 있어요<br/>
            • '강한', '파워' 같은 단어를 쓰면 데미지가 올라가요<br/>
            • '필살'을 쓰면 크리티컬 확률이 높아져요!
          </p>
        </motion.div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* 배틀 필드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Player 1 */}
          <motion.div 
            className="card-animal text-center"
            animate={battleState.currentTurn === 'player1' ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <h3 className="text-xl font-bold text-kid-blue mb-2">나</h3>
            <motion.div
              animate={battleState.player1.isDefending ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.5, repeat: battleState.player1.isDefending ? Infinity : 0 }}
            >
              <span className="text-6xl block mb-2">{battleState.player1.animal.emoji}</span>
            </motion.div>
            <p className="font-bold mb-2">{battleState.player1.animal.koreanName}</p>
            
            {/* HP 바 */}
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>HP</span>
                <span>{battleState.player1.hp}/{battleState.player1.maxHp}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: `${(battleState.player1.hp / battleState.player1.maxHp) * 100}%` }}
                  className="bg-green-500 h-4 rounded-full"
                />
              </div>
            </div>
            
            {battleState.player1.isDefending && (
              <p className="text-sm text-blue-600">🛡️ 방어 중</p>
            )}
          </motion.div>

          {/* VS */}
          <div className="flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-6xl font-bold text-kid-orange"
            >
              VS
            </motion.div>
          </div>

          {/* Player 2 (AI) */}
          <motion.div 
            className="card-animal text-center"
            animate={battleState.currentTurn === 'player2' ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <h3 className="text-xl font-bold text-kid-red mb-2">상대</h3>
            <motion.div
              animate={battleState.player2.isDefending ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.5, repeat: battleState.player2.isDefending ? Infinity : 0 }}
            >
              <span className="text-6xl block mb-2">{battleState.player2.animal.emoji}</span>
            </motion.div>
            <p className="font-bold mb-2">{battleState.player2.animal.koreanName}</p>
            
            {/* HP 바 */}
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>HP</span>
                <span>{battleState.player2.hp}/{battleState.player2.maxHp}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: `${(battleState.player2.hp / battleState.player2.maxHp) * 100}%` }}
                  className="bg-green-500 h-4 rounded-full"
                />
              </div>
            </div>
            
            {battleState.player2.isDefending && (
              <p className="text-sm text-blue-600">🛡️ 방어 중</p>
            )}
          </motion.div>
        </div>

        {/* 배틀 로그 */}
        <div className="card-animal mb-6 h-48 overflow-y-auto">
          <h3 className="font-bold text-gray-800 mb-2 sticky top-0 bg-white">배틀 기록</h3>
          <AnimatePresence>
            {battleState.battleLog.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`mb-2 p-2 rounded ${
                  log.player === 'player1' ? 'bg-blue-50' : 'bg-red-50'
                }`}
              >
                <p className="text-sm">{log.message}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 액션 패널 */}
        {!battleState.isFinished && battleState.currentTurn === 'player1' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-animal p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">너의 차례!</h3>
            
            {/* 텍스트 입력 */}
            <div className="mb-4">
              <textarea
                value={attackText}
                onChange={(e) => setAttackText(e.target.value.slice(0, 200))}
                placeholder="공격 텍스트를 입력하세요! (최대 200자)"
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-kid-blue focus:outline-none resize-none"
                rows={3}
              />
              <p className="text-sm text-gray-600 text-right mt-1">
                {attackText.length}/200
              </p>
            </div>

            {/* 액션 버튼들 */}
            <div className="grid grid-cols-3 gap-4">
              <motion.button
                onClick={() => handlePlayerAction('attack')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
                disabled={!attackText.trim()}
              >
                공격! ⚔️
              </motion.button>
              <motion.button
                onClick={() => handlePlayerAction('defend')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary"
              >
                방어 🛡️
              </motion.button>
              <motion.button
                onClick={() => handlePlayerAction('special')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-kid-orange text-white px-6 py-3 rounded-full font-bold hover:brightness-110 transition"
              >
                필살기! 💥
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* 상대 턴 표시 */}
        {!battleState.isFinished && battleState.currentTurn === 'player2' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-animal p-6 text-center"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">상대의 차례...</h3>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span className="text-4xl">⏳</span>
            </motion.div>
          </motion.div>
        )}

        {/* 배틀 종료 */}
        {battleState.isFinished && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
            className="card-animal p-8 text-center"
          >
            <h2 className="text-3xl font-bold mb-4">
              {battleState.winner === 'player1' ? '승리! 🎉' : '패배... 😢'}
            </h2>
            <p className="text-xl text-gray-700 mb-6">
              {battleState.winner === 'player1' 
                ? `${battleState.player1.animal.koreanName}의 멋진 승리!`
                : `${battleState.player2.animal.koreanName}에게 패배했어요...`}
            </p>
            
            {battleState.winner === 'player1' && (
              <div className="bg-kid-yellow rounded-lg p-4 mb-6">
                <p className="text-lg font-bold">보상 획득!</p>
                <p>경험치 +50 ✨</p>
              </div>
            )}
            
            <div className="flex gap-4 justify-center">
              <motion.button
                onClick={() => setBattleState(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
              >
                다시 하기 🔄
              </motion.button>
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary"
                >
                  대시보드로 🏠
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}