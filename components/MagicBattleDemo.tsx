"use client";

import { useState } from "react";
import { useMagicBattle, getMagicAdvantage, getPersonaBonus } from "@/hooks/useMagicBattle";
import { MagicType, PersonaArchetype } from "@/types/magic";

const MAGIC_TYPES: MagicType[] = ["FIRE", "WATER", "NATURE", "LIGHT", "DARK", "ARCANE"];
const PERSONA_TYPES: PersonaArchetype[] = [
  "MAGICIAN", "PRIESTESS", "EMPRESS", "EMPEROR", 
  "HIEROPHANT", "LOVERS", "CHARIOT"
];

const MAGIC_COLORS: Record<MagicType, string> = {
  FIRE: "bg-red-500",
  WATER: "bg-blue-500",
  NATURE: "bg-green-500",
  LIGHT: "bg-yellow-300",
  DARK: "bg-purple-800",
  ARCANE: "bg-pink-500"
};

export default function MagicBattleDemo() {
  const { createMagicBattle, battleResult, loading, error, clearBattleResult } = useMagicBattle();
  
  const [attackerId, setAttackerId] = useState("");
  const [defenderId, setDefenderId] = useState("");
  const [attackerMagic, setAttackerMagic] = useState<MagicType>("FIRE");
  const [defenderMagic, setDefenderMagic] = useState<MagicType>("WATER");
  const [useMemory, setUseMemory] = useState(true);
  const [includeSerena, setIncludeSerena] = useState(false);
  const [persona, setPersona] = useState<PersonaArchetype | "">("");
  const [sequence, setSequence] = useState(1);

  const handleBattle = async () => {
    try {
      await createMagicBattle({
        attackerId: attackerId || undefined,
        defenderId: defenderId || undefined,
        attackerMagic,
        defenderMagic,
        sequence,
        useMemory,
        includeSerena,
        persona: persona || undefined,
      });
    } catch (err) {
      console.error("Battle failed:", err);
    }
  };

  const advantage = getMagicAdvantage(attackerMagic, defenderMagic);
  const personaBonus = persona ? getPersonaBonus(persona as PersonaArchetype, attackerMagic) : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold text-center mb-6">Magic Battle System (C7)</h2>
      
      {/* Battle Configuration */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold mb-4">Battle Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Attacker Setup */}
          <div className="space-y-3">
            <h4 className="font-medium">Attacker</h4>
            <input
              type="text"
              placeholder="Attacker ID (optional)"
              value={attackerId}
              onChange={(e) => setAttackerId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={includeSerena && !defenderId}
            />
            
            <div>
              <label className="block text-sm font-medium mb-1">Magic Type</label>
              <select
                value={attackerMagic}
                onChange={(e) => setAttackerMagic(e.target.value as MagicType)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {MAGIC_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Defender Setup */}
          <div className="space-y-3">
            <h4 className="font-medium">Defender</h4>
            <input
              type="text"
              placeholder="Defender ID (optional)"
              value={defenderId}
              onChange={(e) => setDefenderId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={includeSerena && !attackerId}
            />
            
            <div>
              <label className="block text-sm font-medium mb-1">Magic Type</label>
              <select
                value={defenderMagic}
                onChange={(e) => setDefenderMagic(e.target.value as MagicType)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {MAGIC_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Advanced Options */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium">Advanced Options</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Persona (Optional)</label>
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value as PersonaArchetype | "")}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">None</option>
                {PERSONA_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Sequence Number</label>
              <input
                type="number"
                min="1"
                max="10"
                value={sequence}
                onChange={(e) => setSequence(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useMemory}
                onChange={(e) => setUseMemory(e.target.checked)}
                className="rounded"
              />
              <span>Use Memory System</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeSerena}
                onChange={(e) => setIncludeSerena(e.target.checked)}
                className="rounded"
              />
              <span>Include Serena (NPC)</span>
            </label>
          </div>
        </div>
        
        {/* Battle Preview */}
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-medium mb-2">Battle Preview</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded ${MAGIC_COLORS[attackerMagic]}`} />
              <span>{attackerMagic}</span>
              {persona && <span className="text-sm text-gray-500">({persona})</span>}
            </div>
            
            <div className="text-center">
              <span className="text-lg">VS</span>
              <div className="text-sm text-gray-500">
                {advantage === "advantage" && "Advantage →"}
                {advantage === "disadvantage" && "← Disadvantage"}
                {advantage === "neutral" && "Neutral"}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded ${MAGIC_COLORS[defenderMagic]}`} />
              <span>{defenderMagic}</span>
            </div>
          </div>
          
          {personaBonus > 0 && (
            <div className="mt-2 text-sm text-green-600">
              Persona Bonus: +{personaBonus} power
            </div>
          )}
        </div>
        
        <button
          onClick={handleBattle}
          disabled={loading || (!attackerId && !defenderId && !includeSerena)}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Creating Battle..." : "Start Magic Battle"}
        </button>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {/* Battle Result */}
      {battleResult && battleResult.success && battleResult.data && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Battle Result</h3>
            <button
              onClick={clearBattleResult}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          {/* Battle Summary */}
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="font-medium">{battleResult.data.attacker.name}</h4>
                <div className="text-sm text-gray-500">
                  {battleResult.data.attacker_magic} Magic
                  {battleResult.data.attacker.persona && ` • ${battleResult.data.attacker.persona}`}
                </div>
                <div className="text-2xl font-bold mt-1">{battleResult.data.attacker_score}</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl">⚔️</div>
                <div className="text-sm text-gray-500 mt-1">
                  Sequence {battleResult.data.sequence}
                </div>
              </div>
              
              <div className="text-right">
                <h4 className="font-medium">{battleResult.data.defender.name}</h4>
                <div className="text-sm text-gray-500">
                  {battleResult.data.defender_magic} Magic
                  {battleResult.data.defender.persona && ` • ${battleResult.data.defender.persona}`}
                </div>
                <div className="text-2xl font-bold mt-1">{battleResult.data.defender_score}</div>
              </div>
            </div>
            
            <div className="text-center py-3 border-t">
              <div className="text-lg font-medium">
                Winner: {battleResult.data.winner_id === battleResult.data.attacker_id 
                  ? battleResult.data.attacker.name 
                  : battleResult.data.defender.name}
              </div>
            </div>
          </div>
          
          {/* ELO Changes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-500">Attacker ELO</div>
              <div className="flex items-center space-x-2">
                <span>{battleResult.data.attacker.oldElo}</span>
                <span>→</span>
                <span className={battleResult.data.attacker.newElo > battleResult.data.attacker.oldElo ? "text-green-600" : "text-red-600"}>
                  {battleResult.data.attacker.newElo}
                </span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-500">Defender ELO</div>
              <div className="flex items-center space-x-2">
                <span>{battleResult.data.defender.oldElo}</span>
                <span>→</span>
                <span className={battleResult.data.defender.newElo > battleResult.data.defender.oldElo ? "text-green-600" : "text-red-600"}>
                  {battleResult.data.defender.newElo}
                </span>
              </div>
            </div>
          </div>
          
          {/* Battle Log */}
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4">
            <h4 className="font-medium mb-2">Battle Log</h4>
            <pre className="text-sm whitespace-pre-wrap">{battleResult.data.battle_log}</pre>
          </div>
          
          {/* Features Used */}
          {battleResult.features && (
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium mb-2">Features Active</h4>
              <div className="flex flex-wrap gap-2">
                {battleResult.features.c7Level && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">C7 Level</span>
                )}
                {battleResult.features.magicSystem && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">Magic System</span>
                )}
                {battleResult.features.memoryEnabled && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">Memory Active</span>
                )}
                {battleResult.features.serenaIncluded && (
                  <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-sm">Serena NPC</span>
                )}
                {battleResult.features.personaActive && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">Persona System</span>
                )}
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                  Sequence: {battleResult.features.sequential}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}