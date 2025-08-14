import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import KakaoProvider from "next-auth/providers/kakao";
import { adminAuth, adminDb } from "./firebase-admin";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import bcrypt from "bcryptjs";

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

            try {
              // Create user in Firebase Auth
              const userRecord = await adminAuth.createUser({
                email: credentials.email,
                password: credentials.password,
                displayName: credentials.username,
              });

              // Create user document in Firestore
              await adminDb.collection('users').doc(userRecord.uid).set({
                uid: userRecord.uid,
                email: credentials.email,
                username: credentials.username,
                createdAt: new Date(),
                updatedAt: new Date(),
              });

              return {
                id: userRecord.uid,
                email: userRecord.email,
                name: credentials.username,
                isGuest: false,
              };
            } catch (error: any) {
              if (error.code === 'auth/email-already-exists') {
                throw new Error("이미 존재하는 이메일입니다");
              }
              throw new Error("회원가입에 실패했습니다. 다시 시도해주세요");
            }
          } else {
            // Sign in flow
            try {
              const userCredential = await signInWithEmailAndPassword(
                auth,
                credentials.email,
                credentials.password
              );
              
              const userDoc = await adminDb.collection('users').doc(userCredential.user.uid).get();
              const userData = userDoc.data();

              return {
                id: userCredential.user.uid,
                email: userCredential.user.email,
                name: userData?.username || userCredential.user.displayName,
                isGuest: false,
              };
            } catch (error: any) {
              throw new Error("이메일 또는 비밀번호가 일치하지 않습니다");
            }
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

          // Create guest user document
          const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const guestData = {
            uid: guestId,
            username: credentials.username,
            isGuest: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await adminDb.collection('users').doc(guestId).set(guestData);

          return {
            id: guestId,
            email: null,
            name: credentials.username,
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
          try {
            // Check if user exists with this Kakao ID
            const existingUserSnapshot = await adminDb
              .collection('users')
              .where('kakao_id', '==', account.providerAccountId)
              .limit(1)
              .get();

            if (!existingUserSnapshot.empty) {
              const existingUser = existingUserSnapshot.docs[0].data();
              token.id = existingUser.uid;
              token.name = existingUser.username;
              token.isGuest = false;
            } else {
              // Create new user for Kakao login
              const newUserId = `kakao_${account.providerAccountId}`;
              const newUserData = {
                uid: newUserId,
                kakao_id: account.providerAccountId,
                username: user.name || `Player_${Date.now()}`,
                email: user.email,
                isGuest: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              await adminDb.collection('users').doc(newUserId).set(newUserData);

              token.id = newUserId;
              token.name = newUserData.username;
              token.isGuest = false;
            }
          } catch (error) {
            console.error('Kakao auth error:', error);
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