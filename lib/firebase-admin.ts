// Only import firebase-admin in server environment
let adminAuth: any;
let adminDb: any;

if (typeof window === 'undefined') {
  // Server-side only imports
  const { initializeApp, getApps } = require('firebase-admin/app');
  const { getAuth } = require('firebase-admin/auth');
  const { getFirestore } = require('firebase-admin/firestore');

// Initialize with mock data for development
if (!getApps().length) {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      // Use real credentials if available
      const { cert } = require('firebase-admin/app');
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      // Use emulator or mock for development
      console.warn('Firebase Admin SDK: Using development mode');
      initializeApp({
        projectId: 'text-battle-dev',
      });
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    // Fallback initialization
    initializeApp({
      projectId: 'text-battle-dev',
    });
  }
}

// In-memory storage for development
const mockData = {
  users: new Map<string, any>(),
  characters: new Map<string, any>(),
  battles: new Map<string, any>(),
  adminLogs: new Map<string, any>()
};

// Mock implementations for development
const mockAuth = {
  createUser: async (properties: any) => {
    const user = {
      uid: `user_${Date.now()}`,
      email: properties.email,
      displayName: properties.displayName,
      ...properties
    };
    mockData.users.set(user.uid, user);
    return user;
  },
  getUser: async (uid: string) => {
    const user = mockData.users.get(uid);
    if (!user) throw new Error('User not found');
    return user;
  },
  verifyIdToken: async (token: string) => ({
    uid: 'mock_user',
    email: 'mock@example.com'
  })
};

const mockDb = {
  collection: (collectionName: string) => {
    const getCollection = () => {
      if (!mockData.hasOwnProperty(collectionName)) {
        (mockData as any)[collectionName] = new Map();
      }
      return (mockData as any)[collectionName] as Map<string, any>;
    };
    
    return {
      doc: (id?: string) => {
        const docId = id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return {
          get: async () => {
            const collection = getCollection();
            const data = collection.get(docId);
            return {
              exists: !!data,
              data: () => data,
              id: docId
            };
          },
          set: async (data: any) => {
            const collection = getCollection();
            collection.set(docId, { ...data, id: docId });
            return true;
          },
          update: async (data: any) => {
            const collection = getCollection();
            const existing = collection.get(docId) || {};
            collection.set(docId, { ...existing, ...data, id: docId });
            return true;
          },
          delete: async () => {
            const collection = getCollection();
            collection.delete(docId);
            return true;
          }
        };
      },
      where: (field: string, op: string, value: any) => {
        const filters = [{ field, op, value }];
        const query: any = {
          where: (field2: string, op2: string, value2: any) => {
            filters.push({ field: field2, op: op2, value: value2 });
            return query;
          },
          limit: (n: number) => ({
            get: async () => {
              const collection = getCollection();
              const docs = Array.from(collection.entries())
                .filter(([_, doc]) => {
                  return filters.every(filter => {
                    const docValue = doc[filter.field];
                    switch (filter.op) {
                      case '==': return docValue === filter.value;
                      case '!=': return docValue !== filter.value;
                      case '>': return docValue > filter.value;
                      case '<': return docValue < filter.value;
                      case '>=': return docValue >= filter.value;
                      case '<=': return docValue <= filter.value;
                      default: return false;
                    }
                  });
                })
                .slice(0, n)
                .map(([id, data]) => ({
                  id,
                  data: () => data,
                  exists: true
                }));
              return {
                empty: docs.length === 0,
                docs,
                size: docs.length
              };
            }
          }),
          orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => ({
            limit: (n: number) => ({
              get: async () => {
                const collection = getCollection();
                const docs = Array.from(collection.entries())
                  .filter(([_, doc]) => {
                    return filters.every(filter => {
                      const docValue = doc[filter.field];
                      switch (filter.op) {
                        case '==': return docValue === filter.value;
                        case '!=': return docValue !== filter.value;
                        case '>': return docValue > filter.value;
                        case '<': return docValue < filter.value;
                        case '>=': return docValue >= filter.value;
                        case '<=': return docValue <= filter.value;
                        default: return false;
                      }
                    });
                  })
                  .sort(([_, a], [__, b]) => {
                    if (direction === 'asc') return a[field] - b[field];
                    return b[field] - a[field];
                  })
                  .slice(0, n)
                  .map(([id, data]) => ({
                    id,
                    data: () => data,
                    exists: true
                  }));
                return {
                  empty: docs.length === 0,
                  docs,
                  size: docs.length
                };
              }
            })
          }),
          get: async () => {
            const collection = getCollection();
            const docs = Array.from(collection.entries())
              .filter(([_, doc]) => {
                return filters.every(filter => {
                  const docValue = doc[filter.field];
                  switch (filter.op) {
                    case '==': return docValue === filter.value;
                    case '!=': return docValue !== filter.value;
                    case '>': return docValue > filter.value;
                    case '<': return docValue < filter.value;
                    case '>=': return docValue >= filter.value;
                    case '<=': return docValue <= filter.value;
                    default: return false;
                  }
                });
              })
              .map(([id, data]) => ({
                id,
                data: () => data,
                exists: true
              }));
            return {
              empty: docs.length === 0,
              docs,
              size: docs.length
            };
          }
        };
        return query;
      },
      orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => ({
        limit: (n: number) => ({
          get: async () => {
            const collection = getCollection();
            const docs = Array.from(collection.entries())
              .sort(([_, a], [__, b]) => {
                if (direction === 'asc') return a[field] - b[field];
                return b[field] - a[field];
              })
              .slice(0, n)
              .map(([id, data]) => ({
                id,
                data: () => data,
                exists: true
              }));
            return {
              empty: docs.length === 0,
              docs,
              size: docs.length
            };
          }
        }),
        startAfter: (lastDoc: any) => ({
          limit: (n: number) => ({
            get: async () => {
              const collection = getCollection();
              const sortedEntries = Array.from(collection.entries())
                .sort(([_, a], [__, b]) => {
                  if (direction === 'asc') return a[field] - b[field];
                  return b[field] - a[field];
                });
              
              const lastIndex = sortedEntries.findIndex(([id]) => id === lastDoc.id);
              const docs = sortedEntries
                .slice(lastIndex + 1, lastIndex + 1 + n)
                .map(([id, data]) => ({
                  id,
                  data: () => data,
                  exists: true
                }));
              
              return {
                empty: docs.length === 0,
                docs,
                size: docs.length
              };
            }
          })
        })
      }),
      get: async () => {
        const collection = getCollection();
        const docs = Array.from(collection.entries())
          .map(([id, data]) => ({
            id,
            data: () => data,
            exists: true
          }));
        return {
          empty: docs.length === 0,
          docs,
          size: docs.length
        };
      },
      add: async (data: any) => {
        const collection = getCollection();
        const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        collection.set(id, { ...data, id });
        return {
          id,
          get: async () => ({
            exists: true,
            data: () => collection.get(id),
            id
          })
        };
      }
    };
  },
  batch: () => {
    const operations: Array<() => void> = [];
    return {
      set: (docRef: any, data: any) => {
        operations.push(() => {
          const collection = (mockData as any)[docRef.parent.id];
          if (collection) {
            collection.set(docRef.id, data);
          }
        });
      },
      update: (docRef: any, data: any) => {
        operations.push(() => {
          const collection = (mockData as any)[docRef.parent.id];
          if (collection) {
            const existing = collection.get(docRef.id) || {};
            collection.set(docRef.id, { ...existing, ...data });
          }
        });
      },
      delete: (docRef: any) => {
        operations.push(() => {
          const collection = (mockData as any)[docRef.parent.id];
          if (collection) {
            collection.delete(docRef.id);
          }
        });
      },
      commit: async () => {
        operations.forEach(op => op());
        return true;
      }
    };
  },
  runTransaction: async (callback: any) => {
    const updates = new Map();
    const mockTransaction = {
      get: async (docRef: any) => {
        const collection = (mockData as any)[docRef.parent.id];
        const data = collection?.get(docRef.id);
        return { exists: !!data, data: () => data };
      },
      set: (docRef: any, data: any) => {
        updates.set(`${docRef.parent.id}/${docRef.id}`, { type: 'set', data });
      },
      update: (docRef: any, data: any) => {
        updates.set(`${docRef.parent.id}/${docRef.id}`, { type: 'update', data });
      },
      delete: (docRef: any) => {
        updates.set(`${docRef.parent.id}/${docRef.id}`, { type: 'delete' });
      }
    };
    
    const result = await callback(mockTransaction);
    
    // Apply all updates
    updates.forEach((update, path) => {
      const [collectionName, docId] = path.split('/');
      const collection = (mockData as any)[collectionName];
      if (collection) {
        if (update.type === 'set') {
          collection.set(docId, update.data);
        } else if (update.type === 'update') {
          const existing = collection.get(docId) || {};
          collection.set(docId, { ...existing, ...update.data });
        } else if (update.type === 'delete') {
          collection.delete(docId);
        }
      }
    });
    
    return result;
  }
};

  // Export based on environment
  const isDevelopment = !process.env.FIREBASE_PROJECT_ID;
  adminAuth = isDevelopment ? mockAuth : getAuth();
  adminDb = isDevelopment ? mockDb : getFirestore();
} else {
  // Client-side: export empty objects
  adminAuth = {};
  adminDb = {};
}

export { adminAuth, adminDb };