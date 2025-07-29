import { BattleHistoryResponse } from '@/types/battle-history';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class BattleHistoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly defaultTTL = 5 * 60 * 1000; // 5분
  private readonly maxCacheSize = 100; // 최대 캐시 항목 수

  // 캐시 키 생성
  private generateKey(
    characterId: string, 
    params: {
      limit?: number;
      offset?: number;
      includeStats?: boolean;
      includeTimeline?: boolean;
    }
  ): string {
    return `${characterId}:${params.limit || 20}:${params.offset || 0}:${params.includeStats || false}:${params.includeTimeline || false}`;
  }

  // 캐시에서 데이터 가져오기
  get(
    characterId: string,
    params: {
      limit?: number;
      offset?: number;
      includeStats?: boolean;
      includeTimeline?: boolean;
    }
  ): BattleHistoryResponse | null {
    const key = this.generateKey(characterId, params);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // TTL 확인
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // 캐시에 데이터 저장
  set(
    characterId: string,
    params: {
      limit?: number;
      offset?: number;
      includeStats?: boolean;
      includeTimeline?: boolean;
    },
    data: BattleHistoryResponse,
    ttl?: number
  ): void {
    const key = this.generateKey(characterId, params);

    // 캐시 크기 제한 확인
    if (this.cache.size >= this.maxCacheSize) {
      // 가장 오래된 항목 제거
      const oldestKey = this.findOldestEntry();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  // 특정 캐릭터의 모든 캐시 무효화
  invalidateCharacter(characterId: string): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (key.startsWith(`${characterId}:`)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // 전체 캐시 비우기
  clear(): void {
    this.cache.clear();
  }

  // 가장 오래된 캐시 항목 찾기
  private findOldestEntry(): string | null {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    });

    return oldestKey;
  }

  // 캐시 상태 정보
  getStats() {
    let activeEntries = 0;
    let expiredEntries = 0;
    const now = Date.now();

    this.cache.forEach(entry => {
      if (now - entry.timestamp > entry.ttl) {
        expiredEntries++;
      } else {
        activeEntries++;
      }
    });

    return {
      totalEntries: this.cache.size,
      activeEntries,
      expiredEntries,
      maxSize: this.maxCacheSize
    };
  }
}

// 싱글톤 인스턴스
export const battleHistoryCache = new BattleHistoryCache();