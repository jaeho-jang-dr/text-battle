"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import BattleArena from "@/components/BattleArena";
import BattleResult from "@/components/BattleResult";
import { Character, Battle } from "@/types";
import { useToast } from "@/contexts/ToastContext";
import { useBattleEffects } from "@/hooks/useBattleSound";
import { pageTransition } from "@/lib/animations";

export default function BattlePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const { playBattleStart, playHit, playVictory, playDefeat } = useBattleEffects();
  const [attacker, setAttacker] = useState<Character | null>(null);
  const [defender, setDefender] = useState<Character | null>(null);
  const [battle, setBattle] = useState<Battle | null>(null);
  const [isBattling, setIsBattling] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState<string>("");

  const attackerId = params.attackerId as string;
  const defenderId = params.defenderId as string;

  useEffect(() => {
    loadCharacters();
  }, [attackerId, defenderId]);

  const loadCharacters = async () => {
    try {
      // Load attacker
      const attackerRes = await fetch(`/api/characters/${attackerId}`);
      if (!attackerRes.ok) throw new Error("Failed to load attacker");
      const attackerData = await attackerRes.json();
      setAttacker(attackerData.data);

      // Load defender
      const defenderRes = await fetch(`/api/characters/${defenderId}`);
      if (!defenderRes.ok) throw new Error("Failed to load defender");
      const defenderData = await defenderRes.json();
      setDefender(defenderData.data);
    } catch (err) {
      setError("Failed to load characters");
      console.error(err);
    }
  };

  const startBattle = async () => {
    if (!attacker || !defender) return;

    setIsBattling(true);
    setError("");
    
    // Play battle start sound
    playBattleStart();
    toast.info("Battle started!", 2000);

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
      
      // Play hit sounds during battle
      setTimeout(() => playHit(), 1000);
      setTimeout(() => playHit(), 1500);
      setTimeout(() => playHit(), 2000);

      // Wait for animation to complete
      setTimeout(() => {
        setIsBattling(false);
        setShowResult(true);
        
        // Play victory/defeat sound and show toast
        if (data.data.winnerId === attackerId) {
          playVictory();
          toast.success(`${attacker.name} wins!`, 4000);
        } else {
          playDefeat();
          toast.error(`${attacker.name} was defeated!`, 4000);
        }
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Battle failed");
      setIsBattling(false);
      toast.error(err.message || "Battle failed", 3000);
    }
  };

  const handleClose = () => {
    router.push("/play");
  };

  if (error) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800"
        initial="initial"
        animate="animate"
        {...pageTransition}
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
            onClick={() => router.push("/play")}
            className="mt-4 w-full btn-secondary"
          >
            Go Back
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
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center text-white mb-8"
        >
          Battle Arena
        </motion.h1>

        <BattleArena
          attacker={attacker}
          defender={defender}
          battle={battle}
          isBattling={isBattling}
          onStartBattle={startBattle}
        />

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
  );
}