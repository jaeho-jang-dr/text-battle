"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Character } from "@/types";
import BattleOpponents from "@/components/BattleOpponents";
import BattleHistory from "@/components/BattleHistory";
import BattleEnergyBar from "@/components/BattleEnergyBar";
import { motion } from "framer-motion";
import { pageTransition, staggerContainer, staggerItem } from "@/lib/animations";
import { CharacterCardSkeleton, BattleHistorySkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function PlayPage() {
  const router = useRouter();
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCurrentCharacter();
  }, []);

  const loadCurrentCharacter = async () => {
    try {
      // Get current user ID from cookie/session
      const response = await fetch("/api/auth/verify");
      if (!response.ok) {
        router.push("/");
        return;
      }
      
      const userData = await response.json();
      
      // Get user's character
      const charResponse = await fetch(`/api/characters?userId=${userData.userId}`);
      if (!charResponse.ok) {
        // No character, redirect to create one
        router.push("/create-character");
        return;
      }
      
      const charData = await charResponse.json();
      setCurrentCharacter(charData.data);
    } catch (err) {
      setError("Failed to load character");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="h-12 w-64 bg-gray-700/50 rounded-lg animate-pulse mb-4" />
            <CharacterCardSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <CharacterCardSkeleton />
                <CharacterCardSkeleton />
                <CharacterCardSkeleton />
              </div>
            </div>
            <div className="lg:col-span-1">
              <BattleHistorySkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4"
        initial="initial"
        animate="animate"
        {...pageTransition}
      >
        <motion.div 
          className="bg-red-900/50 backdrop-blur border-2 border-red-500 rounded-lg p-6 max-w-md w-full glow-red"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <h2 className="text-xl font-bold text-red-300 mb-2">Error</h2>
          <p className="text-gray-300">{error}</p>
          <Button
            onClick={() => router.push("/")}
            variant="destructive"
            className="mt-4 w-full"
          >
            Go Home
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  if (!currentCharacter) {
    return null;
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-4 md:py-8"
      initial="initial"
      animate="animate"
      {...pageTransition}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-6 md:mb-8"
        >
          <motion.h1 
            className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-4"
            variants={staggerItem}
          >
            Battle Arena
          </motion.h1>
          
          {/* Current Character Info */}
          <motion.div 
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 md:p-6 border-2 border-gray-700 hover:border-blue-500 transition-colors card-hover"
            variants={staggerItem}
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold gradient-text mb-2">
                  {currentCharacter.name}
                </h2>
                <div className="text-gray-300 space-y-1 text-sm md:text-base">
                  <p>ELO Score: <span className="font-semibold text-yellow-400">{currentCharacter.eloScore}</span></p>
                  <p>Record: <span className="text-green-400">{currentCharacter.wins}W</span> - <span className="text-red-400">{currentCharacter.losses}L</span></p>
                  <p className="text-sm text-gray-400 italic mt-2">"{currentCharacter.battleChat}"</p>
                </div>
              </div>
              
              <Button
                onClick={() => router.push("/leaderboard")}
                variant="secondary"
                className="w-full md:w-auto"
                glow
              >
                View Leaderboard
              </Button>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* Battle Opponents - 2/3 width on large screens */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 order-2 lg:order-1"
          >
            <BattleOpponents currentCharacter={currentCharacter} />
          </motion.div>
          
          {/* Battle History and Energy - 1/3 width on large screens */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1 space-y-4 md:space-y-6 order-1 lg:order-2"
          >
            {/* Battle Energy Bar */}
            <BattleEnergyBar />
            
            {/* Battle History */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 md:p-6 border-2 border-gray-700">
              <BattleHistory characterId={currentCharacter.id} />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}