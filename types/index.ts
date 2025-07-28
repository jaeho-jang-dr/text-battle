export interface Animal {
  id: number;
  name: string;
  korean_name: string;
  category: 'current' | 'mythical' | 'prehistoric';
  emoji: string;
  description: string;
  habitat: string;
  food: string;
  speciality: string;
  fun_fact: string;
  power: number;
  defense: number;
  speed: number;
  intelligence: number;
  battle_cry: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  created_at: string;
}