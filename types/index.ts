// 동물 카테고리
export type AnimalCategory = 'current' | 'legend' | 'prehistoric';

// 동물 인터페이스
export interface Animal {
  id: number;
  name: string;
  koreanName: string;
  category: AnimalCategory;
  emoji: string;
  description: string;
  detailedInfo: {
    habitat: string;
    food: string;
    speciality: string;
    funFact: string;
  };
  stats: {
    power: number;
    defense: number;
    speed: number;
  };
  battleCry: string;
}

// 사용자 인터페이스
export interface User {
  id: string;
  username: string;
  age?: number;
  avatar?: string;
  createdAt: Date;
}

// 사용자 동물 인터페이스
export interface UserAnimal {
  id: string;
  userId: string;
  animalId: number;
  animal?: Animal;
  nickname?: string;
  level: number;
  experience: number;
  battlesWon: number;
  battlesLost: number;
  createdAt: Date;
}

// 배틀 액션 타입
export type BattleAction = 'attack' | 'defend' | 'special' | 'flee';

// 배틀 턴 인터페이스
export interface BattleTurn {
  player: string;
  action: BattleAction;
  message: string;
  damage?: number;
  effect?: string;
}

// 배틀 인터페이스
export interface Battle {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Animal: Animal;
  player2Animal: Animal;
  winnerId?: string;
  battleLog: BattleTurn[];
  createdAt: Date;
}

// 리더보드 엔트리
export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: string;
  wins: number;
  losses: number;
  totalBattles: number;
  winRate: number;
}