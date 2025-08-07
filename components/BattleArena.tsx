"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Character, Battle } from "@/types";
import HealthBar from "./HealthBar";
import { battleCharacterVariants, glowAnimation, floatingAnimation } from "@/lib/animations";

interface BattleArenaProps {
  attacker: Character;
  defender: Character;
  battle: Battle | null;
  isBattling: boolean;
  onStartBattle: () => void;
}

export default function BattleArena({
  attacker,
  defender,
  battle,
  isBattling,
  onStartBattle,
}: BattleArenaProps) {
  const attackerHealth = battle
    ? (battle.winnerId === attacker.id ? 100 : 30)
    : 100;
  const defenderHealth = battle
    ? (battle.winnerId === defender.id ? 100 : 30)
    : 100;
    
  const attackerWon = battle && battle.winnerId === attacker.id;
  const defenderWon = battle && battle.winnerId === defender.id;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Attacker */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, type: "spring", damping: 20 }}
          className="order-2 md:order-1"
        >
          <motion.div 
            className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border-2 transition-all duration-300 ${
              attackerWon ? 'border-green-500 glow-green' : battle && !attackerWon ? 'border-red-500' : 'border-blue-500 glow-blue'
            }`}
            animate={attackerWon ? "victory" : battle && !attackerWon ? "defeat" : ""}
            variants={battleCharacterVariants}
          >
            <h2 className="text-2xl font-bold gradient-text mb-2">
              {attacker.name}
            </h2>
            <p className="text-gray-300 mb-4">ELO: {attacker.eloScore}</p>
            <HealthBar health={attackerHealth} isAnimated={isBattling} />
            <motion.div 
              className="mt-4 p-3 bg-gray-700/50 backdrop-blur rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm text-gray-300 italic">
                "{attacker.battleChat}"
              </p>
            </motion.div>
            {battle && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="mt-4 text-center"
              >
                <motion.p 
                  className={`text-3xl font-bold ${attackerWon ? 'text-green-400' : 'text-red-400'}`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  {battle.attackerScore}
                </motion.p>
                <p className="text-sm text-gray-400">Battle Score</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* VS / Battle Button */}
        <div className="order-1 md:order-2 text-center">
          <AnimatePresence mode="wait">
            {!isBattling && !battle ? (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <motion.button
                  onClick={onStartBattle}
                  className="px-8 py-4 btn-secondary text-xl glow-red"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={glowAnimation.animate}
                >
                  Start Battle!
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="vs"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="text-6xl font-bold text-red-500"
              >
                <motion.span
                  animate={{
                    scale: isBattling ? [1, 1.2, 1] : 1,
                    textShadow: isBattling ? [
                      "0 0 20px rgba(239, 68, 68, 0.8)",
                      "0 0 40px rgba(239, 68, 68, 1)",
                      "0 0 20px rgba(239, 68, 68, 0.8)"
                    ] : "0 0 20px rgba(239, 68, 68, 0.5)"
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: isBattling ? Infinity : 0,
                  }}
                  className="drop-shadow-2xl"
                >
                  VS
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          {isBattling && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4"
            >
              <div className="flex justify-center space-x-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-red-500 rounded-full"
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
              <p className="text-white mt-2">Battling...</p>
            </motion.div>
          )}
        </div>

        {/* Defender */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, type: "spring", damping: 20 }}
          className="order-3"
        >
          <motion.div 
            className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border-2 transition-all duration-300 ${
              defenderWon ? 'border-green-500 glow-green' : battle && !defenderWon ? 'border-red-500' : 'border-red-500 glow-red'
            }`}
            animate={defenderWon ? "victory" : battle && !defenderWon ? "defeat" : ""}
            variants={battleCharacterVariants}
          >
            <h2 className="text-2xl font-bold gradient-text mb-2">
              {defender.name}
            </h2>
            <p className="text-gray-300 mb-4">ELO: {defender.eloScore}</p>
            <HealthBar health={defenderHealth} isAnimated={isBattling} color="red" />
            <motion.div 
              className="mt-4 p-3 bg-gray-700/50 backdrop-blur rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm text-gray-300 italic">
                "{defender.battleChat}"
              </p>
            </motion.div>
            {battle && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="mt-4 text-center"
              >
                <motion.p 
                  className={`text-3xl font-bold ${defenderWon ? 'text-green-400' : 'text-red-400'}`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  {battle.defenderScore}
                </motion.p>
                <p className="text-sm text-gray-400">Battle Score</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Battle Effects */}
      <AnimatePresence>
        {isBattling && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gradient-to-br from-red-900/30 to-purple-900/30 pointer-events-none"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="fixed inset-0 pointer-events-none flex items-center justify-center"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-32 h-32 border-4 border-red-500 border-t-transparent rounded-full"
                />
                <motion.div
                  animate={{
                    rotate: -360,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-2 w-24 h-24 border-4 border-blue-500 border-b-transparent rounded-full"
                />
              </div>
            </motion.div>
            
            {/* Impact flashes */}
            <motion.div
              className="fixed inset-0 pointer-events-none"
              animate={{
                backgroundColor: [
                  "rgba(255, 255, 255, 0)",
                  "rgba(255, 255, 255, 0.1)",
                  "rgba(255, 255, 255, 0)"
                ]
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                repeatDelay: 1.5
              }}
            />
          </>
        )}
      </AnimatePresence>
      
      {/* Victory/Defeat Effects */}
      <AnimatePresence>
        {battle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
              className={`text-6xl font-bold ${battle.winnerId === attacker.id ? 'text-blue-500' : 'text-red-500'} drop-shadow-2xl`}
            >
              {battle.winnerId === attacker.id ? 'ATTACKER WINS!' : 'DEFENDER WINS!'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}