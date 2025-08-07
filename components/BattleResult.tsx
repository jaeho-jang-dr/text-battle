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
  }, [battle.id]);

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
              className="text-3xl md:text-5xl font-bold gradient-text mb-4"
              animate={{
                scale: [1, 1.1, 1],
                textShadow: [
                  "0 0 20px rgba(251, 191, 36, 0.5)",
                  "0 0 40px rgba(251, 191, 36, 0.8)",
                  "0 0 20px rgba(251, 191, 36, 0.5)"
                ]
              }}
              transition={{
                duration: 0.5,
                repeat: 3,
              }}
            >
              VICTORY!
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

        {/* Battle Log */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-700/50 backdrop-blur rounded-lg p-4 mb-6 border border-gray-600"
        >
          <h3 className="text-base md:text-lg font-semibold text-gray-300 mb-2">Battle Summary</h3>
          <p className="text-sm md:text-base text-gray-400 italic">{battle.battleLog}</p>
        </motion.div>

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