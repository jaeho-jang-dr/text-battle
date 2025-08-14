import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_FILE = path.join(DATA_DIR, 'memory-store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function saveStore(store: any) {
  try {
    const data = {
      users: Array.from(store.users.entries()),
      characters: Array.from(store.characters.entries()),
      battles: Array.from(store.battles.entries()),
      adminUsers: Array.from(store.adminUsers.entries()),
      systemSettings: Array.from(store.systemSettings.entries()),
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
    console.log('Memory store persisted to disk');
  } catch (error) {
    console.error('Failed to persist memory store:', error);
  }
}

export function loadStore(): any | null {
  try {
    if (!fs.existsSync(STORE_FILE)) {
      return null;
    }
    
    const data = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
    
    // Convert arrays back to Maps with proper date objects
    const store = {
      users: new Map(data.users.map(([k, v]: [string, any]) => [k, {
        ...v,
        createdAt: new Date(v.createdAt),
        updatedAt: new Date(v.updatedAt)
      }])),
      characters: new Map(data.characters.map(([k, v]: [string, any]) => [k, {
        ...v,
        createdAt: new Date(v.createdAt),
        updatedAt: new Date(v.updatedAt),
        lastBattleTime: v.lastBattleTime ? new Date(v.lastBattleTime) : null
      }])),
      battles: new Map(data.battles.map(([k, v]: [string, any]) => [k, {
        ...v,
        createdAt: new Date(v.createdAt)
      }])),
      adminUsers: new Map(data.adminUsers.map(([k, v]: [string, any]) => [k, {
        ...v,
        createdAt: new Date(v.createdAt),
        updatedAt: new Date(v.updatedAt),
        lastLoginAt: v.lastLoginAt ? new Date(v.lastLoginAt) : undefined
      }])),
      systemSettings: new Map(data.systemSettings.map(([k, v]: [string, any]) => [k, {
        ...v,
        updatedAt: new Date(v.updatedAt)
      }]))
    };
    
    console.log('Memory store loaded from disk');
    return store;
  } catch (error) {
    console.error('Failed to load memory store:', error);
    return null;
  }
}