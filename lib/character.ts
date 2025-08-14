import { adminDb } from "./firebase-admin";
import { Character } from "@/types";

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
  console.log("Creating character for user:", userId, "with name:", name);
  
  // Validate inputs
  const nameValidation = validateCharacterName(name);
  if (!nameValidation.valid) {
    console.error("Name validation failed:", nameValidation.error);
    return { error: nameValidation.error };
  }
  
  const chatValidation = validateBattleChat(battleChat);
  if (!chatValidation.valid) {
    console.error("Chat validation failed:", chatValidation.error);
    return { error: chatValidation.error };
  }
  
  try {
    // Check if user already has a character
    console.log("Checking for existing character...");
    const existingSnapshot = await adminDb
      .collection("characters")
      .where("userId", "==", userId)
      .where("isNPC", "==", false)
      .limit(1)
      .get();
      
    console.log("Existing character check - empty?", existingSnapshot.empty);
    
    if (!existingSnapshot.empty) {
      console.log("User already has a character");
      return { error: "You already have a character" };
    }
  } catch (error) {
    console.error("Error checking existing character:", error);
    // Continue with creation even if check fails
  }
  
  // Create the character
  try {
    const characterData = {
      userId: userId,
      name: name.trim(),
      battleChat: battleChat.trim(),
      eloScore: 1000,
      wins: 0,
      losses: 0,
      isNPC: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log("Saving character to database:", characterData);
    const docRef = await adminDb.collection("characters").add(characterData);
    console.log("Character saved with ID:", docRef.id);
    
    const createdDoc = await docRef.get();
    const createdData = createdDoc.data();
    console.log("Retrieved created character:", createdData);
    
    const transformed = transformCharacter({ id: docRef.id, ...createdData });
    console.log("Transformed character:", transformed);
    
    return { data: transformed };
  } catch (error: any) {
    console.error("Failed to create character:", error);
    console.error("Error details:", error.message, error.stack);
    return { error: "Failed to create character: " + error.message };
  }
}

// Get character by ID
export async function getCharacterById(
  characterId: string
): Promise<{ data?: Character; error?: string }> {
  try {
    const characterDoc = await adminDb.collection("characters").doc(characterId).get();
    
    if (!characterDoc.exists) {
      return { error: "Character not found" };
    }
    
    return { data: transformCharacter(characterDoc) };
  } catch (error) {
    console.error("Failed to get character:", error);
    return { error: "Character not found" };
  }
}

// Get character by user ID
export async function getCharacterByUserId(
  userId: string
): Promise<{ data?: Character; error?: string }> {
  try {
    const snapshot = await adminDb
      .collection("characters")
      .where("userId", "==", userId)
      .where("isNPC", "==", false)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return { error: "Character not found" };
    }
    
    const doc = snapshot.docs[0];
    return { data: transformCharacter(doc) };
  } catch (error) {
    console.error("Failed to get character by user ID:", error);
    return { error: "Character not found" };
  }
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
  try {
    const characterRef = doc(db, "characters", characterId);
    const characterDoc = await getDoc(characterRef);
    
    if (!characterDoc.exists() || characterDoc.data()?.user_id !== userId) {
      return { error: "Unauthorized" };
    }
    
    // Update the battle chat
    await updateDoc(characterRef, {
      battle_chat: battleChat.trim(),
      updated_at: serverTimestamp()
    });
    
    // Get updated document
    const updatedDoc = await getDoc(characterRef);
    return { data: transformCharacter(updatedDoc.id, updatedDoc.data()) };
  } catch (error) {
    console.error("Failed to update character:", error);
    return { error: "Failed to update character" };
  }
}

// Get all characters (for leaderboard, etc.)
export async function getAllCharacters(
  limitValue = 100,
  offset = 0
): Promise<{ data?: Character[]; error?: string }> {
  try {
    const charactersRef = collection(db, "characters");
    const q = query(
      charactersRef,
      orderBy("elo_score", "desc"),
      limit(limitValue + offset)
    );
    const snapshot = await getDocs(q);
    
    const allCharacters = snapshot.docs.map(doc => transformCharacter(doc.id, doc.data()));
    const paginatedCharacters = allCharacters.slice(offset);
    
    return { data: paginatedCharacters };
  } catch (error) {
    console.error("Failed to fetch characters:", error);
    return { error: "Failed to fetch characters" };
  }
}

// Get top characters for leaderboard
export async function getTopCharacters(
  limitValue = 10
): Promise<{ data?: Character[]; error?: string }> {
  try {
    const charactersRef = collection(db, "characters");
    const q = query(
      charactersRef,
      orderBy("elo_score", "desc"),
      limit(limitValue)
    );
    const snapshot = await getDocs(q);
    
    const characters = snapshot.docs.map(doc => transformCharacter(doc.id, doc.data()));
    return { data: characters };
  } catch (error) {
    console.error("Failed to fetch top characters:", error);
    return { error: "Failed to fetch top characters" };
  }
}

// Check if a character name is available
export async function isCharacterNameAvailable(
  name: string
): Promise<boolean> {
  try {
    const snapshot = await adminDb
      .collection("characters")
      .where("name", "==", name.trim())
      .limit(1)
      .get();
    
    return snapshot.empty;
  } catch (error) {
    console.error("Failed to check character name availability:", error);
    return false;
  }
}