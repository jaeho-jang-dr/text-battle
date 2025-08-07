"use client";

import { useState, useEffect } from "react";
import { Battle, Character } from "@/types";
import { motion } from "framer-motion";

interface BattleHistoryProps {
  characterId: string;
}

export default function BattleHistory({ characterId }: BattleHistoryProps) {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBattleHistory();
  }, [characterId]);

  const loadBattleHistory = async () => {
    try {
      const response = await fetch(`/api/battles/history?characterId=${characterId}&limit=10`);
      if (!response.ok) throw new Error("Failed to load battle history");
      
      const data = await response.json();
      setBattles(data.data);
    } catch (err) {
      setError("Failed to load battle history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-400">
        Loading battle history...
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

  if (battles.length === 0) {
    return (
      <div className="text-center text-gray-400">
        No battles yet. Start battling to build your history!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">Recent Battles</h3>
      
      <div className="space-y-2">
        {battles.map((battle, index) => {
          const isAttacker = battle.attackerId === characterId;
          const won = battle.winnerId === characterId;
          
          return (
            <motion.div
              key={battle.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gray-800 rounded-lg p-4 border ${
                won ? "border-green-600" : "border-red-600"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm text-gray-400">
                    {new Date(battle.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-white">
                    {isAttacker ? "Attacked" : "Defended against"} opponent
                  </p>
                  <p className="text-sm text-gray-300">
                    Score: {isAttacker ? battle.attackerScore : battle.defenderScore} vs{" "}
                    {isAttacker ? battle.defenderScore : battle.attackerScore}
                  </p>
                </div>
                
                <div className="text-2xl">
                  {won ? (
                    <span className="text-green-400">✓</span>
                  ) : (
                    <span className="text-red-400">✗</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}