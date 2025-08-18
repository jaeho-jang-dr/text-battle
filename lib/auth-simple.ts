// Simple authentication system for development
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import KakaoProvider from "next-auth/providers/kakao";
import bcrypt from "bcryptjs";
import { createCharacter } from "./character-server";
import { memoryStore } from "./db/memory-store";

// Use shared memory store
const users = memoryStore.users;
const sessions = memoryStore.sessions;

export const authOptions: NextAuthOptions = {
  providers: [
    // Kakao OAuth Provider (if environment variables are set)
    ...(process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET ? [
      KakaoProvider({
        clientId: process.env.KAKAO_CLIENT_ID,
        clientSecret: process.env.KAKAO_CLIENT_SECRET,
      })
    ] : []),
    
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isSignup: { label: "Is Signup", type: "text" },
        username: { label: "Username", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        console.log(`Auth attempt - Email: ${credentials.email}, IsSignup: ${credentials.isSignup}`);

        if (credentials.isSignup === "true") {
          // Sign up
          if (!credentials.username) {
            throw new Error("Username is required");
          }

          const existingUser = await memoryStore.getUserByEmail(credentials.email);
          if (existingUser) {
            console.log(`User already exists: ${credentials.email}`);
            throw new Error("이미 가입된 이메일입니다. 로그인을 시도해주세요.");
          }

          const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const user = {
            id: userId,
            email: credentials.email,
            name: credentials.username,
            username: credentials.username,
            password: credentials.password, // In production, hash this!
            provider: 'credentials',
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await memoryStore.createUser(user);
          console.log(`User created - ID: ${userId}, Email: ${credentials.email}`);
          
          // Verify user was created
          const verifyUser = await memoryStore.getUserByEmail(credentials.email);
          console.log(`User verification after creation:`, verifyUser ? 'Success' : 'Failed');
          
          // Auto-create character
          try {
            const defaultBattleChat = `안녕하세요! ${credentials.username}입니다!`;
            await createCharacter(userId, credentials.username, defaultBattleChat);
            console.log(`Character created for user ${userId}`);
          } catch (error) {
            console.error('Failed to create character:', error);
          }

          return {
            id: userId,
            email: credentials.email,
            name: credentials.username,
          };
        } else {
          // Sign in
          console.log(`Sign in attempt for: ${credentials.email}`);
          
          // Debug: List all users
          console.log('Current users in memory:');
          for (const [id, user] of memoryStore.users) {
            console.log(`- ID: ${id}, Email: ${user.email}`);
          }
          
          // Check if it's the admin user
          if (credentials.email === 'admin@example.com') {
            const adminUser = await memoryStore.getAdminByEmail('admin@example.com');
            if (adminUser && credentials.password === adminUser.password) {
              // Create a regular user entry for admin if not exists
              const existingAdminUser = await memoryStore.getUserByEmail('admin@example.com');
              if (!existingAdminUser) {
                const adminUserData = {
                  id: adminUser.id,
                  email: adminUser.email,
                  name: adminUser.name,
                  username: adminUser.name,
                  password: adminUser.password,
                  provider: 'credentials',
                  createdAt: new Date(),
                  updatedAt: new Date()
                };
                await memoryStore.createUser(adminUserData);
              }
              
              return {
                id: adminUser.id,
                email: adminUser.email,
                name: adminUser.name,
              };
            }
          }
          
          // Regular user login
          const user = await memoryStore.getUserByEmail(credentials.email);
          console.log(`User lookup result:`, user ? `Found - ID: ${user.id}` : 'Not found');
          
          if (!user) {
            console.log(`Login failed - User not found for email: ${credentials.email}`);
            // For better UX in development, we can offer to create the account
            throw new Error("계정을 찾을 수 없습니다. 회원가입을 해주세요.");
          }
          
          if (user.password !== credentials.password) {
            console.log(`Login failed - Password mismatch for user: ${user.id}`);
            throw new Error("비밀번호가 일치하지 않습니다.");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || user.username || user.email,
          };
        }
      },
    }),
    
    CredentialsProvider({
      id: "guest",
      name: "guest",
      credentials: {
        username: { label: "Username", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username) {
          throw new Error("Username is required");
        }

        const userId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Auto-create character for guest
        try {
          const defaultBattleChat = `${credentials.username}의 배틀 준비 완료!`;
          await createCharacter(userId, credentials.username, defaultBattleChat);
          console.log(`Character created for guest ${userId}`);
        } catch (error) {
          console.error('Failed to create character for guest:', error);
        }

        return {
          id: userId,
          email: null,
          name: credentials.username,
          isGuest: true,
        };
      },
    }),
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Kakao sign in
      if (account?.provider === "kakao") {
        const kakaoId = user.id;
        const email = user.email || `kakao_${kakaoId}@kakao.local`;
        const name = user.name || profile?.name || "Kakao User";
        
        // Check if user exists
        let existingUser = await memoryStore.getUserByEmail(email);
        
        if (!existingUser) {
          // Create new user
          const userId = `kakao_${kakaoId}`;
          const newUser = {
            id: userId,
            email: email,
            name: name,
            username: name,
            password: '', // No password for OAuth users
            provider: 'kakao',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          await memoryStore.createUser(newUser);
          
          // Auto-create character
          try {
            const defaultBattleChat = `안녕하세요! ${name}입니다!`;
            await createCharacter(userId, name, defaultBattleChat);
            console.log(`Character created for Kakao user ${userId}`);
          } catch (error) {
            console.error('Failed to create character:', error);
          }
        }
      }
      
      return true;
    },
    
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.isGuest = user.isGuest || false;
      }
      
      // For Kakao users
      if (account?.provider === "kakao") {
        token.id = `kakao_${user.id}`;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isGuest = token.isGuest as boolean;
      }
      return session;
    },
  },
  
  pages: {
    signIn: "/auth/email",
    error: "/auth/error",
  },
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET || "supersecret-text-battle-game-2024",
};