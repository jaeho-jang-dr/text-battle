"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

interface BattleResult {
  winnerId: string;
  attackerScore: number;
  defenderScore: number;
  attackerEloChange: number;
  defenderEloChange: number;
  battleLog: string[];
}

interface BattleResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: BattleResult | null;
  currentCharacterId: string;
  opponentName: string;
}

export default function BattleResultModal({
  isOpen,
  onClose,
  result,
  currentCharacterId,
  opponentName
}: BattleResultModalProps) {
  if (!result) return null;

  const isVictory = result.winnerId === currentCharacterId;
  const eloChange = result.attackerEloChange;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`bg-gray-900 rounded-lg p-6 max-w-md w-full border-2 ${
              isVictory ? "border-green-500" : "border-red-500"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={`text-3xl font-bold mb-4 text-center ${
              isVictory ? "text-green-400" : "text-red-400"
            }`}>
              {isVictory ? "Victory!" : "Defeat!"}
            </h2>

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-400">You fought against</p>
                <p className="text-xl font-semibold text-white">{opponentName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-800 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Your Score</p>
                  <p className="text-2xl font-bold text-white">{result.attackerScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Opponent Score</p>
                  <p className="text-2xl font-bold text-white">{result.defenderScore}</p>
                </div>
              </div>

              <div className={`text-center p-3 rounded-lg ${
                eloChange > 0 ? "bg-green-900/30" : "bg-red-900/30"
              }`}>
                <p className="text-sm text-gray-400">ELO Change</p>
                <p className={`text-2xl font-bold ${
                  eloChange > 0 ? "text-green-400" : "text-red-400"
                }`}>
                  {eloChange > 0 ? "+" : ""}{eloChange}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-3 max-h-40 overflow-y-auto">
                <p className="text-sm font-semibold text-gray-400 mb-2">Battle Log:</p>
                {result.battleLog.map((log, index) => (
                  <p key={index} className="text-xs text-gray-300 mb-1">{log}</p>
                ))}
              </div>
            </div>

            <Button
              onClick={onClose}
              className="w-full mt-6"
              variant={isVictory ? "default" : "destructive"}
            >
              Continue
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}