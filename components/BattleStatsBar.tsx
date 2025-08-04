import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface BattleStatsBarProps {
  characterName: string;
  emoji: string;
  stats: {
    attack_power: number;
    strength: number;
    speed: number;
    energy: number;
  };
  isAttacker: boolean;
  showAnimation: boolean;
  animationDuration?: number;
  battleResult?: {
    winner: 'attacker' | 'defender';
    scoreDifference: number;
  };
}

export default function BattleStatsBar({
  characterName,
  emoji,
  stats,
  isAttacker,
  showAnimation,
  animationDuration = 3,
  battleResult
}: BattleStatsBarProps) {
  const [animatedStats, setAnimatedStats] = useState(stats);
  const totalStats = stats.attack_power + stats.strength + stats.speed + stats.energy;
  const [totalAnimated, setTotalAnimated] = useState(totalStats);

  // 디버깅 로그
  console.log('BattleStatsBar:', {
    characterName,
    showAnimation,
    battleResult,
    stats
  });

  useEffect(() => {
    if (showAnimation && battleResult) {
      // 승자는 능력치가 덜 감소, 패자는 더 많이 감소
      const isWinner = (isAttacker && battleResult.winner === 'attacker') || 
                      (!isAttacker && battleResult.winner === 'defender');
      
      const reductionFactor = isWinner ? 0.3 : 0.7;
      const randomVariance = 0.1;

      // 각 능력치를 애니메이션과 함께 감소
      const newStats = {
        attack_power: Math.max(10, Math.round(stats.attack_power * (1 - reductionFactor + Math.random() * randomVariance))),
        strength: Math.max(10, Math.round(stats.strength * (1 - reductionFactor + Math.random() * randomVariance))),
        speed: Math.max(10, Math.round(stats.speed * (1 - reductionFactor + Math.random() * randomVariance))),
        energy: Math.max(10, Math.round(stats.energy * (1 - reductionFactor + Math.random() * randomVariance)))
      };

      setTimeout(() => {
        setAnimatedStats(newStats);
        setTotalAnimated(newStats.attack_power + newStats.strength + newStats.speed + newStats.energy);
      }, 500);
    }
  }, [showAnimation, battleResult, stats, isAttacker]);

  const getStatColor = (statType: string) => {
    switch (statType) {
      case 'attack': return 'from-red-500 to-red-600';
      case 'strength': return 'from-orange-500 to-orange-600';
      case 'speed': return 'from-blue-500 to-blue-600';
      case 'energy': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl shadow-lg p-6 ${isAttacker ? 'border-blue-400' : 'border-red-400'} border-2`}
    >
      {/* 캐릭터 정보 */}
      <div className="text-center mb-4">
        <div className="text-5xl mb-2">{emoji}</div>
        <h3 className="text-xl font-bold">{characterName}</h3>
        <p className="text-sm text-gray-600">{isAttacker ? '공격자' : '방어자'}</p>
      </div>

      {/* 능력치 바들 */}
      <div className="space-y-3">
        {/* 공격력 */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">⚔️ 공격력</span>
            <span className="font-bold">{animatedStats.attack_power}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${getStatColor('attack')}`}
              initial={{ width: `${(stats.attack_power / 100) * 100}%` }}
              animate={{ width: `${(animatedStats.attack_power / 100) * 100}%` }}
              transition={{ duration: animationDuration, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* 힘 */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">💪 힘</span>
            <span className="font-bold">{animatedStats.strength}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${getStatColor('strength')}`}
              initial={{ width: `${(stats.strength / 100) * 100}%` }}
              animate={{ width: `${(animatedStats.strength / 100) * 100}%` }}
              transition={{ duration: animationDuration, ease: "easeOut", delay: 0.2 }}
            />
          </div>
        </div>

        {/* 속도 */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">🏃 속도</span>
            <span className="font-bold">{animatedStats.speed}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${getStatColor('speed')}`}
              initial={{ width: `${(stats.speed / 100) * 100}%` }}
              animate={{ width: `${(animatedStats.speed / 100) * 100}%` }}
              transition={{ duration: animationDuration, ease: "easeOut", delay: 0.4 }}
            />
          </div>
        </div>

        {/* 에너지 */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">⚡ 에너지</span>
            <span className="font-bold">{animatedStats.energy}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${getStatColor('energy')}`}
              initial={{ width: `${(stats.energy / 100) * 100}%` }}
              animate={{ width: `${(animatedStats.energy / 100) * 100}%` }}
              transition={{ duration: animationDuration, ease: "easeOut", delay: 0.6 }}
            />
          </div>
        </div>
      </div>

      {/* 총 능력치 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">총 전투력</span>
          <motion.span
            className="text-2xl font-bold"
            initial={{ scale: 1 }}
            animate={{ scale: showAnimation ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.5 }}
          >
            {totalAnimated}
          </motion.span>
        </div>
      </div>

      {/* 승리/패배 표시 */}
      {showAnimation && battleResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: animationDuration }}
          className={`mt-4 text-center p-3 rounded-lg ${
            (isAttacker && battleResult.winner === 'attacker') || (!isAttacker && battleResult.winner === 'defender')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          <span className="font-bold text-lg">
            {(isAttacker && battleResult.winner === 'attacker') || (!isAttacker && battleResult.winner === 'defender')
              ? '🏆 승리!'
              : '💔 패배'}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}