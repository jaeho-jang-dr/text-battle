import { createClient } from '@supabase/supabase-js';
import { npcCharacters } from '../lib/npc-data';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initializeNPCs() {
  console.log('Starting NPC initialization...');

  try {
    // Check if NPCs already exist
    const { data: existingNPCs, error: checkError } = await supabase
      .from('characters')
      .select('name')
      .eq('is_npc', true);

    if (checkError) {
      console.error('Error checking existing NPCs:', checkError);
      return;
    }

    if (existingNPCs && existingNPCs.length > 0) {
      console.log(`Found ${existingNPCs.length} existing NPCs. Skipping initialization.`);
      return;
    }

    // Create NPCs
    const npcsToInsert = npcCharacters.map(npc => ({
      name: npc.name,
      battle_chat: npc.battleChat,
      elo_score: npc.eloScore,
      wins: 0,
      losses: 0,
      is_npc: true,
      user_id: null // NPCs don't have a user
    }));

    const { data, error } = await supabase
      .from('characters')
      .insert(npcsToInsert)
      .select();

    if (error) {
      console.error('Error inserting NPCs:', error);
      return;
    }

    console.log(`Successfully created ${data.length} NPC characters!`);
    
    // Display created NPCs
    console.log('\nCreated NPCs:');
    data.forEach(npc => {
      console.log(`- ${npc.name} (ELO: ${npc.elo_score})`);
    });

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the initialization
initializeNPCs();