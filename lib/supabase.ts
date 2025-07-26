import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 데이터베이스 타입 정의
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          age: number | null;
          avatar: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          age?: number | null;
          avatar?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          age?: number | null;
          avatar?: string | null;
          created_at?: string;
        };
      };
      animals: {
        Row: {
          id: number;
          name: string;
          korean_name: string;
          category: 'current' | 'legend' | 'prehistoric';
          emoji: string;
          description: string;
          habitat: string;
          food: string;
          speciality: string;
          fun_fact: string;
          power: number;
          defense: number;
          speed: number;
          battle_cry: string;
        };
      };
      user_animals: {
        Row: {
          id: string;
          user_id: string;
          animal_id: number;
          nickname: string | null;
          level: number;
          experience: number;
          battles_won: number;
          battles_lost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          animal_id: number;
          nickname?: string | null;
          level?: number;
          experience?: number;
          battles_won?: number;
          battles_lost?: number;
          created_at?: string;
        };
      };
      battles: {
        Row: {
          id: string;
          player1_id: string;
          player2_id: string;
          player1_animal_id: number;
          player2_animal_id: number;
          winner_id: string | null;
          battle_log: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          player1_id: string;
          player2_id: string;
          player1_animal_id: number;
          player2_animal_id: number;
          winner_id?: string | null;
          battle_log?: any;
          created_at?: string;
        };
      };
    };
    Views: {
      leaderboard: {
        Row: {
          id: string;
          username: string;
          wins: number;
          losses: number;
          total_battles: number;
          win_rate: number;
        };
      };
    };
  };
};