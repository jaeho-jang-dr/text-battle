import { useState, useCallback } from 'react';
import { MagicBattleRequest, MagicBattleResponse, MagicType, PersonaArchetype } from '@/types/magic';

export function useMagicBattle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<MagicBattleResponse | null>(null);

  const createMagicBattle = useCallback(async (params: MagicBattleRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/battles/magic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data: MagicBattleResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create magic battle');
      }

      setBattleResult(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBattleMemory = useCallback(async (characterId: string, opponentId: string) => {
    try {
      const response = await fetch(
        `/api/battles/magic?characterId=${characterId}&opponentId=${opponentId}&memory=true`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch battle memory');
      }

      return await response.json();
    } catch (err) {
      console.error('Failed to fetch battle memory:', err);
      return null;
    }
  }, []);

  const getMagicSystemInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/battles/magic');
      
      if (!response.ok) {
        throw new Error('Failed to fetch magic system info');
      }

      return await response.json();
    } catch (err) {
      console.error('Failed to fetch magic system info:', err);
      return null;
    }
  }, []);

  const clearBattleResult = useCallback(() => {
    setBattleResult(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    battleResult,
    createMagicBattle,
    getBattleMemory,
    getMagicSystemInfo,
    clearBattleResult,
  };
}

// Helper hook for sequential battles
export function useSequentialMagicBattle() {
  const { createMagicBattle, ...rest } = useMagicBattle();
  const [sequence, setSequence] = useState(1);
  const [battleHistory, setBattleHistory] = useState<MagicBattleResponse[]>([]);

  const createSequentialBattle = useCallback(async (params: MagicBattleRequest) => {
    const result = await createMagicBattle({
      ...params,
      sequence,
    });

    if (result.success) {
      setBattleHistory(prev => [...prev, result]);
      setSequence(prev => prev + 1);
    }

    return result;
  }, [createMagicBattle, sequence]);

  const resetSequence = useCallback(() => {
    setSequence(1);
    setBattleHistory([]);
  }, []);

  return {
    ...rest,
    sequence,
    battleHistory,
    createSequentialBattle,
    resetSequence,
  };
}

// Helper function to get magic type advantages
export function getMagicAdvantage(
  attackerMagic: MagicType,
  defenderMagic: MagicType
): 'advantage' | 'disadvantage' | 'neutral' {
  const advantages: Record<MagicType, MagicType> = {
    FIRE: 'NATURE',
    WATER: 'FIRE',
    NATURE: 'WATER',
    LIGHT: 'DARK',
    DARK: 'LIGHT',
    ARCANE: 'ARCANE', // Arcane is neutral against itself
  };

  if (advantages[attackerMagic] === defenderMagic) {
    return 'advantage';
  }
  
  if (advantages[defenderMagic] === attackerMagic) {
    return 'disadvantage';
  }

  return 'neutral';
}

// Helper function to get persona bonuses
export function getPersonaBonus(
  persona: PersonaArchetype,
  magicType: MagicType
): number {
  const personaMap: Record<PersonaArchetype, { primary: MagicType; secondary: MagicType }> = {
    MAGICIAN: { primary: 'ARCANE', secondary: 'FIRE' },
    PRIESTESS: { primary: 'LIGHT', secondary: 'WATER' },
    EMPRESS: { primary: 'NATURE', secondary: 'LIGHT' },
    EMPEROR: { primary: 'FIRE', secondary: 'DARK' },
    HIEROPHANT: { primary: 'LIGHT', secondary: 'NATURE' },
    LOVERS: { primary: 'WATER', secondary: 'LIGHT' },
    CHARIOT: { primary: 'FIRE', secondary: 'ARCANE' },
  };

  const config = personaMap[persona];
  if (config.primary === magicType) return 20;
  if (config.secondary === magicType) return 10;
  return 0;
}