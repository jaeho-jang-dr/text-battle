import { supabase } from "./supabase";
import { Battle, Character } from "@/types";

// Transform database row to Character type
function transformCharacter(row: any): Character {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    battleChat: row.battle_chat,
    eloScore: row.elo_score,
    wins: row.wins,
    losses: row.losses,
    isNPC: row.is_npc,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

// Transform database row to Battle type
function transformBattle(row: any): Battle {
  return {
    id: row.id,
    attackerId: row.attacker_id,
    defenderId: row.defender_id,
    winnerId: row.winner_id,
    attackerScore: row.attacker_score,
    defenderScore: row.defender_score,
    battleLog: row.battle_log,
    createdAt: new Date(row.created_at)
  };
}

// ELO rating calculation constants
const DEFAULT_ELO = 1000;
const K_FACTOR_NEW_PLAYER = 32;  // For players with < 30 games
const K_FACTOR_EXPERIENCED = 16;  // For experienced players
const NEW_PLAYER_GAME_THRESHOLD = 30;

// Battle scoring constants
const BASE_SCORE = 100;
const ELO_MULTIPLIER = 0.1;

// Calculate K-factor based on games played
function getKFactor(gamesPlayed: number): number {
  return gamesPlayed < NEW_PLAYER_GAME_THRESHOLD ? K_FACTOR_NEW_PLAYER : K_FACTOR_EXPERIENCED;
}

// Calculate expected score for ELO rating
function getExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

// Calculate new ELO rating
function calculateNewElo(
  currentRating: number,
  opponentRating: number,
  won: boolean,
  gamesPlayed: number
): number {
  const kFactor = getKFactor(gamesPlayed);
  const expectedScore = getExpectedScore(currentRating, opponentRating);
  const actualScore = won ? 1 : 0;
  
  return Math.round(currentRating + kFactor * (actualScore - expectedScore));
}

// Simulate AI battle scoring (to be replaced with actual AI later)
function simulateBattleScore(
  attackerChat: string,
  defenderChat: string,
  attackerElo: number,
  defenderElo: number
): { attackerScore: number; defenderScore: number } {
  // Simulate scoring based on chat length, complexity, and ELO difference
  const attackerBaseScore = Math.floor(Math.random() * 50) + 50;
  const defenderBaseScore = Math.floor(Math.random() * 50) + 50;
  
  // Add length bonus (up to 20 points)
  const attackerLengthBonus = Math.min(attackerChat.length / 5, 20);
  const defenderLengthBonus = Math.min(defenderChat.length / 5, 20);
  
  // Add complexity bonus (count unique words)
  const attackerWords = new Set(attackerChat.toLowerCase().split(/\s+/));
  const defenderWords = new Set(defenderChat.toLowerCase().split(/\s+/));
  const attackerComplexityBonus = Math.min(attackerWords.size * 2, 30);
  const defenderComplexityBonus = Math.min(defenderWords.size * 2, 30);
  
  // Calculate final scores
  const attackerFinalScore = Math.round(
    attackerBaseScore + attackerLengthBonus + attackerComplexityBonus
  );
  const defenderFinalScore = Math.round(
    defenderBaseScore + defenderLengthBonus + defenderComplexityBonus
  );
  
  return {
    attackerScore: attackerFinalScore,
    defenderScore: defenderFinalScore
  };
}

// Create a new battle
export async function createBattle(
  attackerId: string,
  defenderId: string
): Promise<{ data?: Battle; error?: string }> {
  // Validate that both characters exist
  const { data: attacker, error: attackerError } = await supabase
    .from("characters")
    .select("*")
    .eq("id", attackerId)
    .single();
    
  if (attackerError || !attacker) {
    return { error: "Attacker character not found" };
  }
  
  const { data: defender, error: defenderError } = await supabase
    .from("characters")
    .select("*")
    .eq("id", defenderId)
    .single();
    
  if (defenderError || !defender) {
    return { error: "Defender character not found" };
  }
  
  // Check if characters belong to the same user
  if (attacker.user_id === defender.user_id && !attacker.is_npc && !defender.is_npc) {
    return { error: "Cannot battle your own character" };
  }
  
  // Check battle restrictions for attacker
  const { canBattle: canAttack, error: attackError } = await checkBattleRestrictions(
    attacker.user_id,
    attackerId,
    defenderId,
    true
  );
  
  if (!canAttack) {
    return { error: attackError || "Battle not allowed due to restrictions" };
  }
  
  // Check battle restrictions for defender (if not NPC)
  if (!defender.is_npc) {
    const { canBattle: canDefend, error: defendError } = await checkBattleRestrictions(
      defender.user_id,
      defenderId,
      attackerId,
      false
    );
    
    if (!canDefend) {
      return { error: defendError || "Defender cannot battle due to restrictions" };
    }
  }
  
  // Simulate battle scoring
  const { attackerScore, defenderScore } = simulateBattleScore(
    attacker.battle_chat,
    defender.battle_chat,
    attacker.elo_score,
    defender.elo_score
  );
  
  // Determine winner
  const winnerId = attackerScore > defenderScore ? attackerId : defenderId;
  const attackerWon = winnerId === attackerId;
  
  // Calculate new ELO ratings
  const attackerGamesPlayed = attacker.wins + attacker.losses;
  const defenderGamesPlayed = defender.wins + defender.losses;
  
  const newAttackerElo = calculateNewElo(
    attacker.elo_score,
    defender.elo_score,
    attackerWon,
    attackerGamesPlayed
  );
  
  const newDefenderElo = calculateNewElo(
    defender.elo_score,
    attacker.elo_score,
    !attackerWon,
    defenderGamesPlayed
  );
  
  // Create battle log
  const battleLog = `${attacker.name} (${attackerScore}) vs ${defender.name} (${defenderScore}). Winner: ${attackerWon ? attacker.name : defender.name}`;
  
  // Start a transaction to update everything
  const { data: battle, error: battleError } = await supabase
    .from("battles")
    .insert({
      attacker_id: attackerId,
      defender_id: defenderId,
      winner_id: winnerId,
      attacker_score: attackerScore,
      defender_score: defenderScore,
      battle_log: battleLog
    })
    .select()
    .single();
    
  if (battleError) {
    return { error: "Failed to create battle" };
  }
  
  // Update attacker stats
  const { error: attackerUpdateError } = await supabase
    .from("characters")
    .update({
      elo_score: newAttackerElo,
      wins: attackerWon ? attacker.wins + 1 : attacker.wins,
      losses: attackerWon ? attacker.losses : attacker.losses + 1,
      updated_at: new Date().toISOString()
    })
    .eq("id", attackerId);
    
  if (attackerUpdateError) {
    return { error: "Failed to update attacker stats" };
  }
  
  // Update defender stats
  const { error: defenderUpdateError } = await supabase
    .from("characters")
    .update({
      elo_score: newDefenderElo,
      wins: attackerWon ? defender.wins : defender.wins + 1,
      losses: attackerWon ? defender.losses + 1 : defender.losses,
      updated_at: new Date().toISOString()
    })
    .eq("id", defenderId);
    
  if (defenderUpdateError) {
    return { error: "Failed to update defender stats" };
  }
  
  // Update battle restrictions for both players
  await updateBattleRestrictions(attacker.user_id, attackerId, defenderId, true);
  if (!defender.is_npc) {
    await updateBattleRestrictions(defender.user_id, defenderId, attackerId, false);
  }
  
  return { data: transformBattle(battle) };
}

// Get battle by ID
export async function getBattleById(
  battleId: string
): Promise<{ data?: Battle; error?: string }> {
  const { data, error } = await supabase
    .from("battles")
    .select("*")
    .eq("id", battleId)
    .single();
    
  if (error || !data) {
    return { error: "Battle not found" };
  }
  
  return { data: transformBattle(data) };
}

// Get battle history for a character
export async function getBattleHistory(
  characterId: string,
  limit = 20,
  offset = 0
): Promise<{ data?: Battle[]; error?: string }> {
  const { data, error } = await supabase
    .from("battles")
    .select("*")
    .or(`attacker_id.eq.${characterId},defender_id.eq.${characterId}`)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
    
  if (error) {
    return { error: "Failed to fetch battle history" };
  }
  
  return { data: (data || []).map(transformBattle) };
}

// Get detailed battle with character information
export async function getDetailedBattle(
  battleId: string
): Promise<{ 
  data?: {
    battle: Battle;
    attacker: Character;
    defender: Character;
  };
  error?: string;
}> {
  const { data: battle, error: battleError } = await getBattleById(battleId);
  
  if (battleError || !battle) {
    return { error: battleError || "Battle not found" };
  }
  
  const { data: attacker } = await supabase
    .from("characters")
    .select("*")
    .eq("id", battle.attackerId)
    .single();
    
  const { data: defender } = await supabase
    .from("characters")
    .select("*")
    .eq("id", battle.defenderId)
    .single();
    
  if (!attacker || !defender) {
    return { error: "Failed to load character data" };
  }
  
  return {
    data: {
      battle,
      attacker: transformCharacter(attacker),
      defender: transformCharacter(defender)
    }
  };
}

// Check if a user can battle (battle restrictions)
export async function checkBattleRestrictions(
  userId: string,
  characterId: string,
  opponentId: string,
  isAttacking: boolean
): Promise<{ canBattle: boolean; error?: string; remainingBattles?: number }> {
  // Get user's battle restrictions
  const { data: restrictions } = await supabase
    .from("battle_restrictions")
    .select("*")
    .eq("user_id", userId)
    .single();
    
  // Get game settings
  const { data: settings } = await supabase
    .from("game_settings")
    .select("*")
    .single();
    
  const dailyLimit = settings?.daily_battle_limit || 10;
  const defensiveLimit = settings?.defensive_battle_limit || 5;
  const attackLimit = settings?.attack_battle_limit || 3;
  
  // Check and reset daily limit if needed
  const today = new Date().toISOString().split('T')[0];
  let currentDailyCount = 0;
  
  if (restrictions) {
    const lastReset = new Date(restrictions.last_reset_date).toISOString().split('T')[0];
    
    // Reset daily count if it's a new day
    if (today !== lastReset) {
      await resetDailyBattleCount(userId);
      currentDailyCount = 0;
    } else {
      currentDailyCount = restrictions.daily_battle_count;
    }
    
    // Check daily limit
    if (currentDailyCount >= dailyLimit) {
      return { 
        canBattle: false, 
        error: "Daily battle limit reached",
        remainingBattles: 0
      };
    }
  }
  
  // Check consecutive battle limits
  const battleType = isAttacking ? 'attack' : 'defense';
  const { data: consecutiveBattles } = await supabase
    .from("consecutive_battles")
    .select("count")
    .eq("character_id", characterId)
    .eq("opponent_id", opponentId)
    .eq("battle_type", battleType)
    .single();
    
  if (consecutiveBattles) {
    const limit = isAttacking ? attackLimit : defensiveLimit;
    if (consecutiveBattles.count >= limit) {
      return { 
        canBattle: false, 
        error: `Cannot ${battleType} the same opponent more than ${limit} times consecutively`,
        remainingBattles: dailyLimit - currentDailyCount
      };
    }
  }
  
  return { 
    canBattle: true,
    remainingBattles: dailyLimit - currentDailyCount
  };
}

// Update battle restrictions after a battle
export async function updateBattleRestrictions(
  userId: string,
  characterId: string,
  opponentId: string,
  isAttacking: boolean
): Promise<{ error?: string }> {
  const today = new Date().toISOString().split('T')[0];
  
  // Get current restrictions
  const { data: currentRestrictions } = await supabase
    .from("battle_restrictions")
    .select("*")
    .eq("user_id", userId)
    .single();
  
  // Update daily battle count
  if (currentRestrictions) {
    const lastReset = new Date(currentRestrictions.last_reset_date).toISOString().split('T')[0];
    const newCount = today === lastReset ? currentRestrictions.daily_battle_count + 1 : 1;
    
    const { error: updateError } = await supabase
      .from("battle_restrictions")
      .update({
        daily_battle_count: newCount,
        last_reset_date: today,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);
      
    if (updateError) {
      console.error("Failed to update battle restrictions:", updateError);
    }
  } else {
    // Create new restriction record
    const { error: insertError } = await supabase
      .from("battle_restrictions")
      .insert({
        user_id: userId,
        daily_battle_count: 1,
        last_reset_date: today,
        updated_at: new Date().toISOString()
      });
      
    if (insertError) {
      console.error("Failed to create battle restrictions:", insertError);
    }
  }
  
  // Get current consecutive battle count
  const battleType = isAttacking ? 'attack' : 'defense';
  const { data: currentConsecutive } = await supabase
    .from("consecutive_battles")
    .select("*")
    .eq("character_id", characterId)
    .eq("opponent_id", opponentId)
    .eq("battle_type", battleType)
    .single();
  
  // Reset consecutive count for other opponents
  await supabase
    .from("consecutive_battles")
    .update({ count: 0, updated_at: new Date().toISOString() })
    .eq("character_id", characterId)
    .eq("battle_type", battleType)
    .neq("opponent_id", opponentId);
  
  // Update consecutive battle count for this opponent
  if (currentConsecutive) {
    const { error: updateError } = await supabase
      .from("consecutive_battles")
      .update({
        count: currentConsecutive.count + 1,
        updated_at: new Date().toISOString()
      })
      .eq("id", currentConsecutive.id);
      
    if (updateError) {
      console.error("Failed to update consecutive battles:", updateError);
    }
  } else {
    // Create new consecutive battle record
    const { error: insertError } = await supabase
      .from("consecutive_battles")
      .insert({
        character_id: characterId,
        opponent_id: opponentId,
        battle_type: battleType,
        count: 1,
        updated_at: new Date().toISOString()
      });
      
    if (insertError) {
      console.error("Failed to create consecutive battles:", insertError);
    }
  }
  
  return {};
}

// Reset daily battle count for a user
export async function resetDailyBattleCount(userId: string): Promise<{ error?: string }> {
  const today = new Date().toISOString().split('T')[0];
  
  const { error } = await supabase
    .from("battle_restrictions")
    .upsert({
      user_id: userId,
      daily_battle_count: 0,
      last_reset_date: today,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });
    
  if (error) {
    console.error("Failed to reset daily battle count:", error);
    return { error: "Failed to reset daily battle count" };
  }
  
  return {};
}

// Get user's battle statistics and restrictions
export async function getUserBattleStats(userId: string): Promise<{
  data?: {
    dailyBattlesUsed: number;
    dailyBattlesRemaining: number;
    lastResetDate: string;
    canBattleToday: boolean;
  };
  error?: string;
}> {
  // Get game settings
  const { data: settings } = await supabase
    .from("game_settings")
    .select("*")
    .single();
    
  const dailyLimit = settings?.daily_battle_limit || 10;
  
  // Get user's battle restrictions
  const { data: restrictions } = await supabase
    .from("battle_restrictions")
    .select("*")
    .eq("user_id", userId)
    .single();
    
  const today = new Date().toISOString().split('T')[0];
  
  if (!restrictions) {
    // No restrictions yet, user hasn't battled
    return {
      data: {
        dailyBattlesUsed: 0,
        dailyBattlesRemaining: dailyLimit,
        lastResetDate: today,
        canBattleToday: true
      }
    };
  }
  
  const lastReset = new Date(restrictions.last_reset_date).toISOString().split('T')[0];
  const dailyBattlesUsed = today === lastReset ? restrictions.daily_battle_count : 0;
  
  return {
    data: {
      dailyBattlesUsed,
      dailyBattlesRemaining: Math.max(0, dailyLimit - dailyBattlesUsed),
      lastResetDate: restrictions.last_reset_date,
      canBattleToday: dailyBattlesUsed < dailyLimit
    }
  };
}

// Reset all daily battle counts (for scheduled job)
export async function resetAllDailyBattleCounts(): Promise<{ error?: string }> {
  const today = new Date().toISOString().split('T')[0];
  
  const { error } = await supabase
    .from("battle_restrictions")
    .update({
      daily_battle_count: 0,
      last_reset_date: today,
      updated_at: new Date().toISOString()
    })
    .lt("last_reset_date", today);
    
  if (error) {
    console.error("Failed to reset all daily battle counts:", error);
    return { error: "Failed to reset all daily battle counts" };
  }
  
  return {};
}