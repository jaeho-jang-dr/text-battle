// Server-side only character operations
// This file should only be imported in API routes

import { memoryStore } from "./db/memory-store";

const characters = memoryStore.characters;

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

// Get character by ID
export async function getCharacterById(characterId: string) {
  try {
    const character = await memoryStore.getCharacterById(characterId);
    
    if (!character) {
      return { data: null, error: "Character not found" };
    }
    
    return { data: character, error: null };
  } catch (error: any) {
    console.error("Error fetching character:", error);
    return { data: null, error: error.message };
  }
}

// Note: updateCharacter function is defined below with proper typing

// Get all characters
export async function getAllCharacters(limit = 100, offset = 0) {
  try {
    const allChars = Array.from(characters.values())
      .sort((a, b) => (b.eloScore || b.rating || 1000) - (a.eloScore || a.rating || 1000))
      .slice(offset, offset + limit);
    
    return { data: allChars, error: null };
  } catch (error: any) {
    console.error("Error fetching characters:", error);
    return { data: null, error: error.message };
  }
}

// Get character by user ID (for backward compatibility - returns first character)
export async function getCharacterByUserId(userId: string) {
  try {
    const character = Array.from(characters.values()).find(
      char => char.userId === userId
    );
    
    if (!character) {
      return { data: null, error: "Character not found" };
    }
    
    return { data: character, error: null };
  } catch (error: any) {
    console.error("Error fetching character by user ID:", error);
    return { data: null, error: error.message };
  }
}

// Get all characters by user ID
export async function getCharactersByUserId(userId: string) {
  try {
    const userCharacters = Array.from(characters.values()).filter(
      char => char.userId === userId
    );
    
    return { data: userCharacters, error: null };
  } catch (error: any) {
    console.error("Error fetching characters by user ID:", error);
    return { data: null, error: error.message };
  }
}

// Count characters by user ID
export async function countCharactersByUserId(userId: string) {
  try {
    const count = Array.from(characters.values()).filter(
      char => char.userId === userId
    ).length;
    
    return { data: count, error: null };
  } catch (error: any) {
    console.error("Error counting characters:", error);
    return { data: 0, error: error.message };
  }
}

// Create a new character
export async function createCharacter(userId: string, name: string, battleChat: string) {
  try {
    // Validate input
    const nameValidation = validateCharacterName(name);
    if (!nameValidation.valid) {
      return { data: null, error: nameValidation.error };
    }
    
    const chatValidation = validateBattleChat(battleChat);
    if (!chatValidation.valid) {
      return { data: null, error: chatValidation.error };
    }
    
    // Check if user has reached character limit (3)
    const userCharacters = Array.from(characters.values()).filter(
      char => char.userId === userId
    );
    
    if (userCharacters.length >= 3) {
      return { data: null, error: "Maximum character limit (3) reached" };
    }
    
    // Check if name is already taken
    const nameTaken = Array.from(characters.values()).some(
      char => char.name.toLowerCase() === name.toLowerCase()
    );
    
    if (nameTaken) {
      return { data: null, error: "Character name is already taken" };
    }
    
    // Create new character
    const characterId = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newCharacter = {
      id: characterId,
      userId,
      name,
      battleChat,
      eloScore: 1000,
      wins: 0,
      losses: 0,
      totalBattles: 0,
      isNPC: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    characters.set(characterId, newCharacter);
    
    return { data: newCharacter, error: null };
  } catch (error: any) {
    console.error("Error creating character:", error);
    return { data: null, error: error.message };
  }
}

// Update character
export async function updateCharacter(
  characterId: string,
  updates: Partial<{
    battleChat: string;
    wins: number;
    losses: number;
    eloScore: number;
  }>
) {
  try {
    const character = characters.get(characterId);
    
    if (!character) {
      return { data: null, error: "Character not found" };
    }
    
    // Validate battle chat if provided
    if (updates.battleChat !== undefined) {
      const chatValidation = validateBattleChat(updates.battleChat);
      if (!chatValidation.valid) {
        return { data: null, error: chatValidation.error };
      }
    }
    
    // Update character
    const updatedCharacter = {
      ...character,
      ...updates,
      updatedAt: new Date()
    };
    
    characters.set(characterId, updatedCharacter);
    
    return { data: updatedCharacter, error: null };
  } catch (error: any) {
    console.error("Error updating character:", error);
    return { data: null, error: error.message };
  }
}

// Get a random NPC for battle
export async function getRandomNPC(excludeIds: string[] = []) {
  try {
    const npcs = Array.from(characters.values()).filter(
      char => char.isNPC && !excludeIds.includes(char.id)
    );
    
    if (npcs.length === 0) {
      return { data: null, error: "No NPCs available" };
    }
    
    const randomIndex = Math.floor(Math.random() * npcs.length);
    return { data: npcs[randomIndex], error: null };
  } catch (error: any) {
    console.error("Error getting random NPC:", error);
    return { data: null, error: error.message };
  }
}

// Delete character
export async function deleteCharacter(characterId: string, userId: string) {
  try {
    const character = characters.get(characterId);
    
    if (!character) {
      return { success: false, error: "Character not found" };
    }
    
    // Verify ownership
    if (character.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Delete the character
    characters.delete(characterId);
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error deleting character:", error);
    return { success: false, error: error.message };
  }
}