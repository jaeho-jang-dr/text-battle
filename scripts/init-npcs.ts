import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { npcCharacters } from '../lib/npc-data';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore(app);

async function initializeNPCs() {
  console.log('Starting NPC initialization...');

  try {
    // Check if NPCs already exist
    const charactersRef = db.collection('characters');
    const existingNPCsSnapshot = await charactersRef
      .where('is_npc', '==', true)
      .get();

    if (!existingNPCsSnapshot.empty) {
      console.log(`Found ${existingNPCsSnapshot.size} existing NPCs. Skipping initialization.`);
      return;
    }

    // Create NPCs using batch write for efficiency
    const batch = db.batch();
    const createdNPCs: any[] = [];

    for (const npc of npcCharacters) {
      const npcRef = charactersRef.doc();
      const npcData = {
        name: npc.name,
        battle_chat: npc.battleChat,
        elo_score: npc.eloScore,
        wins: 0,
        losses: 0,
        is_npc: true,
        user_id: null,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      batch.set(npcRef, npcData);
      createdNPCs.push({
        id: npcRef.id,
        ...npcData
      });
    }

    await batch.commit();

    console.log(`Successfully created ${createdNPCs.length} NPC characters!`);
    
    // Display created NPCs
    console.log('\nCreated NPCs:');
    createdNPCs.forEach(npc => {
      console.log(`- ${npc.name} (ELO: ${npc.elo_score})`);
    });

  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    // Terminate the app to exit the script
    await app.delete();
  }
}

// Run the initialization
initializeNPCs();