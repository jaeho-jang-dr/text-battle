"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import BattleResult from "@/components/BattleResult";
import { Character, Battle } from "@/types";
import { pageTransition } from "@/lib/animations";
import NavigationLayout from "@/components/NavigationLayout";
import { VictoryParticles, DefeatEffect } from "@/components/BattleEffects";

// Enhanced character type with battle stats
interface BattleCharacter extends Character {
  type: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  currentHp?: number;
}

// Generate battle stats based on character's ELO score
function generateBattleStats(character: Character): BattleCharacter {
  const baseStats = {
    hp: 100,
    attack: 20,
    defense: 15,
    speed: 10
  };
  
  // Scale stats based on ELO score
  const eloModifier = (character.eloScore - 1000) / 200;
  
  const stats = {
    hp: Math.round(baseStats.hp * (1 + eloModifier * 0.5)),
    attack: Math.round(baseStats.attack * (1 + eloModifier * 0.3)),
    defense: Math.round(baseStats.defense * (1 + eloModifier * 0.3)),
    speed: Math.round(baseStats.speed * (1 + eloModifier * 0.2))
  };
  
  // Determine character type based on stats distribution
  let type = "Balanced";
  if (stats.attack > stats.defense * 1.3) type = "Warrior";
  else if (stats.defense > stats.attack * 1.3) type = "Guardian";
  else if (stats.speed > (stats.attack + stats.defense) * 0.4) type = "Assassin";
  
  return {
    ...character,
    type,
    hp: stats.hp,
    maxHp: stats.hp,
    attack: stats.attack,
    defense: stats.defense,
    speed: stats.speed,
    currentHp: stats.hp
  };
}

export default function BattlePage() {
  const params = useParams();
  const router = useRouter();
  const [attacker, setAttacker] = useState<BattleCharacter | null>(null);
  const [defender, setDefender] = useState<BattleCharacter | null>(null);
  const [battle, setBattle] = useState<Battle | null>(null);
  const [isBattling, setIsBattling] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState<string>("");
  const [battlePhase, setBattlePhase] = useState<"idle" | "fighting" | "finished">("idle");
  const [attackerHit, setAttackerHit] = useState(false);
  const [defenderHit, setDefenderHit] = useState(false);

  const attackerId = params.attackerId as string;
  const defenderId = params.defenderId as string;

  const loadCharacters = useCallback(async () => {
    try {
      console.log("Loading characters:", { attackerId, defenderId });
      
      // Load attacker
      const attackerRes = await fetch(`/api/characters/${attackerId}`);
      const attackerData = await attackerRes.json();
      
      if (!attackerRes.ok) {
        console.error("Attacker load failed:", attackerData);
        throw new Error(attackerData.error || "Failed to load attacker");
      }
      
      console.log("Attacker loaded:", attackerData.data);
      const attackerWithStats = generateBattleStats(attackerData.data);
      setAttacker(attackerWithStats);

      // Load defender
      const defenderRes = await fetch(`/api/characters/${defenderId}`);
      const defenderData = await defenderRes.json();
      
      if (!defenderRes.ok) {
        console.error("Defender load failed:", defenderData);
        throw new Error(defenderData.error || "Failed to load defender");
      }
      
      console.log("Defender loaded:", defenderData.data);
      const defenderWithStats = generateBattleStats(defenderData.data);
      setDefender(defenderWithStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load characters";
      setError(errorMessage);
      console.error("Load characters error:", err);
    }
  }, [attackerId, defenderId]);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const startBattle = async () => {
    if (!attacker || !defender) return;

    setIsBattling(true);
    setBattlePhase("fighting");
    setError("");

    try {
      const response = await fetch("/api/battles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attackerId,
          defenderId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create battle");
      }

      setBattle(data.data);

      // Simulate battle with animations
      await simulateBattle(data.data);
      
      // Show result after battle animation
      setBattlePhase("finished");
      setTimeout(() => {
        setIsBattling(false);
        setShowResult(true);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Battle failed");
      setIsBattling(false);
      setBattlePhase("idle");
    }
  };

  const handleClose = () => {
    router.push("/mypage");
  };

  const simulateBattle = async (battleData: Battle) => {
    if (!attacker || !defender) return;
    
    const totalDamage = attacker.hp + defender.hp;
    const attackerDamageRatio = battleData.defenderScore / (battleData.attackerScore + battleData.defenderScore);
    const defenderDamageRatio = battleData.attackerScore / (battleData.attackerScore + battleData.defenderScore);
    
    const attackerFinalHp = Math.max(0, attacker.hp - Math.round(attacker.hp * attackerDamageRatio));
    const defenderFinalHp = Math.max(0, defender.hp - Math.round(defender.hp * defenderDamageRatio));
    
    // Simulate 5 attack exchanges
    for (let i = 0; i < 5; i++) {
      // Attacker attacks
      await new Promise(resolve => setTimeout(resolve, 400));
      setAttackerHit(true);
      setDefender(prev => {
        if (!prev) return prev;
        const damage = prev.hp / 5;
        return { ...prev, currentHp: Math.max(0, (prev.currentHp || prev.hp) - damage) };
      });
      await new Promise(resolve => setTimeout(resolve, 200));
      setAttackerHit(false);
      
      // Defender attacks
      await new Promise(resolve => setTimeout(resolve, 400));
      setDefenderHit(true);
      setAttacker(prev => {
        if (!prev) return prev;
        const damage = prev.hp / 5;
        return { ...prev, currentHp: Math.max(0, (prev.currentHp || prev.hp) - damage) };
      });
      await new Promise(resolve => setTimeout(resolve, 200));
      setDefenderHit(false);
    }
    
    // Set final HP based on battle result
    setAttacker(prev => prev ? { ...prev, currentHp: attackerFinalHp } : prev);
    setDefender(prev => prev ? { ...prev, currentHp: defenderFinalHp } : prev);
  };

  if (error) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800"
        {...pageTransition}
        initial="initial"
        animate="animate"
      >
        <motion.div 
          className="bg-red-900/50 backdrop-blur border-2 border-red-500 rounded-lg p-6 max-w-md glow-red"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <h2 className="text-xl font-bold text-red-300 mb-2">Error</h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => router.push("/mypage")}
            className="mt-4 w-full btn-secondary"
          >
            내 페이지로 돌아가기
          </button>
        </motion.div>
      </motion.div>
    );
  }

  if (!attacker || !defender) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading characters...</div>
      </div>
    );
  }

  return (
    <NavigationLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-8 relative overflow-hidden">
        {/* Battle Arena Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8"
          >
            ⚔️ Battle Arena ⚔️
          </motion.h1>

          {/* Battle Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-purple-500/20 shadow-2xl"
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Attacker Card */}
              <motion.div 
                className="bg-gray-700/80 backdrop-blur-sm rounded-lg p-4 relative overflow-hidden border border-blue-500/30 shadow-lg"
                animate={{
                  x: attackerHit ? [0, -10, 10, -5, 5, 0] : 0,
                  scale: battlePhase === "finished" && battle?.winnerId === attacker.id ? 1.05 : 1,
                }}
                transition={{
                  x: { duration: 0.5 },
                  scale: { duration: 0.5 }
                }}
              >
                {defenderHit && (
                  <motion.div
                    className="absolute inset-0 bg-red-500/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <h3 className="text-lg font-bold text-blue-400 mb-2">Attacker</h3>
                <h4 className="text-xl font-bold text-white mb-2">{attacker.name}</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">Type: {attacker.type}</p>
                  <p className="text-gray-300">Attack: {attacker.attack}</p>
                  <p className="text-gray-300">Defense: {attacker.defense}</p>
                  <p className="text-gray-300">Speed: {attacker.speed}</p>
                </div>
                
                {/* Health Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">HP</span>
                    <span className="text-gray-300">{Math.round(attacker.currentHp || attacker.hp)}/{attacker.maxHp}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600"
                      initial={{ width: "100%" }}
                      animate={{ 
                        width: `${((attacker.currentHp || attacker.hp) / attacker.maxHp) * 100}%`,
                        backgroundColor: (attacker.currentHp || attacker.hp) / attacker.maxHp < 0.3 ? "#ef4444" : 
                                       (attacker.currentHp || attacker.hp) / attacker.maxHp < 0.6 ? "#f59e0b" : "#10b981"
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
                
                {attacker.battleChat && (
                  <motion.div 
                    className="mt-3 p-3 bg-gray-800 rounded border border-blue-500/30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-sm text-blue-200 italic">&ldquo;{attacker.battleChat}&rdquo;</p>
                  </motion.div>
                )}
                
                {battlePhase === "finished" && battle?.winnerId === attacker.id && (
                  <>
                    <VictoryParticles count={15} />
                    <motion.div
                      className="absolute top-2 right-2"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", damping: 10 }}
                    >
                      <span className="text-3xl">👑</span>
                    </motion.div>
                  </>
                )}
                {battlePhase === "finished" && battle?.winnerId !== attacker.id && (
                  <DefeatEffect show={true} />
                )}
              </motion.div>

              {/* Defender Card */}
              <motion.div 
                className="bg-gray-700/80 backdrop-blur-sm rounded-lg p-4 relative overflow-hidden border border-red-500/30 shadow-lg"
                animate={{
                  x: defenderHit ? [0, 10, -10, 5, -5, 0] : 0,
                  scale: battlePhase === "finished" && battle?.winnerId === defender.id ? 1.05 : 1,
                }}
                transition={{
                  x: { duration: 0.5 },
                  scale: { duration: 0.5 }
                }}
              >
                {attackerHit && (
                  <motion.div
                    className="absolute inset-0 bg-red-500/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <h3 className="text-lg font-bold text-red-400 mb-2">Defender</h3>
                <h4 className="text-xl font-bold text-white mb-2">{defender.name}</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">Type: {defender.type}</p>
                  <p className="text-gray-300">Attack: {defender.attack}</p>
                  <p className="text-gray-300">Defense: {defender.defense}</p>
                  <p className="text-gray-300">Speed: {defender.speed}</p>
                </div>
                
                {/* Health Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">HP</span>
                    <span className="text-gray-300">{Math.round(defender.currentHp || defender.hp)}/{defender.maxHp}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600"
                      initial={{ width: "100%" }}
                      animate={{ 
                        width: `${((defender.currentHp || defender.hp) / defender.maxHp) * 100}%`,
                        backgroundColor: (defender.currentHp || defender.hp) / defender.maxHp < 0.3 ? "#ef4444" : 
                                       (defender.currentHp || defender.hp) / defender.maxHp < 0.6 ? "#f59e0b" : "#10b981"
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
                
                {defender.battleChat && (
                  <motion.div 
                    className="mt-3 p-3 bg-gray-800 rounded border border-red-500/30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-sm text-red-200 italic">&ldquo;{defender.battleChat}&rdquo;</p>
                  </motion.div>
                )}
                
                {battlePhase === "finished" && battle?.winnerId === defender.id && (
                  <>
                    <VictoryParticles count={15} />
                    <motion.div
                      className="absolute top-2 right-2"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", damping: 10 }}
                    >
                      <span className="text-3xl">👑</span>
                    </motion.div>
                  </>
                )}
                {battlePhase === "finished" && battle?.winnerId !== defender.id && (
                  <DefeatEffect show={true} />
                )}
              </motion.div>
            </div>

            {/* Battle Controls */}
            <div className="text-center">
              {!battle && !isBattling && (
                <motion.button
                  onClick={startBattle}
                  className="btn-primary px-8 py-3 text-lg relative overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10">⚔️ Start Battle! ⚔️</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              )}
              
              {isBattling && (
                <div className="text-center">
                  <motion.div 
                    className="inline-flex flex-col items-center space-y-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center space-x-6">
                      <motion.div
                        animate={{ 
                          scale: attackerHit ? [1, 1.2, 1] : 1,
                          rotate: attackerHit ? [0, -10, 10, 0] : 0
                        }}
                        transition={{ duration: 0.3 }}
                        className="text-4xl"
                      >
                        ⚔️
                      </motion.div>
                      {attackerHit && (
                        <motion.div
                          className="absolute left-8 top-0 text-yellow-400 font-bold text-2xl pointer-events-none"
                          initial={{ opacity: 0, y: 0 }}
                          animate={{ opacity: [0, 1, 0], y: -30 }}
                          transition={{ duration: 1 }}
                        >
                          💥 POW!
                        </motion.div>
                      )}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="rounded-full h-12 w-12 border-4 border-white border-t-transparent"
                      />
                      <motion.div
                        animate={{ 
                          scale: defenderHit ? [1, 1.2, 1] : 1,
                          rotate: defenderHit ? [0, 10, -10, 0] : 0
                        }}
                        transition={{ duration: 0.3 }}
                        className="text-4xl"
                      >
                        🛡️
                      </motion.div>
                      {defenderHit && (
                        <motion.div
                          className="absolute right-8 top-0 text-orange-400 font-bold text-2xl pointer-events-none"
                          initial={{ opacity: 0, y: 0 }}
                          animate={{ opacity: [0, 1, 0], y: -30 }}
                          transition={{ duration: 1 }}
                        >
                          💫 BAM!
                        </motion.div>
                      )}
                    </div>
                    <p className="text-white text-lg font-semibold">Battle in progress...</p>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Battle Result Modal */}
          <AnimatePresence>
            {showResult && battle && (
              <BattleResult
                battle={battle}
                attacker={attacker}
                defender={defender}
                onClose={handleClose}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </NavigationLayout>
  );
}