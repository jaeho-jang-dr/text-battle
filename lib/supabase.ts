import { createClient } from '@supabase/supabase-js';
import { createMockSupabaseClient } from './supabase-mock';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: any;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-supabase-url') {
  console.warn('⚠️ Missing or invalid Supabase environment variables.');
  console.warn('⚠️ Using mock Supabase client - data will not be persisted.');
  console.warn('⚠️ Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
  
  // Use mock client for development
  supabase = createMockSupabaseClient();
} else {
  // Use real Supabase client
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };