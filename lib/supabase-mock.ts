// Mock Supabase client for development without database
export const createMockSupabaseClient = () => {
  const mockData = {
    users: new Map(),
    characters: new Map(),
    battles: new Map(),
  };

  // Add some sample NPC characters
  const sampleNPCs = [
    {
      id: 'npc_1',
      user_id: 'system',
      name: '전사',
      battle_chat: '강한 전사가 당신을 물리칠 것입니다!',
      elo_score: 1200,
      wins: 15,
      losses: 5,
      is_npc: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'npc_2',
      user_id: 'system',
      name: '마법사',
      battle_chat: '내 마법의 힘을 보여주겠다!',
      elo_score: 1150,
      wins: 12,
      losses: 8,
      is_npc: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'npc_3',
      user_id: 'system',
      name: '궁수',
      battle_chat: '정확한 화살로 승리하겠다!',
      elo_score: 1100,
      wins: 10,
      losses: 10,
      is_npc: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Initialize with sample NPCs
  sampleNPCs.forEach(npc => {
    mockData.characters.set(npc.id, npc);
  });

  return {
    from: (table: string) => {
      let query = {
        data: Array.from(mockData[table as keyof typeof mockData]?.values() || []),
        orderBy: null as any,
        orderAscending: true,
        limit: null as number | null,
        offset: 0,
      };

      const chainableMethods = {
        select: (columns?: string) => {
          const self = {
            eq: (column: string, value: any) => {
              query.data = query.data.filter(item => item[column] === value);
              return {
                ...self,
                single: async () => {
                  const item = query.data[0];
                  return { data: item || null, error: item ? null : new Error('Not found') };
                }
              };
            },
            order: (column: string, options?: { ascending?: boolean }) => {
              query.orderBy = column;
              query.orderAscending = options?.ascending !== false;
              return self;
            },
            range: (from: number, to: number) => {
              query.offset = from;
              query.limit = to - from + 1;
              return self;
            },
            limit: (count: number) => {
              query.limit = count;
              return self;
            },
            single: async () => {
              const item = query.data[0];
              return { data: item || null, error: item ? null : new Error('Not found') };
            },
            then: async (resolve: any, reject: any) => {
              let results = [...query.data];
              
              // Apply ordering
              if (query.orderBy) {
                results.sort((a, b) => {
                  const aVal = a[query.orderBy];
                  const bVal = b[query.orderBy];
                  const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                  return query.orderAscending ? comparison : -comparison;
                });
              }
              
              // Apply range/limit
              if (query.limit !== null) {
                results = results.slice(query.offset, query.offset + query.limit);
              }
              
              resolve({ data: results, error: null });
            }
          };
          return self;
        },
      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            const id = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const newItem = { ...data, id };
            mockData[table as keyof typeof mockData].set(id, newItem);
            return { data: newItem, error: null };
          }
        }),
        single: async () => {
          const id = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const newItem = { ...data, id };
          mockData[table as keyof typeof mockData].set(id, newItem);
          return { data: newItem, error: null };
        },
        then: async (resolve: any, reject: any) => {
          const id = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const newItem = { ...data, id };
          mockData[table as keyof typeof mockData].set(id, newItem);
          resolve({ data: newItem, error: null });
        }
      }),
        update: (data: any) => ({
          eq: (column: string, value: any) => ({
            select: () => ({
              single: async () => {
                const item = Array.from(mockData[table as keyof typeof mockData].values())
                  .find(i => i[column] === value);
                if (item) {
                  Object.assign(item, data);
                  return { data: item, error: null };
                }
                return { data: null, error: new Error('Not found') };
              }
            })
          })
        }),
        delete: () => ({
          eq: (column: string, value: any) => ({
            async then(resolve: any, reject: any) {
              const items = mockData[table as keyof typeof mockData];
              for (const [key, item] of items.entries()) {
                if (item[column] === value) {
                  items.delete(key);
                }
              }
              resolve({ error: null });
            }
          })
        })
      };
      return chainableMethods;
    },
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: new Error('Mock auth') }),
      signUp: async () => ({ data: null, error: new Error('Mock auth') }),
      signOut: async () => ({ error: null })
    }
  };
};