"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Character, Battle } from "@/types";
import { modalVariants, overlayVariants, floatingAnimation } from "@/lib/animations";
import { Button } from "@/components/ui/button";

interface BattleResultProps {
  battle: Battle;
  attacker: Character;
  defender: Character;
  onClose: () => void;
}

export default function BattleResult({
  battle,
  attacker,
  defender,
  onClose,
}: BattleResultProps) {
  const [updatedAttacker, setUpdatedAttacker] = useState<Character>(attacker);
  const [updatedDefender, setUpdatedDefender] = useState<Character>(defender);

  useEffect(() => {
    // Fetch updated character data to show new ELO scores
    fetchUpdatedCharacters();
    
    // Scroll down if showing detailed analysis
    if (battle.attackerAnalysis && battle.defenderAnalysis) {
      setTimeout(() => {
        const detailAnalysis = document.getElementById('detail-analysis');
        if (detailAnalysis) {
          detailAnalysis.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 800);
    }
  }, [battle.id, battle.attackerAnalysis, battle.defenderAnalysis]);

  const fetchUpdatedCharacters = async () => {
    try {
      const [attackerRes, defenderRes] = await Promise.all([
        fetch(`/api/characters/${attacker.id}`),
        fetch(`/api/characters/${defender.id}`)
      ]);

      if (attackerRes.ok) {
        const data = await attackerRes.json();
        setUpdatedAttacker(data.data);
      }

      if (defenderRes.ok) {
        const data = await defenderRes.json();
        setUpdatedDefender(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch updated character data:", error);
    }
  };
  const winner = battle.winnerId === attacker.id ? updatedAttacker : updatedDefender;
  const loser = battle.winnerId === attacker.id ? updatedDefender : updatedAttacker;
  const isAttackerWinner = battle.winnerId === attacker.id;
  
  // Calculate ELO changes
  const attackerEloChange = updatedAttacker.eloScore - attacker.eloScore;
  const defenderEloChange = updatedDefender.eloScore - defender.eloScore;

  return (
    <motion.div
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 md:p-8 max-w-2xl w-full border-2 ${
          isAttackerWinner ? "border-blue-500 glow-blue" : "border-red-500 glow-red"
        } shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Victory Animation */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6 md:mb-8"
        >
          <motion.div
            animate={floatingAnimation}
            className="inline-block"
          >
            <motion.h2
              className={`text-3xl md:text-5xl font-bold mb-4 ${
                isAttackerWinner ? "gradient-text" : "text-red-400"
              }`}
              animate={{
                scale: [1, 1.1, 1],
                textShadow: isAttackerWinner ? [
                  "0 0 20px rgba(251, 191, 36, 0.5)",
                  "0 0 40px rgba(251, 191, 36, 0.8)",
                  "0 0 20px rgba(251, 191, 36, 0.5)"
                ] : [
                  "0 0 20px rgba(239, 68, 68, 0.5)",
                  "0 0 40px rgba(239, 68, 68, 0.8)",
                  "0 0 20px rgba(239, 68, 68, 0.5)"
                ]
              }}
              transition={{
                duration: 0.5,
                repeat: 3,
              }}
            >
              {isAttackerWinner ? "VICTORY!" : "DEFEAT..."}
            </motion.h2>
          </motion.div>
          <p className="text-xl md:text-2xl text-white">
            <span className={isAttackerWinner ? "text-blue-400" : "text-red-400"}>
              {winner.name}
            </span>{" "}
            wins the battle!
          </p>
        </motion.div>

        {/* Battle Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Winner */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`bg-gray-700/50 backdrop-blur rounded-lg p-4 border-2 transition-all ${
              isAttackerWinner ? "border-blue-500 glow-blue" : "border-red-500 glow-red"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg md:text-xl font-bold text-yellow-400">Winner</h3>
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 1, delay: 0.5 },
                  scale: { duration: 0.5, repeat: Infinity, repeatDelay: 1 }
                }}
                className="text-2xl"
              >
                🏆
              </motion.div>
            </div>
            <p className="text-base md:text-lg text-white font-semibold">{winner.name}</p>
            <p className="text-sm md:text-base text-gray-300">
              Score: <span className="font-bold text-yellow-400">
                {isAttackerWinner ? battle.attackerScore : battle.defenderScore}
              </span>
            </p>
            <motion.p 
              className="text-green-400 text-sm md:text-base"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
            >
              ELO: {winner.eloScore} 
              <motion.span 
                className="text-xs md:text-sm ml-1 font-bold"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
              >
                (+{Math.abs(isAttackerWinner ? attackerEloChange : defenderEloChange)})
              </motion.span>
            </motion.p>
          </motion.div>

          {/* Loser */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`bg-gray-700/50 backdrop-blur rounded-lg p-4 border-2 opacity-75 ${
              !isAttackerWinner ? "border-blue-500" : "border-red-500"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg md:text-xl font-bold text-gray-400">Defeated</h3>
              <motion.span 
                className="text-2xl"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  opacity: [1, 0.5, 0.5, 1]
                }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                💀
              </motion.span>
            </div>
            <p className="text-base md:text-lg text-white font-semibold">{loser.name}</p>
            <p className="text-sm md:text-base text-gray-300">
              Score: <span className="font-bold text-gray-400">
                {!isAttackerWinner ? battle.attackerScore : battle.defenderScore}
              </span>
            </p>
            <motion.p 
              className="text-red-400 text-sm md:text-base"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
            >
              ELO: {loser.eloScore}
              <motion.span 
                className="text-xs md:text-sm ml-1 font-bold"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
              >
                (-{Math.abs(isAttackerWinner ? defenderEloChange : attackerEloChange)})
              </motion.span>
            </motion.p>
          </motion.div>
        </div>

        {/* Simple Battle Summary - Always show */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-700/50 backdrop-blur rounded-lg p-4 mb-6 border border-gray-600"
        >
          <h3 className="text-base md:text-lg font-semibold text-gray-300 mb-3">⚔️ 전투 결과</h3>
          <p className="text-sm md:text-base text-gray-300">
            <span className={isAttackerWinner ? "text-blue-400 font-bold" : "text-red-400"}>
              {attacker.name}
            </span>
            {" vs "}
            <span className={!isAttackerWinner ? "text-blue-400 font-bold" : "text-red-400"}>
              {defender.name}
            </span>
          </p>
          <p className="text-sm md:text-base text-gray-300 mt-2">
            🏆 승자: <span className="text-yellow-400 font-bold">{winner.name}</span>
          </p>
          <p className="text-sm md:text-base text-gray-300 mt-1">
            🎯 승부 점수: <span className="text-white">{battle.attackerScore} vs {battle.defenderScore}</span>
          </p>
        </motion.div>

        {/* Detailed Score Analysis */}
        {battle.attackerAnalysis && battle.defenderAnalysis && (
          <motion.div
            id="detail-analysis"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur rounded-lg p-4 mb-6 border-2 border-purple-500/50 shadow-lg relative overflow-hidden"
          >
            <h3 className="text-base md:text-lg font-semibold text-gray-300 mb-3">
              🎉 특별 상세 분석
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Attacker Analysis */}
              <div className={`space-y-2 ${isAttackerWinner ? 'border-l-4 border-yellow-400 pl-3' : 'opacity-75'}`}>
                <h4 className="font-semibold text-white">{attacker.name}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">창의성:</span>
                    <span className="text-white">{battle.attackerAnalysis.creativity}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">임팩트:</span>
                    <span className="text-white">{battle.attackerAnalysis.impact}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">집중력:</span>
                    <span className="text-white">{battle.attackerAnalysis.focus}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">언어적 파워:</span>
                    <span className="text-white">{battle.attackerAnalysis.linguisticPower}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">전략성:</span>
                    <span className="text-white">{battle.attackerAnalysis.strategy}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">감정과 기세:</span>
                    <span className="text-white">{battle.attackerAnalysis.emotionMomentum}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">챗의 길이:</span>
                    <span className="text-white">{battle.attackerAnalysis.lengthScore}/10</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-600 pt-1 mt-1">
                    <span className="text-gray-300 font-semibold">종합 점수:</span>
                    <span className="text-yellow-400 font-bold">{battle.attackerAnalysis.totalScore}/10</span>
                  </div>
                </div>
              </div>
              
              {/* Defender Analysis */}
              <div className={`space-y-2 ${!isAttackerWinner ? 'border-l-4 border-yellow-400 pl-3' : 'opacity-75'}`}>
                <h4 className="font-semibold text-white">{defender.name}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">창의성:</span>
                    <span className="text-white">{battle.defenderAnalysis.creativity}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">임팩트:</span>
                    <span className="text-white">{battle.defenderAnalysis.impact}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">집중력:</span>
                    <span className="text-white">{battle.defenderAnalysis.focus}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">언어적 파워:</span>
                    <span className="text-white">{battle.defenderAnalysis.linguisticPower}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">전략성:</span>
                    <span className="text-white">{battle.defenderAnalysis.strategy}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">감정과 기세:</span>
                    <span className="text-white">{battle.defenderAnalysis.emotionMomentum}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">챗의 길이:</span>
                    <span className="text-white">{battle.defenderAnalysis.lengthScore}/10</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-600 pt-1 mt-1">
                    <span className="text-gray-300 font-semibold">종합 점수:</span>
                    <span className="text-yellow-400 font-bold">{battle.defenderAnalysis.totalScore}/10</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Battle Explanation */}
        {battle.explanation && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-purple-700/30 to-blue-700/30 backdrop-blur rounded-lg p-4 mb-6 border border-purple-500/50"
          >
            <h3 className="text-base md:text-lg font-semibold text-purple-300 mb-2 flex items-center">
              <span className="mr-2">💡</span> 승부의 이유
            </h3>
            <p className="text-sm md:text-base text-gray-200 mb-3">
              {battle.explanation}
            </p>
            {battle.tip && (
              <div className="mt-3 pt-3 border-t border-purple-500/30">
                <p className="text-sm md:text-base text-blue-300 italic">
                  <span className="font-semibold">팁:</span> {battle.tip}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Close Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <Button
            onClick={onClose}
            variant="default"
            size="lg"
            className="min-w-[200px]"
            glow
          >
            Continue
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}