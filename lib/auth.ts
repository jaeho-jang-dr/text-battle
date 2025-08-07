import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import KakaoProvider from "next-auth/providers/kakao";
import bcrypt from "bcryptjs";
import { supabase } from "./supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    // Kakao OAuth Provider
    ...(process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET ? [
      KakaoProvider({
        clientId: process.env.KAKAO_CLIENT_ID,
        clientSecret: process.env.KAKAO_CLIENT_SECRET,
      })
    ] : []),
    
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
            return null;
          }

          if (credentials.isSignup === "true") {
          // Sign up flow
          if (!credentials.username) {
            throw new Error("Username is required for signup");
          }

          // Check if user already exists
          const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", credentials.email)
            .single();

          if (existingUser) {
            throw new Error("이미 존재하는 이메일입니다");
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(credentials.password, 10);

          // Create new user
          const { data: newUser, error } = await supabase
            .from("users")
            .insert({
              email: credentials.email,
              username: credentials.username,
              password_hash: hashedPassword,
              is_guest: false,
            })
            .select()
            .single();

          if (error || !newUser) {
            console.error("Signup error:", error);
            throw new Error("회원가입에 실패했습니다. 다시 시도해주세요");
          }

          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.username,
            isGuest: false,
          };
        } else {
          // Sign in flow
          const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", credentials.email)
            .single();

          if (error || !user) {
            console.error("Login error:", error);
            throw new Error("이메일 또는 비밀번호가 일치하지 않습니다");
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password_hash || ""
          );

          if (!isValidPassword) {
            throw new Error("이메일 또는 비밀번호가 일치하지 않습니다");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.username,
            isGuest: false,
          };
        }
        } catch (error) {
          console.error('Credentials auth error:', error);
          return null;
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
            return null;
          }

          // Create guest user
        const { data: guestUser, error } = await supabase
          .from("users")
          .insert({
            username: credentials.username,
            is_guest: true,
          })
          .select()
          .single();

        if (error || !guestUser) {
          console.error("Guest user creation error:", error);
          throw new Error("게스트 계정 생성에 실패했습니다");
        }

        return {
          id: guestUser.id,
          email: null,
          name: guestUser.username,
          isGuest: true,
        };
        } catch (error) {
          console.error('Guest auth error:', error);
          return null;
        }
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.isGuest = user.isGuest || false;
        
        // For Kakao login
        if (account?.provider === "kakao") {
          // Check if user exists with this Kakao ID
          const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .eq("kakao_id", account.providerAccountId)
            .single();

          if (existingUser) {
            token.id = existingUser.id;
            token.name = existingUser.username;
            token.isGuest = false;
          } else {
            // Create new user for Kakao login
            const { data: newUser } = await supabase
              .from("users")
              .insert({
                kakao_id: account.providerAccountId,
                username: user.name || `Player_${Date.now()}`,
                email: user.email,
                is_guest: false,
              })
              .select()
              .single();

            if (newUser) {
              token.id = newUser.id;
              token.name = newUser.username;
              token.isGuest = false;
            }
          }
        }
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
  
  secret: process.env.NEXTAUTH_SECRET,
};