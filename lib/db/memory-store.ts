// Shared in-memory storage for development
// This ensures all modules use the same data

export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  password: string;
  provider?: string;
  characterId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  type?: string;
  level?: number;
  experience?: number;
  experienceToNext?: number;
  stats?: {
    health: number;
    attack: number;
    defense: number;
    speed: number;
    magic: number;
    critical: number;
    evasion: number;
  };
  battleChat?: string;
  eloScore?: number;
  rating?: number;
  wins: number;
  losses: number;
  totalBattles?: number;
  winRate?: number;
  dailyBattlesCount?: number;
  lastBattleTime?: Date | null;
  isNPC: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Battle {
  id: string;
  player1Id: string;
  player2Id: string;
  winnerId: string;
  player1EloChange: number;
  player2EloChange: number;
  createdAt: Date;
}

export interface AdminUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'superadmin' | 'admin' | 'moderator';
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  details: any;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface SystemSettings {
  id: string;
  key: string;
  value: any;
  description?: string;
  updatedAt: Date;
  updatedBy?: string;
}

// Import persistence functions only on server side
let saveStore: any, loadStore: any;
if (typeof window === 'undefined') {
  const persist = require('./persist-store');
  saveStore = persist.saveStore;
  loadStore = persist.loadStore;
}

// Global storage (persists across imports)
const globalStore = global as any;

if (!globalStore.textBattleStore) {
  // Try to load from disk first
  if (typeof window === 'undefined' && loadStore) {
    const savedStore = loadStore();
    if (savedStore) {
      globalStore.textBattleStore = savedStore;
      console.log('Loaded existing store from disk');
    }
  }
  
  if (!globalStore.textBattleStore) {
    globalStore.textBattleStore = {
      users: new Map<string, User>(),
      characters: new Map<string, Character>(),
      battles: new Map<string, Battle>(),
      sessions: new Map<string, any>(),
      adminUsers: new Map<string, AdminUser>(),
      adminLogs: new Map<string, AdminLog>(),
      systemSettings: new Map<string, SystemSettings>()
    };
  }
  
  // 기본 관리자 계정 생성
  const defaultAdmin: AdminUser = {
    id: 'admin_default',
    email: 'admin@example.com',
    password: '1234', // 프로덕션에서는 해시 처리 필요
    name: '시스템 관리자',
    role: 'superadmin',
    permissions: ['all'],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  globalStore.textBattleStore.adminUsers.set(defaultAdmin.id, defaultAdmin);
  
  // 기본 시스템 설정
  const defaultSettings = [
    { key: 'daily_battle_limit', value: 20, description: '일일 배틀 제한' },
    { key: 'battle_cooldown_minutes', value: 0.17, description: '배틀 쿨다운 (분)' }, // 10 seconds = 0.17 minutes
    { key: 'maintenance_mode', value: false, description: '유지보수 모드' },
    { key: 'new_user_bonus_rating', value: 1000, description: '신규 유저 기본 레이팅' }
  ];
  
  defaultSettings.forEach(setting => {
    const settingObj: SystemSettings = {
      id: `setting_${setting.key}`,
      key: setting.key,
      value: setting.value,
      description: setting.description,
      updatedAt: new Date()
    };
    globalStore.textBattleStore.systemSettings.set(setting.key, settingObj);
  });
  
  // Initialize NPCs
  const npcs = [
    { name: "검은용", battleChat: "불타올라라! 내 검은 화염으로 너를 태워버리겠다!", eloScore: 1200 },
    { name: "서리마녀", battleChat: "얼어붙어라! 영원한 겨울의 저주를 받아라!", eloScore: 1150 },
    { name: "번개전사", battleChat: "천둥번개가 내 검을 타고 흐른다! 감전되어라!", eloScore: 1100 },
    { name: "그림자", battleChat: "어둠 속에서 나는 너를 지켜보고 있다...", eloScore: 1050 },
    { name: "불꽃술사", battleChat: "내 마법의 불꽃이 너를 재로 만들어버릴 것이다!", eloScore: 1000 },
    { name: "바람검객", battleChat: "바람처럼 빠른 내 검을 막을 수 있겠나?", eloScore: 950 },
    { name: "대지거인", battleChat: "대지의 힘으로 너를 부숴버리겠다!", eloScore: 900 },
    { name: "물의정령", battleChat: "깊은 바다의 힘이 너를 삼킬 것이다!", eloScore: 850 },
    { name: "철갑기사", battleChat: "내 철갑을 뚫을 수 있다면 해보아라!", eloScore: 800 },
    { name: "독침자객", battleChat: "조용히... 네 숨이 멎을 때까지...", eloScore: 750 },
    { name: "빛의수호자", battleChat: "정의의 빛이 어둠을 몰아낸다!", eloScore: 1300 },
    { name: "혼돈마왕", battleChat: "혼돈 속에서 네 운명은 정해졌다!", eloScore: 1400 },
    { name: "시간술사", battleChat: "시간을 거스를 수는 없다... 네 패배는 이미 정해진 것!", eloScore: 1250 },
    { name: "영혼도둑", battleChat: "네 영혼은 이제 내 것이다...", eloScore: 1100 },
    { name: "용암거인", battleChat: "녹아내려라! 뜨거운 용암 속으로!", eloScore: 1000 },
    { name: "얼음여왕", battleChat: "차가운 죽음을 맞이하라!", eloScore: 1050 },
    { name: "뇌신", battleChat: "천벌을 받아라! 번개여!", eloScore: 1350 },
    { name: "숲의정령", battleChat: "자연의 분노를 느껴보아라!", eloScore: 900 },
    { name: "강철전사", battleChat: "내 주먹 하나면 충분하다!", eloScore: 800 },
    { name: "마법견습생", battleChat: "이... 이번엔 꼭 성공할거야! 파이어볼!", eloScore: 600 }
  ];

  npcs.forEach((npc, index) => {
    const npcId = `npc_${index + 1}`;
    const wins = Math.floor(Math.random() * 100);
    const losses = Math.floor(Math.random() * 50);
    const totalBattles = wins + losses;
    
    globalStore.textBattleStore.characters.set(npcId, {
      id: npcId,
      userId: `npc_${index + 1}`,
      name: npc.name,
      type: 'warrior',
      level: Math.floor(npc.eloScore / 100),
      experience: 0,
      experienceToNext: 100,
      stats: {
        health: 100 + Math.floor(Math.random() * 50),
        attack: 20 + Math.floor(Math.random() * 10),
        defense: 15 + Math.floor(Math.random() * 10),
        speed: 15 + Math.floor(Math.random() * 10),
        magic: 10 + Math.floor(Math.random() * 10),
        critical: 10 + Math.floor(Math.random() * 5),
        evasion: 5 + Math.floor(Math.random() * 5)
      },
      battleChat: npc.battleChat,
      eloScore: npc.eloScore,
      rating: npc.eloScore,
      wins: wins,
      losses: losses,
      totalBattles: totalBattles,
      winRate: totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0,
      dailyBattlesCount: 0,
      lastBattleTime: null,
      isNPC: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });
}

// Export the shared store with helper methods
export const memoryStore = {
  users: globalStore.textBattleStore.users as Map<string, User>,
  characters: globalStore.textBattleStore.characters as Map<string, Character>,
  battles: globalStore.textBattleStore.battles as Map<string, Battle>,
  sessions: globalStore.textBattleStore.sessions as Map<string, any>,
  adminUsers: globalStore.textBattleStore.adminUsers as Map<string, AdminUser>,
  adminLogs: globalStore.textBattleStore.adminLogs as Map<string, AdminLog>,
  systemSettings: globalStore.textBattleStore.systemSettings as Map<string, SystemSettings>,
  
  // Helper methods
  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  },
  
  async createUser(user: User): Promise<void> {
    this.users.set(user.id, user);
    if (typeof window === 'undefined' && saveStore) {
      saveStore(globalStore.textBattleStore);
    }
  },
  
  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, { ...user, ...updates });
      if (typeof window === 'undefined' && saveStore) {
        saveStore(globalStore.textBattleStore);
      }
    }
  },
  
  async createCharacter(character: Character): Promise<void> {
    this.characters.set(character.id, character);
    if (typeof window === 'undefined' && saveStore) {
      saveStore(globalStore.textBattleStore);
    }
  },
  
  async getCharacterByUserId(userId: string): Promise<Character | null> {
    for (const character of this.characters.values()) {
      if (character.userId === userId) {
        return character;
      }
    }
    return null;
  },
  
  async getCharacterById(characterId: string): Promise<Character | null> {
    return this.characters.get(characterId) || null;
  },
  
  async updateCharacter(characterId: string, updates: Partial<Character>): Promise<void> {
    const character = this.characters.get(characterId);
    if (character) {
      this.characters.set(characterId, { ...character, ...updates, updatedAt: new Date() });
    }
  },
  
  // Admin methods
  async getAdminByEmail(email: string): Promise<AdminUser | null> {
    for (const admin of this.adminUsers.values()) {
      if (admin.email === email) {
        return admin;
      }
    }
    return null;
  },
  
  async createAdminLog(log: Omit<AdminLog, 'id' | 'createdAt'>): Promise<void> {
    const logEntry: AdminLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...log,
      createdAt: new Date()
    };
    this.adminLogs.set(logEntry.id, logEntry);
  },
  
  async getSystemSetting(key: string): Promise<any> {
    const setting = this.systemSettings.get(key);
    return setting?.value;
  },
  
  async updateSystemSetting(key: string, value: any, updatedBy?: string): Promise<void> {
    const setting = this.systemSettings.get(key);
    if (setting) {
      setting.value = value;
      setting.updatedAt = new Date();
      setting.updatedBy = updatedBy;
      this.systemSettings.set(key, setting);
    }
  }
};