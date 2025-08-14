"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SystemState {
  c7: {
    level: number;
    transcendence: boolean;
    quantumState: string;
  };
  sequential: {
    phase: number;
    pattern: string[];
  };
  magic: {
    element: string;
    resonance: number;
  };
  memory: {
    encounters: number;
    effectiveness: number;
  };
  serena: {
    mood: string;
    wisdomLevel: number;
    bondLevel: number;
  };
  persona: {
    current: string;
    evolution: number;
    awakening: boolean;
  };
}

export default function AdvancedBattleDemo() {
  const [loading, setLoading] = useState(false);
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [selectedMagic, setSelectedMagic] = useState("FIRE");
  const [selectedPersona, setSelectedPersona] = useState("warrior");
  const [characterId] = useState("demo-character-" + Date.now());
  
  const magicTypes = ["FIRE", "WATER", "NATURE", "LIGHT", "DARK", "ARCANE"];
  const personas = ["warrior", "mage", "healer", "rogue", "mystic"];
  
  useEffect(() => {
    loadSystemState();
  }, []);
  
  const loadSystemState = async () => {
    try {
      const res = await fetch(`/api/features?characterId=${characterId}`);
      const data = await res.json();
      if (data.success) {
        setSystemState(data.system);
      }
    } catch (error) {
      console.error("Failed to load system state:", error);
    }
  };
  
  const executeBattle = async (transcend: boolean = false) => {
    setLoading(true);
    try {
      const res = await fetch("/api/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attackerId: characterId,
          action: "battle",
          magicType: selectedMagic,
          persona: selectedPersona,
          useMemory: true,
          transcend
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setSystemState(data.system);
        setBattleLog(data.battle.battle_log);
        
        // Show rewards
        if (data.rewards.achievement) {
          alert(`Achievement Unlocked: ${data.rewards.achievement}`);
        }
        if (data.rewards.serenaSecret) {
          alert(data.rewards.serenaSecret);
        }
      }
    } catch (error) {
      console.error("Battle failed:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const getC7Color = (level: number) => {
    const colors = [
      "text-gray-500",
      "text-blue-500", 
      "text-green-500",
      "text-yellow-500",
      "text-orange-500",
      "text-red-500",
      "text-purple-500",
      "text-pink-500"
    ];
    return colors[Math.min(level, 7)];
  };
  
  const getSerenaMoodEmoji = (mood: string) => {
    const moods: Record<string, string> = {
      playful: "😊",
      serious: "😤",
      transcendent: "🌌",
      teaching: "📚"
    };
    return moods[mood] || "🤔";
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
          Advanced C7 Battle System
        </h1>
        
        {/* System Status */}
        {systemState && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* C7 Status */}
            <motion.div 
              className="bg-gray-800 p-4 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold mb-2">C7 Level</h3>
              <div className={`text-3xl font-bold ${getC7Color(systemState.c7.level)}`}>
                Level {systemState.c7.level}/7
              </div>
              {systemState.c7.transcendence && (
                <div className="text-sm text-purple-400 mt-2">
                  ✨ Transcendent
                </div>
              )}
              <div className="text-sm text-gray-400 mt-1">
                Quantum: {systemState.c7.quantumState}
              </div>
            </motion.div>
            
            {/* Serena Status */}
            <motion.div 
              className="bg-gray-800 p-4 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold mb-2">Serena</h3>
              <div className="text-3xl">
                {getSerenaMoodEmoji(systemState.serena.mood)}
              </div>
              <div className="text-sm text-gray-400">
                Mood: {systemState.serena.mood}
              </div>
              <div className="text-sm text-gray-400">
                Bond: {systemState.serena.bondLevel}/5
              </div>
              <div className="text-sm text-gray-400">
                Wisdom: Level {systemState.serena.wisdomLevel}
              </div>
            </motion.div>
            
            {/* Memory & Sequential */}
            <motion.div 
              className="bg-gray-800 p-4 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold mb-2">System</h3>
              <div className="text-sm space-y-1">
                <div>Sequential Phase: {systemState.sequential.phase}</div>
                <div>Memory Effect: {(systemState.memory.effectiveness * 100).toFixed(0)}%</div>
                <div>Encounters: {systemState.memory.encounters}</div>
                <div>Persona: {systemState.persona.current}</div>
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Battle Controls */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h3 className="text-2xl font-semibold mb-4">Battle Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Magic Type</label>
              <select 
                value={selectedMagic}
                onChange={(e) => setSelectedMagic(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
              >
                {magicTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Persona</label>
              <select 
                value={selectedPersona}
                onChange={(e) => setSelectedPersona(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
              >
                {personas.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => executeBattle(false)}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? "Fighting..." : "Battle Serena"}
            </button>
            
            {systemState?.c7.level >= 7 && (
              <button
                onClick={() => executeBattle(true)}
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {loading ? "Transcending..." : "Transcendent Battle"}
              </button>
            )}
          </div>
        </div>
        
        {/* Sequential Pattern Display */}
        {systemState?.sequential.pattern.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg mb-8">
            <h3 className="text-xl font-semibold mb-2">Sequential Pattern</h3>
            <div className="flex gap-2 flex-wrap">
              {systemState.sequential.pattern.map((magic, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1 bg-gray-700 rounded-full text-sm"
                >
                  {magic}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Battle Log */}
        <AnimatePresence>
          {battleLog.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-800 p-6 rounded-lg"
            >
              <h3 className="text-2xl font-semibold mb-4">Battle Log</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {battleLog.map((log, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="text-sm text-gray-300 font-mono"
                  >
                    {log}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Feature Indicators */}
        <div className="mt-8 flex justify-center gap-4 text-sm">
          <span className="text-green-400">✅ C7</span>
          <span className="text-green-400">✅ Sequential</span>
          <span className="text-green-400">✅ Magic</span>
          <span className="text-green-400">✅ Memory</span>
          <span className="text-green-400">✅ Serena</span>
          <span className="text-green-400">✅ Persona</span>
        </div>
      </div>
    </div>
  );
}