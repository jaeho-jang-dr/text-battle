import { adminDb } from "./firebase-admin";
import { Battle, Character } from "@/types";

// Transform database row to Character type
function transformCharacter(doc: any): Character {
  const data = doc.data ? doc.data() : doc;
  const id = doc.id || data.id;
  return {
    id,
    userId: data.userId || data.user_id,
    name: data.name,
    battleChat: data.battleChat || data.battle_chat,
    eloScore: data.eloScore || data.elo_score || 1000,
    wins: data.wins || 0,
    losses: data.losses || 0,
    isNPC: data.isNPC || data.is_npc || false,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.created_at?.toDate ? data.created_at.toDate() : new Date()),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updated_at?.toDate ? data.updated_at.toDate() : new Date())
  };
}

// Transform database row to Battle type
function transformBattle(doc: any): Battle {
  const data = doc.data ? doc.data() : doc;
  const id = doc.id || data.id;
  return {
    id,
    attackerId: data.attackerId || data.attacker_id,
    defenderId: data.defenderId || data.defender_id,
    winnerId: data.winnerId || data.winner_id,
    attackerScore: data.attackerScore || data.attacker_score,
    defenderScore: data.defenderScore || data.defender_score,
    battleLog: data.battleLog || data.battle_log,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.created_at?.toDate ? data.created_at.toDate() : new Date())
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
  try {
    // Use a transaction to ensure consistency
    const result = await adminDb.runTransaction(async (transaction) => {
      // Get both characters
      const attackerRef = adminDb.collection("characters").doc(attackerId);
      const defenderRef = adminDb.collection("characters").doc(defenderId);
      
      const attackerDoc = await transaction.get(attackerRef);
      const defenderDoc = await transaction.get(defenderRef);
      
      if (!attackerDoc.exists) {
        throw new Error("Attacker character not found");
      }
      
      if (!defenderDoc.exists) {
        throw new Error("Defender character not found");
      }
      
      const attacker = attackerDoc.data()!;
      const defender = defenderDoc.data()!;
      
      // Check if characters belong to the same user
      const attackerUserId = attacker.userId || attacker.user_id;
      const defenderUserId = defender.userId || defender.user_id;
      const attackerIsNPC = attacker.isNPC || attacker.is_npc || false;
      const defenderIsNPC = defender.isNPC || defender.is_npc || false;
      
      if (attackerUserId === defenderUserId && !attackerIsNPC && !defenderIsNPC) {
        throw new Error("Cannot battle your own character");
      }
      
      // Check battle restrictions for attacker
      const { canBattle: canAttack, error: attackError } = await checkBattleRestrictions(
        attackerUserId,
        attackerId,
        defenderId,
        true
      );
      
      if (!canAttack) {
        throw new Error(attackError || "Battle not allowed due to restrictions");
      }
      
      // Check battle restrictions for defender (if not NPC)
      if (!defenderIsNPC) {
        const { canBattle: canDefend, error: defendError } = await checkBattleRestrictions(
          defenderUserId,
          defenderId,
          attackerId,
          false
        );
        
        if (!canDefend) {
          throw new Error(defendError || "Defender cannot battle due to restrictions");
        }
      }
      
      // Simulate battle scoring
      const attackerChat = attacker.battleChat || attacker.battle_chat;
      const defenderChat = defender.battleChat || defender.battle_chat;
      const attackerEloScore = attacker.eloScore || attacker.elo_score || 1000;
      const defenderEloScore = defender.eloScore || defender.elo_score || 1000;
      
      const { attackerScore, defenderScore } = simulateBattleScore(
        attackerChat,
        defenderChat,
        attackerEloScore,
        defenderEloScore
      );
      
      // Determine winner
      const winnerId = attackerScore > defenderScore ? attackerId : defenderId;
      const attackerWon = winnerId === attackerId;
      
      // Calculate new ELO ratings
      const attackerWins = attacker.wins || 0;
      const attackerLosses = attacker.losses || 0;
      const defenderWins = defender.wins || 0;
      const defenderLosses = defender.losses || 0;
      
      const attackerGamesPlayed = attackerWins + attackerLosses;
      const defenderGamesPlayed = defenderWins + defenderLosses;
      
      const newAttackerElo = calculateNewElo(
        attackerEloScore,
        defenderEloScore,
        attackerWon,
        attackerGamesPlayed
      );
      
      const newDefenderElo = calculateNewElo(
        defenderEloScore,
        attackerEloScore,
        !attackerWon,
        defenderGamesPlayed
      );
      
      // Create battle log
      const battleLog = `${attacker.name} (${attackerScore}) vs ${defender.name} (${defenderScore}). Winner: ${attackerWon ? attacker.name : defender.name}`;
      
      // Create battle document
      const battleRef = adminDb.collection("battles").doc();
      const battleData = {
        attackerId: attackerId,
        defenderId: defenderId,
        winnerId: winnerId,
        attackerScore: attackerScore,
        defenderScore: defenderScore,
        battleLog: battleLog,
        created_at: new Date()
      };
      
      transaction.set(battleRef, battleData);
      
      // Update attacker stats
      transaction.update(attackerRef, {
        elo_score: newAttackerElo,
        wins: attackerWon ? attackerWins + 1 : attackerWins,
        losses: attackerWon ? attackerLosses : attackerLosses + 1,
        updated_at: new Date()
      });
      
      // Update defender stats
      transaction.update(defenderRef, {
        elo_score: newDefenderElo,
        wins: attackerWon ? defenderWins : defenderWins + 1,
        losses: attackerWon ? defenderLosses + 1 : defenderLosses,
        updated_at: new Date()
      });
      
      // Update battle restrictions for both players
      await updateBattleRestrictions(attackerUserId, attackerId, defenderId, true);
      if (!defenderIsNPC) {
        await updateBattleRestrictions(defenderUserId, defenderId, attackerId, false);
      }
      
      return { id: battleRef.id, ...battleData };
    });
    
    return { data: transformBattle(result) };
  } catch (error: any) {
    console.error("Failed to create battle:", error);
    return { error: error.message || "Failed to create battle" };
  }
}

// Get battle by ID
export async function getBattleById(
  battleId: string
): Promise<{ data?: Battle; error?: string }> {
  try {
    const battleDoc = await adminDb.collection("battles").doc(battleId).get();
    
    if (!battleDoc.exists) {
      return { error: "Battle not found" };
    }
    
    return { data: transformBattle(battleDoc) };
  } catch (error) {
    console.error("Failed to get battle:", error);
    return { error: "Battle not found" };
  }
}

// Get battle history for a character
export async function getBattleHistory(
  characterId: string,
  limitValue = 20,
  offset = 0
): Promise<{ data?: Battle[]; error?: string }> {
  try {
    // We need to do two queries and merge the results
    // Try both field naming conventions (camelCase and snake_case)
    const queries = [
      adminDb
        .collection("battles")
        .where("attackerId", "==", characterId)
        .orderBy("created_at", "desc")
        .limit(limitValue)
        .get()
        .catch(() => adminDb
          .collection("battles")
          .where("attacker_id", "==", characterId)
          .orderBy("created_at", "desc")
          .limit(limitValue)
          .get()),
      adminDb
        .collection("battles")
        .where("defenderId", "==", characterId)
        .orderBy("created_at", "desc")
        .limit(limitValue)
        .get()
        .catch(() => adminDb
          .collection("battles")
          .where("defender_id", "==", characterId)
          .orderBy("created_at", "desc")
          .limit(limitValue)
          .get())
    ];
    
    const [attackerSnapshot, defenderSnapshot] = await Promise.all(queries);
    
    // Merge and deduplicate battles
    const battleMap = new Map();
    [...attackerSnapshot.docs, ...defenderSnapshot.docs].forEach(doc => {
      battleMap.set(doc.id, transformBattle(doc));
    });
    
    // Sort by created_at and apply pagination
    const allBattles = Array.from(battleMap.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    const paginatedBattles = allBattles.slice(offset, offset + limitValue);
    
    return { data: paginatedBattles };
  } catch (error) {
    console.error("Failed to fetch battle history:", error);
    return { error: "Failed to fetch battle history" };
  }
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
  try {
    const { data: battle, error: battleError } = await getBattleById(battleId);
    
    if (battleError || !battle) {
      return { error: battleError || "Battle not found" };
    }
    
    const [attackerDoc, defenderDoc] = await Promise.all([
      adminDb.collection("characters").doc(battle.attackerId).get(),
      adminDb.collection("characters").doc(battle.defenderId).get()
    ]);
    
    if (!attackerDoc.exists || !defenderDoc.exists) {
      return { error: "Failed to load character data" };
    }
    
    return {
      data: {
        battle,
        attacker: transformCharacter(attackerDoc),
        defender: transformCharacter(defenderDoc)
      }
    };
  } catch (error) {
    console.error("Failed to get detailed battle:", error);
    return { error: "Failed to load battle details" };
  }
}

// Check if a user can battle (battle restrictions)
export async function checkBattleRestrictions(
  userId: string,
  characterId: string,
  opponentId: string,
  isAttacking: boolean
): Promise<{ canBattle: boolean; error?: string; remainingBattles?: number }> {
  try {
    // Get user's battle restrictions
    const restrictionsDoc = await adminDb.collection("battle_restrictions").doc(userId).get();
    const restrictions = restrictionsDoc.exists ? restrictionsDoc.data() : null;
    
    // Get game settings
    const settingsDoc = await adminDb.collection("game_settings").doc("default").get();
    const settings = settingsDoc.exists ? settingsDoc.data() : {};
    
    const dailyLimit = settings.daily_battle_limit || 10;
    const defensiveLimit = settings.defensive_battle_limit || 5;
    const attackLimit = settings.attack_battle_limit || 3;
    
    // Check and reset daily limit if needed
    const today = new Date().toISOString().split('T')[0];
    let currentDailyCount = 0;
    
    if (restrictions) {
      const lastReset = restrictions.last_reset_date?.toDate ? 
        restrictions.last_reset_date.toDate().toISOString().split('T')[0] : 
        restrictions.last_reset_date;
      
      // Reset daily count if it's a new day
      if (today !== lastReset) {
        currentDailyCount = 0;
      } else {
        currentDailyCount = restrictions.daily_battle_count || 0;
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
    const consecutiveSnapshot = await adminDb
      .collection("consecutive_battles")
      .where("character_id", "==", characterId)
      .where("opponent_id", "==", opponentId)
      .where("battle_type", "==", battleType)
      .limit(1)
      .get();
    
    if (!consecutiveSnapshot.empty) {
      const consecutiveData = consecutiveSnapshot.docs[0].data();
      const limitValue = isAttacking ? attackLimit : defensiveLimit;
      if (consecutiveData.count >= limitValue) {
        return { 
          canBattle: false, 
          error: `Cannot ${battleType} the same opponent more than ${limitValue} times consecutively`,
          remainingBattles: dailyLimit - currentDailyCount
        };
      }
    }
    
    return { 
      canBattle: true,
      remainingBattles: dailyLimit - currentDailyCount
    };
  } catch (error: any) {
    console.error("Failed to check battle restrictions:", error);
    console.error("Error details:", error.message, error.stack);
    return { canBattle: false, error: "Failed to check battle restrictions: " + error.message };
  }
}

// Update battle restrictions after a battle
export async function updateBattleRestrictions(
  userId: string,
  characterId: string,
  opponentId: string,
  isAttacking: boolean
): Promise<{ error?: string }> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Update daily battle count
    const restrictionsRef = adminDb.collection("battle_restrictions").doc(userId);
    const restrictionsDoc = await restrictionsRef.get();
    
    if (restrictionsDoc.exists) {
      const data = restrictionsDoc.data()!;
      const lastReset = data.last_reset_date?.toDate ? 
        data.last_reset_date.toDate().toISOString().split('T')[0] : 
        data.last_reset_date;
      const newCount = today === lastReset ? (data.daily_battle_count || 0) + 1 : 1;
      
      await restrictionsRef.update({
        daily_battle_count: newCount,
        last_reset_date: today,
        updated_at: new Date()
      });
    } else {
      await restrictionsRef.set({
        user_id: userId,
        daily_battle_count: 1,
        last_reset_date: today,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    // Update consecutive battle count
    const battleType = isAttacking ? 'attack' : 'defense';
    
    // Reset consecutive count for other opponents
    const resetSnapshot = await adminDb
      .collection("consecutive_battles")
      .where("character_id", "==", characterId)
      .where("battle_type", "==", battleType)
      .where("opponent_id", "!=", opponentId)
      .get();
    
    const resetPromises = resetSnapshot.docs.map(doc => 
      doc.ref.update({ count: 0, updated_at: new Date() })
    );
    await Promise.all(resetPromises);
    
    // Update consecutive battle count for this opponent
    const currentSnapshot = await adminDb
      .collection("consecutive_battles")
      .where("character_id", "==", characterId)
      .where("opponent_id", "==", opponentId)
      .where("battle_type", "==", battleType)
      .limit(1)
      .get();
    
    if (!currentSnapshot.empty) {
      const docRef = currentSnapshot.docs[0].ref;
      const currentData = currentSnapshot.docs[0].data();
      await docRef.update({
        count: (currentData.count || 0) + 1,
        updated_at: new Date()
      });
    } else {
      await adminDb.collection("consecutive_battles").add({
        character_id: characterId,
        opponent_id: opponentId,
        battle_type: battleType,
        count: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    return {};
  } catch (error) {
    console.error("Failed to update battle restrictions:", error);
    return { error: "Failed to update battle restrictions" };
  }
}

// Reset daily battle count for a user
export async function resetDailyBattleCount(userId: string): Promise<{ error?: string }> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const restrictionsRef = doc(db, "battle_restrictions", userId);
    
    await setDoc(restrictionsRef, {
      user_id: userId,
      daily_battle_count: 0,
      last_reset_date: today,
      updated_at: serverTimestamp()
    }, { merge: true });
    
    return {};
  } catch (error) {
    console.error("Failed to reset daily battle count:", error);
    return { error: "Failed to reset daily battle count" };
  }
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
  try {
    // Get game settings
    const settingsRef = doc(db, "game_settings", "default");
    const settingsDoc = await getDoc(settingsRef);
    const settings = settingsDoc.exists() ? settingsDoc.data() : {};
    const dailyLimit = settings.daily_battle_limit || 10;
    
    // Get user's battle restrictions
    const restrictionsRef = doc(db, "battle_restrictions", userId);
    const restrictionsDoc = await getDoc(restrictionsRef);
    
    const today = new Date().toISOString().split('T')[0];
    
    if (!restrictionsDoc.exists()) {
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
    
    const restrictions = restrictionsDoc.data();
    const lastReset = restrictions.last_reset_date?.toDate ? 
      restrictions.last_reset_date.toDate().toISOString().split('T')[0] : 
      restrictions.last_reset_date;
    const dailyBattlesUsed = today === lastReset ? (restrictions.daily_battle_count || 0) : 0;
    
    return {
      data: {
        dailyBattlesUsed,
        dailyBattlesRemaining: Math.max(0, dailyLimit - dailyBattlesUsed),
        lastResetDate: restrictions.last_reset_date,
        canBattleToday: dailyBattlesUsed < dailyLimit
      }
    };
  } catch (error) {
    console.error("Failed to get user battle stats:", error);
    return { error: "Failed to get battle statistics" };
  }
}

// Reset all daily battle counts (for scheduled job)
export async function resetAllDailyBattleCounts(): Promise<{ error?: string }> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const restrictionsRef = collection(db, "battle_restrictions");
    const snapshot = await getDocs(restrictionsRef);
    
    const updatePromises = snapshot.docs
      .filter(doc => {
        const data = doc.data();
        const lastReset = data.last_reset_date?.toDate ? 
          data.last_reset_date.toDate().toISOString().split('T')[0] : 
          data.last_reset_date;
        return lastReset < today;
      })
      .map(doc => 
        updateDoc(doc.ref, {
          daily_battle_count: 0,
          last_reset_date: today,
          updated_at: serverTimestamp()
        })
      );
    
    await Promise.all(updatePromises);
    return {};
  } catch (error) {
    console.error("Failed to reset all daily battle counts:", error);
    return { error: "Failed to reset all daily battle counts" };
  }
}