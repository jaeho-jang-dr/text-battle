import { supabase } from "./supabase";
import { Character } from "@/types";

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

// Character name validation
export const validateCharacterName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Character name is required" };
  }
  
  if (name.length > 10) {
    return { valid: false, error: "Character name must be 10 characters or less" };
  }
  
  // Check for inappropriate characters
  const validNameRegex = /^[a-zA-Z0-9가-힣\s_-]+$/;
  if (!validNameRegex.test(name)) {
    return { valid: false, error: "Character name contains invalid characters" };
  }
  
  return { valid: true };
};

// Battle chat validation
export const validateBattleChat = (battleChat: string): { valid: boolean; error?: string } => {
  if (!battleChat || battleChat.trim().length === 0) {
    return { valid: false, error: "Battle chat is required" };
  }
  
  if (battleChat.length > 100) {
    return { valid: false, error: "Battle chat must be 100 characters or less" };
  }
  
  return { valid: true };
};

// Create a new character
export async function createCharacter(
  userId: string,
  name: string,
  battleChat: string
): Promise<{ data?: Character; error?: string }> {
  // Validate inputs
  const nameValidation = validateCharacterName(name);
  if (!nameValidation.valid) {
    return { error: nameValidation.error };
  }
  
  const chatValidation = validateBattleChat(battleChat);
  if (!chatValidation.valid) {
    return { error: chatValidation.error };
  }
  
  // Check if user already has a character
  const { data: existingCharacter } = await supabase
    .from("characters")
    .select("id")
    .eq("user_id", userId)
    .eq("is_npc", false)
    .single();
    
  if (existingCharacter) {
    return { error: "You already have a character" };
  }
  
  // Create the character
  const { data, error } = await supabase
    .from("characters")
    .insert({
      user_id: userId,
      name: name.trim(),
      battle_chat: battleChat.trim(),
      elo_score: 1000,
      wins: 0,
      losses: 0,
      is_npc: false,
    })
    .select()
    .single();
    
  if (error) {
    return { error: "Failed to create character" };
  }
  
  return { data: transformCharacter(data) };
}

// Get character by ID
export async function getCharacterById(
  characterId: string
): Promise<{ data?: Character; error?: string }> {
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("id", characterId)
    .single();
    
  if (error || !data) {
    return { error: "Character not found" };
  }
  
  return { data: transformCharacter(data) };
}

// Get character by user ID
export async function getCharacterByUserId(
  userId: string
): Promise<{ data?: Character; error?: string }> {
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", userId)
    .eq("is_npc", false)
    .single();
    
  if (error || !data) {
    return { error: "Character not found" };
  }
  
  return { data: transformCharacter(data) };
}

// Update character battle chat
export async function updateCharacterBattleChat(
  characterId: string,
  userId: string,
  battleChat: string
): Promise<{ data?: Character; error?: string }> {
  // Validate battle chat
  const chatValidation = validateBattleChat(battleChat);
  if (!chatValidation.valid) {
    return { error: chatValidation.error };
  }
  
  // Verify ownership
  const { data: character } = await supabase
    .from("characters")
    .select("user_id")
    .eq("id", characterId)
    .single();
    
  if (!character || character.user_id !== userId) {
    return { error: "Unauthorized" };
  }
  
  // Update the battle chat
  const { data, error } = await supabase
    .from("characters")
    .update({
      battle_chat: battleChat.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", characterId)
    .select()
    .single();
    
  if (error) {
    return { error: "Failed to update character" };
  }
  
  return { data: transformCharacter(data) };
}

// Get all characters (for leaderboard, etc.)
export async function getAllCharacters(
  limit = 100,
  offset = 0
): Promise<{ data?: Character[]; error?: string }> {
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .order("elo_score", { ascending: false })
    .range(offset, offset + limit - 1);
    
  if (error) {
    return { error: "Failed to fetch characters" };
  }
  
  return { data: (data || []).map(transformCharacter) };
}

// Get top characters for leaderboard
export async function getTopCharacters(
  limit = 10
): Promise<{ data?: Character[]; error?: string }> {
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .order("elo_score", { ascending: false })
    .limit(limit);
    
  if (error) {
    return { error: "Failed to fetch top characters" };
  }
  
  return { data: (data || []).map(transformCharacter) };
}

// Check if a character name is available
export async function isCharacterNameAvailable(
  name: string
): Promise<boolean> {
  const { data } = await supabase
    .from("characters")
    .select("id")
    .eq("name", name.trim())
    .single();
    
  return !data;
}