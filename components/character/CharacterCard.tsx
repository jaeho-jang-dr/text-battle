'use client';

import { Character } from '@/types';
import { motion } from 'framer-motion';
import { cardVariants } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface CharacterCardProps {
  character: Character;
  showStats?: boolean;
  onClick?: () => void;
}

export default function CharacterCard({ 
  character, 
  showStats = true,
  onClick 
}: CharacterCardProps) {
  const winRate = character.wins + character.losses > 0
    ? ((character.wins / (character.wins + character.losses)) * 100).toFixed(1)
    : '0.0';
    
  const getRankColor = (elo: number) => {
    if (elo >= 1800) return 'from-yellow-400 to-amber-500'; // Master
    if (elo >= 1600) return 'from-purple-400 to-pink-500'; // Diamond
    if (elo >= 1400) return 'from-blue-400 to-cyan-500'; // Platinum
    if (elo >= 1200) return 'from-gray-400 to-gray-500'; // Gold
    return 'from-orange-400 to-red-500'; // Bronze
  };
  
  const getRankGlow = (elo: number) => {
    if (elo >= 1800) return 'shadow-lg shadow-yellow-500/30';
    if (elo >= 1600) return 'shadow-lg shadow-purple-500/30';
    if (elo >= 1400) return 'shadow-lg shadow-blue-500/30';
    if (elo >= 1200) return 'shadow-lg shadow-gray-500/30';
    return 'shadow-lg shadow-orange-500/30';
  };

  return (
    <motion.div 
      className={cn(
        "relative bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-lg p-4 md:p-6 overflow-hidden",
        onClick && "cursor-pointer hover:border-blue-500 transition-all duration-300 card-hover",
        getRankGlow(character.eloScore)
      )}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={onClick ? "hover" : undefined}
      whileTap={onClick ? "tap" : undefined}
      onClick={onClick}
    >
      {/* Rank gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getRankColor(character.eloScore)} opacity-5`} />
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-bold gradient-text flex items-center gap-2">
              {character.name}
              {character.isNPC && (
                <motion.span 
                  className="text-xs md:text-sm bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  NPC
                </motion.span>
              )}
            </h3>
            <p className="text-gray-400 text-xs md:text-sm mt-1 italic line-clamp-2">
              "{character.battleChat}"
            </p>
          </div>
          {showStats && (
            <div className="text-right">
              <motion.p 
                className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${getRankColor(character.eloScore)} text-transparent bg-clip-text`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
              >
                {character.eloScore}
              </motion.p>
              <p className="text-xs md:text-sm text-gray-400">ELO Score</p>
            </div>
          )}
        </div>
      
        {showStats && (
          <motion.div 
            className="grid grid-cols-3 gap-2 md:gap-4 mt-4 pt-4 border-t border-gray-700/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-center">
              <motion.p 
                className="text-base md:text-lg font-bold text-green-400"
                whileHover={{ scale: 1.1 }}
              >
                {character.wins}
              </motion.p>
              <p className="text-xs md:text-sm text-gray-500 font-medium">Wins</p>
            </div>
            <div className="text-center">
              <motion.p 
                className="text-base md:text-lg font-bold text-red-400"
                whileHover={{ scale: 1.1 }}
              >
                {character.losses}
              </motion.p>
              <p className="text-xs md:text-sm text-gray-500 font-medium">Losses</p>
            </div>
            <div className="text-center">
              <motion.p 
                className="text-base md:text-lg font-bold text-yellow-400"
                whileHover={{ scale: 1.1 }}
              >
                {winRate}%
              </motion.p>
              <p className="text-xs md:text-sm text-gray-500 font-medium">Win Rate</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}