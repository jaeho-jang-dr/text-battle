"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Character } from "@/types";
import { motion } from "framer-motion";

interface BattleOpponentsProps {
  currentCharacter: Character;
}

export default function BattleOpponents({ currentCharacter }: BattleOpponentsProps) {
  const router = useRouter();
  const [opponents, setOpponents] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [battleStats, setBattleStats] = useState<{
    dailyBattlesUsed: number;
    dailyBattlesRemaining: number;
    canBattleToday: boolean;
  } | null>(null);
  const [battling, setBattling] = useState(false);

  useEffect(() => {
    loadOpponents();
    loadBattleStats();
  }, [currentCharacter.id]);

  const loadOpponents = async () => {
    try {
      const response = await fetch("/api/characters");
      if (!response.ok) throw new Error("Failed to load opponents");
      
      const data = await response.json();
      // Filter out the current character
      const availableOpponents = data.data.filter(
        (char: Character) => char.id !== currentCharacter.id
      );
      
      setOpponents(availableOpponents);
    } catch (err) {
      setError("Failed to load opponents");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBattleStats = async () => {
    try {
      const response = await fetch("/api/battles/stats");
      if (!response.ok) throw new Error("Failed to load battle stats");
      
      const data = await response.json();
      setBattleStats(data.data);
    } catch (err) {
      console.error("Failed to load battle stats:", err);
    }
  };

  const startBattle = async (opponentId: string) => {
    if (battling || !battleStats?.canBattleToday) return;
    
    setBattling(true);
    setError("");
    
    try {
      const response = await fetch("/api/battles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attackerId: currentCharacter.id,
          defenderId: opponentId
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create battle");
      }
      
      // Navigate to battle result
      router.push(`/battle/${data.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start battle");
      setBattling(false);
      // Reload battle stats in case limits were reached
      loadBattleStats();
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-400">
        Loading opponents...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Choose Your Opponent</h2>
        {battleStats && (
          <div className="text-right">
            <p className="text-sm text-gray-400">
              Daily Battles: {battleStats.dailyBattlesUsed}/10
            </p>
            {battleStats.dailyBattlesRemaining <= 3 && battleStats.dailyBattlesRemaining > 0 && (
              <p className="text-xs text-yellow-400">
                Only {battleStats.dailyBattlesRemaining} battles remaining today!
              </p>
            )}
            {!battleStats.canBattleToday && (
              <p className="text-xs text-red-400">
                Daily battle limit reached. Reset at midnight.
              </p>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {opponents.map((opponent, index) => (
          <motion.div
            key={opponent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 cursor-pointer transition-all"
            onClick={() => startBattle(opponent.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-white">{opponent.name}</h3>
              {opponent.isNPC && (
                <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">NPC</span>
              )}
            </div>
            
            <div className="text-sm text-gray-400 mb-3">
              <p>ELO: {opponent.eloScore}</p>
              <p>W/L: {opponent.wins}/{opponent.losses}</p>
            </div>
            
            <div className="bg-gray-700 rounded p-2">
              <p className="text-xs text-gray-300 italic">"{opponent.battleChat}"</p>
            </div>
            
            <button
              className={`mt-3 w-full px-3 py-2 rounded transition-colors ${
                battleStats?.canBattleToday && !battling
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                startBattle(opponent.id);
              }}
              disabled={!battleStats?.canBattleToday || battling}
            >
              {battling ? "Starting..." : !battleStats?.canBattleToday ? "Limit Reached" : "Battle!"}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}