"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface BattleEnergyBarProps {
  className?: string;
}

export default function BattleEnergyBar({ className = "" }: BattleEnergyBarProps) {
  const [battleStats, setBattleStats] = useState<{
    dailyBattlesUsed: number;
    dailyBattlesRemaining: number;
    canBattleToday: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBattleStats();
    // Refresh stats every minute
    const interval = setInterval(loadBattleStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadBattleStats = async () => {
    try {
      const response = await fetch("/api/battles/stats");
      if (!response.ok) throw new Error("Failed to load battle stats");
      
      const data = await response.json();
      setBattleStats(data.data);
    } catch (err) {
      console.error("Failed to load battle stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !battleStats) {
    return null;
  }

  const maxBattles = 10;
  const percentage = (battleStats.dailyBattlesRemaining / maxBattles) * 100;
  const isLow = battleStats.dailyBattlesRemaining <= 3;
  const isEmpty = battleStats.dailyBattlesRemaining === 0;

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-300">Battle Energy</h3>
        <span className={`text-sm font-bold ${isEmpty ? "text-red-400" : isLow ? "text-yellow-400" : "text-green-400"}`}>
          {battleStats.dailyBattlesRemaining}/{maxBattles}
        </span>
      </div>
      
      <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`absolute top-0 left-0 h-full rounded-full ${
            isEmpty ? "bg-red-500" : isLow ? "bg-yellow-500" : "bg-green-500"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <p className="text-xs text-gray-400 mt-2">
        {isEmpty 
          ? "Daily limit reached. Resets at midnight." 
          : isLow 
          ? `Only ${battleStats.dailyBattlesRemaining} battles remaining!`
          : "Battles available today"
        }
      </p>
      
      {/* Time until reset */}
      <TimeUntilReset />
    </div>
  );
}

function TimeUntilReset() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${hours}h ${minutes}m`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <p className="text-xs text-gray-500 mt-1">
      Resets in {timeLeft}
    </p>
  );
}