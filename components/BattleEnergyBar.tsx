'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BattleEnergyBarProps {
  characterName: string;
  emoji: string;
  maxEnergy: number;
  currentEnergy: number;
  isAttacker: boolean;
  combatPower: number;
  showAnimation: boolean;
  animationDuration?: number;
}

export default function BattleEnergyBar({
  characterName,
  emoji,
  maxEnergy,
  currentEnergy,
  isAttacker,
  combatPower,
  showAnimation,
  animationDuration = 2
}: BattleEnergyBarProps) {
  const [displayEnergy, setDisplayEnergy] = useState(maxEnergy);
  
  useEffect(() => {
    if (showAnimation) {
      // 애니메이션 시작 시 전체 에너지로 리셋
      setDisplayEnergy(maxEnergy);
      
      // 약간의 지연 후 에너지 감소 애니메이션 시작
      const timer = setTimeout(() => {
        setDisplayEnergy(currentEnergy);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [showAnimation, currentEnergy, maxEnergy]);

  const energyPercentage = (displayEnergy / maxEnergy) * 100;
  
  // 에너지 바 색상 결정 (에너지가 낮을수록 빨간색)
  const getEnergyColor = () => {
    if (energyPercentage > 60) return 'from-green-400 to-green-600';
    if (energyPercentage > 30) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  return (
    <div className={`flex flex-col ${isAttacker ? 'items-start' : 'items-end'}`}>
      {/* 캐릭터 정보 */}
      <div className={`flex items-center gap-3 mb-2 ${!isAttacker && 'flex-row-reverse'}`}>
        <div className="text-4xl">{emoji}</div>
        <div className={`${!isAttacker && 'text-right'}`}>
          <h3 className="font-bold text-lg">{characterName}</h3>
          <p className="text-sm text-gray-600">전투력: {combatPower}</p>
        </div>
      </div>
      
      {/* 에너지 바 컨테이너 */}
      <div className="w-64 h-8 bg-gray-200 rounded-full p-1 relative overflow-hidden">
        {/* 에너지 바 배경 효과 */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-200 opacity-50" />
        
        {/* 실제 에너지 바 */}
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${getEnergyColor()} relative overflow-hidden`}
          initial={{ width: `${(maxEnergy / maxEnergy) * 100}%` }}
          animate={{ width: `${energyPercentage}%` }}
          transition={{
            duration: showAnimation ? animationDuration : 0,
            ease: "easeInOut"
          }}
        >
          {/* 에너지 바 반짝임 효과 */}
          <motion.div
            className="absolute inset-0 bg-white opacity-20"
            animate={{
              x: ['0%', '100%', '0%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>
        
        {/* 에너지 수치 표시 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700">
            {Math.round(displayEnergy)} / {maxEnergy}
          </span>
        </div>
      </div>
      
      {/* 에너지 퍼센티지 */}
      <div className="mt-1 text-sm text-gray-600">
        {Math.round(energyPercentage)}%
      </div>
    </div>
  );
}