import { db } from './db';

// 설정값 캐시
let settingsCache: { [key: string]: any } = {};
let cacheTimestamp = 0;
const CACHE_DURATION = 60000; // 1분 캐시

// 설정값 조회 함수
export async function getSetting(key: string, defaultValue?: any): Promise<any> {
  const now = Date.now();
  
  // 캐시가 유효한 경우
  if (settingsCache[key] !== undefined && now - cacheTimestamp < CACHE_DURATION) {
    return settingsCache[key];
  }
  
  try {
    const result = await db.prepare(
      'SELECT setting_value FROM admin_settings WHERE setting_key = ?'
    ).get(key);
    
    if (result) {
      const value = result.setting_value;
      
      // boolean 값 처리
      if (value === 'true') return true;
      if (value === 'false') return false;
      
      // 숫자 값 처리
      if (!isNaN(Number(value))) return Number(value);
      
      // 문자열 반환
      settingsCache[key] = value;
      return value;
    }
  } catch (error) {
    console.error(`Failed to get setting ${key}:`, error);
  }
  
  return defaultValue;
}

// 설정값 캐시 무효화
export function invalidateSettingsCache() {
  settingsCache = {};
  cacheTimestamp = 0;
}

// 여러 설정값 한번에 조회
export async function getSettings(keys: string[]): Promise<{ [key: string]: any }> {
  const results: { [key: string]: any } = {};
  
  for (const key of keys) {
    results[key] = await getSetting(key);
  }
  
  return results;
}