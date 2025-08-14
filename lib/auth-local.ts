import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createCharacter } from "./character";

// Local storage simulation for development
const users = new Map();

export const authOptions: NextAuthOptions = {
  providers: [
    // Email/Password Credentials Provider
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isSignup: { label: "Is Signup", type: "text" },
        username: { label: "Username", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("이메일과 비밀번호를 입력해주세요");
          }

          if (credentials.isSignup === "true") {
            // Sign up flow
            if (!credentials.username) {
              throw new Error("사용자명을 입력해주세요");
            }

            // Check if user already exists
            if (users.has(credentials.email)) {
              throw new Error("이미 존재하는 이메일입니다");
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(credentials.password, 10);

            // Create new user
            const newUser = {
              id: `user_${Date.now()}`,
              email: credentials.email,
              name: credentials.username,
              password: hashedPassword,
              isGuest: false,
            };

            users.set(credentials.email, newUser);

            // Auto-create character for new user
            try {
              const defaultBattleChat = `안녕하세요! 저는 ${credentials.username}입니다. 잘 부탁드립니다!`;
              await createCharacter(newUser.id, credentials.username, defaultBattleChat);
              console.log(`Character created for user ${newUser.id}`);
            } catch (charError) {
              console.error('Failed to create character:', charError);
              // Continue with user creation even if character creation fails
            }

            return {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              isGuest: false,
            };
          } else {
            // Sign in flow
            const user = users.get(credentials.email);

            if (!user) {
              throw new Error("이메일 또는 비밀번호가 일치하지 않습니다");
            }

            const isValidPassword = await bcrypt.compare(
              credentials.password,
              user.password
            );

            if (!isValidPassword) {
              throw new Error("이메일 또는 비밀번호가 일치하지 않습니다");
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              isGuest: false,
            };
          }
        } catch (error: any) {
          console.error('Credentials auth error:', error);
          throw error;
        }
      },
    }),
    
    // Guest Provider
    CredentialsProvider({
      id: "guest",
      name: "guest",
      credentials: {
        username: { label: "Username", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username) {
            throw new Error("사용자명을 입력해주세요");
          }

          // Create guest user
          const guestUser = {
            id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email: null,
            name: credentials.username,
            isGuest: true,
          };

          // Auto-create character for guest user
          try {
            const defaultBattleChat = `저는 ${credentials.username}입니다! 배틀 준비 완료!`;
            await createCharacter(guestUser.id, credentials.username, defaultBattleChat);
            console.log(`Character created for guest ${guestUser.id}`);
          } catch (charError) {
            console.error('Failed to create character for guest:', charError);
            // Continue with user creation even if character creation fails
          }

          return guestUser;
        } catch (error) {
          console.error('Guest auth error:', error);
          throw error;
        }
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isGuest = user.isGuest || false;
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
  
  secret: process.env.NEXTAUTH_SECRET || "development-secret-key",
};