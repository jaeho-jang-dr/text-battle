// Server-side only battle operations
// This file should only be imported in API routes

import { memoryStore, Character, Battle } from "./db/memory-store";
import { getCharacterById, updateCharacter } from "./character-server";

const characters = memoryStore.characters;
const battles = memoryStore.battles;

// Battle restriction tracking
const battleRestrictions = new Map<string, { lastBattleTime: Date; dailyBattleCount: number }>();

// ELO rating calculation constants
const DEFAULT_ELO = 1000;
const K_FACTOR_NEW_PLAYER = 32;  // For players with < 30 games
const K_FACTOR_EXPERIENCED = 16;  // For experienced players
const NEW_PLAYER_GAME_THRESHOLD = 30;

// Battle scoring constants
const BASE_SCORE = 100;
const ELO_MULTIPLIER = 0.1;

// Battle restrictions
const DAILY_BATTLE_LIMIT = 20;
const BATTLE_COOLDOWN_MS = 1 * 1000; // 1 second

// Calculate K-factor based on games played
function getKFactor(gamesPlayed: number): number {
  return gamesPlayed < NEW_PLAYER_GAME_THRESHOLD ? K_FACTOR_NEW_PLAYER : K_FACTOR_EXPERIENCED;
}

// Calculate expected outcome for ELO
function getExpectedOutcome(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

// Calculate ELO change
function calculateEloChange(
  playerElo: number,
  opponentElo: number,
  didWin: boolean,
  playerGamesPlayed: number
): number {
  const kFactor = getKFactor(playerGamesPlayed);
  const expectedOutcome = getExpectedOutcome(playerElo, opponentElo);
  const actualOutcome = didWin ? 1 : 0;
  return Math.round(kFactor * (actualOutcome - expectedOutcome));
}

// Calculate battle scores
function calculateBattleScores(attacker: Character, defender: Character): {
  attackerScore: number;
  defenderScore: number;
  winnerId: string;
} {
  const attackerRating = attacker.rating || attacker.eloScore || DEFAULT_ELO;
  const defenderRating = defender.rating || defender.eloScore || DEFAULT_ELO;
  const eloDiff = attackerRating - defenderRating;
  
  // Base scores
  let attackerScore = BASE_SCORE;
  let defenderScore = BASE_SCORE;
  
  // Apply ELO difference modifier
  attackerScore += eloDiff * ELO_MULTIPLIER;
  defenderScore -= eloDiff * ELO_MULTIPLIER;
  
  // Add randomness
  attackerScore += Math.random() * 50;
  defenderScore += Math.random() * 50;
  
  // Ensure minimum scores
  attackerScore = Math.max(attackerScore, 10);
  defenderScore = Math.max(defenderScore, 10);
  
  const winnerId = attackerScore > defenderScore ? attacker.id : defender.id;
  
  return {
    attackerScore: Math.round(attackerScore),
    defenderScore: Math.round(defenderScore),
    winnerId
  };
}

// Analyze battle chat for various factors
function analyzeBattleChat(character: Character): {
  focus: number;
  power: number;
  creativity: number;
  harmony: number;
  intimidation: number;
} {
  const chat = character.battleChat || "";
  const name = character.name;
  
  // 집중력 (Focus) - 명확한 목표와 의도가 있는가
  let focus = 5;
  if (chat.includes("!") || chat.includes("!!")) focus += 2;
  if (chat.length > 30 && chat.length < 80) focus += 1;
  if (chat.includes("파괴") || chat.includes("승리") || chat.includes("이기")) focus += 1;
  
  // 힘 (Power) - 강력함을 표현하는 단어들
  let power = 5;
  const powerWords = ["파워", "힘", "강력", "최강", "무적", "불꽃", "번개", "폭발", "파괴", "분쇄"];
  powerWords.forEach(word => {
    if (chat.includes(word)) power += 1;
  });
  
  // 독창성 (Creativity) - 특별하고 독특한 표현
  let creativity = 5;
  if (chat.includes("~") || chat.includes("♪") || chat.includes("★")) creativity += 2;
  if (chat.split(" ").length > 5) creativity += 1; // 복잡한 문장 구조
  const uniqueWords = ["흐흐", "크크", "후후", "케케", "음하하", "우하하"];
  uniqueWords.forEach(word => {
    if (chat.includes(word)) creativity += 1;
  });
  
  // 캐릭터와 챗의 조화 (Harmony)
  let harmony = 5;
  if (chat.includes(name) || chat.toLowerCase().includes(name.toLowerCase())) harmony += 2;
  if (name.includes("마왕") && chat.includes("어둠")) harmony += 2;
  if (name.includes("용") && chat.includes("불")) harmony += 2;
  if (name.includes("전사") && chat.includes("검")) harmony += 2;
  
  // 위협도 (Intimidation)
  let intimidation = 5;
  const threatWords = ["죽", "끝", "파멸", "멸망", "절망", "공포", "두려워", "떨어라"];
  threatWords.forEach(word => {
    if (chat.includes(word)) intimidation += 1;
  });
  
  return {
    focus: Math.min(focus, 10),
    power: Math.min(power, 10),
    creativity: Math.min(creativity, 10),
    harmony: Math.min(harmony, 10),
    intimidation: Math.min(intimidation, 10)
  };
}

// Generate detailed battle analysis
function generateBattleAnalysis(
  attacker: Character,
  defender: Character,
  attackerScore: number,
  defenderScore: number,
  winnerId: string
): string {
  const winner = winnerId === attacker.id ? attacker : defender;
  const loser = winnerId === attacker.id ? defender : attacker;
  
  const winnerAnalysis = analyzeBattleChat(winner);
  const loserAnalysis = analyzeBattleChat(loser);
  
  // Find the strongest factors for the winner
  const winnerStrengths = [];
  if (winnerAnalysis.focus > loserAnalysis.focus) 
    winnerStrengths.push(`뛰어난 집중력 (${winnerAnalysis.focus}/10)`);
  if (winnerAnalysis.power > loserAnalysis.power) 
    winnerStrengths.push(`압도적인 힘 (${winnerAnalysis.power}/10)`);
  if (winnerAnalysis.creativity > loserAnalysis.creativity) 
    winnerStrengths.push(`독창적인 전투 스타일 (${winnerAnalysis.creativity}/10)`);
  if (winnerAnalysis.harmony > loserAnalysis.harmony) 
    winnerStrengths.push(`완벽한 캐릭터와의 조화 (${winnerAnalysis.harmony}/10)`);
  if (winnerAnalysis.intimidation > loserAnalysis.intimidation) 
    winnerStrengths.push(`상대를 압도하는 위압감 (${winnerAnalysis.intimidation}/10)`);
  
  // Generate the summary
  let summary = `${winner.name}의 승리! `;
  
  if (winnerStrengths.length > 0) {
    summary += `${winner.name}은(는) ${winnerStrengths.join(", ")}으로 상대를 압도했습니다. `;
  }
  
  const scoreDiff = Math.abs(attackerScore - defenderScore);
  if (scoreDiff < 20) {
    summary += "아주 치열한 접전이었습니다!";
  } else if (scoreDiff < 50) {
    summary += "명확한 실력 차이를 보여주었습니다.";
  } else {
    summary += "압도적인 승리였습니다!";
  }
  
  return summary;
}

// Generate battle log (simplified)
function generateBattleLog(
  attacker: Character,
  defender: Character,
  attackerScore: number,
  defenderScore: number,
  winnerId: string
): string[] {
  // Return the analysis as a single string in an array
  const analysis = generateBattleAnalysis(attacker, defender, attackerScore, defenderScore, winnerId);
  return [analysis];
}

// Check if a user can battle
export async function checkBattleRestrictions(
  userId: string,
  attackerId: string,
  defenderId: string,
  isAttacking: boolean = true
): Promise<{ canBattle: boolean; error?: string }> {
  try {
    const now = new Date();
    const restriction = battleRestrictions.get(userId);
    
    if (restriction) {
      // Check cooldown
      const timeSinceLastBattle = now.getTime() - restriction.lastBattleTime.getTime();
      if (timeSinceLastBattle < BATTLE_COOLDOWN_MS) {
        const remainingTime = Math.ceil((BATTLE_COOLDOWN_MS - timeSinceLastBattle) / 1000);
        return {
          canBattle: false,
          error: `Please wait ${remainingTime} seconds before battling again`
        };
      }
      
      // Check daily limit (reset at midnight)
      const lastBattleDate = restriction.lastBattleTime.toDateString();
      const currentDate = now.toDateString();
      
      if (lastBattleDate === currentDate && restriction.dailyBattleCount >= DAILY_BATTLE_LIMIT) {
        return {
          canBattle: false,
          error: `Daily battle limit (${DAILY_BATTLE_LIMIT}) reached. Try again tomorrow!`
        };
      }
    }
    
    return { canBattle: true };
  } catch (error: any) {
    console.error("Error checking battle restrictions:", error);
    return { canBattle: false, error: error.message };
  }
}

// Update battle restrictions after a battle
export async function updateBattleRestrictions(userId: string): Promise<void> {
  const now = new Date();
  const restriction = battleRestrictions.get(userId);
  
  if (restriction) {
    const lastBattleDate = restriction.lastBattleTime.toDateString();
    const currentDate = now.toDateString();
    
    if (lastBattleDate === currentDate) {
      // Same day, increment count
      restriction.dailyBattleCount++;
    } else {
      // New day, reset count
      restriction.dailyBattleCount = 1;
    }
    restriction.lastBattleTime = now;
  } else {
    // First battle
    battleRestrictions.set(userId, {
      lastBattleTime: now,
      dailyBattleCount: 1
    });
  }
}

// Create a new battle
export async function createBattle(
  attackerId: string,
  defenderId: string
): Promise<{ data: any; error: string | null }> {
  try {
    // Get both characters
    const attacker = characters.get(attackerId);
    const defender = characters.get(defenderId);
    
    if (!attacker || !defender) {
      return { data: null, error: "Character not found" };
    }
    
    // Calculate battle outcome
    const { attackerScore, defenderScore, winnerId } = calculateBattleScores(attacker, defender);
    
    // Calculate ELO changes
    const attackerWon = winnerId === attackerId;
    const attackerGamesPlayed = attacker.wins + attacker.losses;
    const defenderGamesPlayed = defender.wins + defender.losses;
    
    const attackerRating = attacker.rating || attacker.eloScore || DEFAULT_ELO;
    const defenderRating = defender.rating || defender.eloScore || DEFAULT_ELO;
    
    const attackerEloChange = calculateEloChange(
      attackerRating,
      defenderRating,
      attackerWon,
      attackerGamesPlayed
    );
    
    const defenderEloChange = calculateEloChange(
      defenderRating,
      attackerRating,
      !attackerWon,
      defenderGamesPlayed
    );
    
    // Generate battle log
    const battleLog = generateBattleLog(
      attacker,
      defender,
      attackerScore,
      defenderScore,
      winnerId
    );
    
    // Create battle record
    const battleId = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const battle: Battle = {
      id: battleId,
      player1Id: attackerId,
      player2Id: defenderId,
      winnerId,
      player1EloChange: attackerEloChange,
      player2EloChange: defenderEloChange,
      createdAt: new Date()
    };
    
    battles.set(battleId, battle);
    
    // Update characters
    if (attackerWon) {
      attacker.wins++;
      defender.losses++;
    } else {
      attacker.losses++;
      defender.wins++;
    }
    
    // Update ratings
    if (attacker.rating !== undefined) {
      attacker.rating += attackerEloChange;
    } else {
      attacker.eloScore = (attacker.eloScore || DEFAULT_ELO) + attackerEloChange;
    }
    
    if (defender.rating !== undefined) {
      defender.rating += defenderEloChange;
    } else {
      defender.eloScore = (defender.eloScore || DEFAULT_ELO) + defenderEloChange;
    }
    
    attacker.updatedAt = new Date();
    defender.updatedAt = new Date();
    
    // Save updated characters back to memory store
    characters.set(attackerId, attacker);
    characters.set(defenderId, defender);
    
    // Update battle restrictions for non-NPC attacker
    if (!attacker.isNPC) {
      await updateBattleRestrictions(attacker.userId);
    }
    
    // Return battle result
    const result = {
      id: battleId,
      attackerId,
      defenderId,
      winnerId,
      attackerScore,
      defenderScore,
      battleLog,
      attackerEloChange,
      defenderEloChange,
      createdAt: battle.createdAt
    };
    
    return { data: result, error: null };
  } catch (error: any) {
    console.error("Error creating battle:", error);
    return { data: null, error: error.message };
  }
}

// Get recent battles for a character
export async function getRecentBattles(
  characterId: string,
  limit = 10
): Promise<{ data: any[]; error: string | null }> {
  try {
    const recentBattles = Array.from(battles.values())
      .filter(battle => 
        battle.player1Id === characterId || battle.player2Id === characterId
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map(battle => {
        const isPlayer1 = battle.player1Id === characterId;
        const opponentId = isPlayer1 ? battle.player2Id : battle.player1Id;
        const opponent = characters.get(opponentId);
        const didWin = battle.winnerId === characterId;
        const eloChange = isPlayer1 ? battle.player1EloChange : battle.player2EloChange;
        
        return {
          id: battle.id,
          opponentName: opponent?.name || "Unknown",
          didWin,
          eloChange,
          createdAt: battle.createdAt
        };
      });
    
    return { data: recentBattles, error: null };
  } catch (error: any) {
    console.error("Error fetching recent battles:", error);
    return { data: [], error: error.message };
  }
}

// Note: getCharacterById is imported from character-server.ts

// Get user battle statistics
export async function getUserBattleStats(userId: string) {
  try {
    const now = new Date();
    const restriction = battleRestrictions.get(userId);
    
    let dailyBattlesUsed = 0;
    let canBattleToday = true;
    
    if (restriction) {
      const lastBattleDate = restriction.lastBattleTime.toDateString();
      const currentDate = now.toDateString();
      
      if (lastBattleDate === currentDate) {
        dailyBattlesUsed = restriction.dailyBattleCount;
        canBattleToday = dailyBattlesUsed < DAILY_BATTLE_LIMIT;
      }
    }
    
    const stats = {
      dailyBattlesUsed,
      dailyBattlesRemaining: DAILY_BATTLE_LIMIT - dailyBattlesUsed,
      canBattleToday,
      dailyLimit: DAILY_BATTLE_LIMIT,
      cooldownMs: BATTLE_COOLDOWN_MS
    };
    
    return { data: stats, error: null };
  } catch (error: any) {
    console.error("Error getting user battle stats:", error);
    return { data: null, error: error.message };
  }
}