import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import KakaoProvider from "next-auth/providers/kakao";
import bcrypt from "bcryptjs";
import { db } from "./firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where,
  serverTimestamp
} from "firebase/firestore";
import { createCharacter } from "./character";

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
          const usersRef = collection(db, "users");
          const emailQuery = query(usersRef, where("email", "==", credentials.email));
          const existingUserSnapshot = await getDocs(emailQuery);

          if (!existingUserSnapshot.empty) {
            throw new Error("이미 존재하는 이메일입니다");
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(credentials.password, 10);

          // Create new user
          try {
            const newUserRef = doc(collection(db, "users"));
            const userData = {
              email: credentials.email,
              username: credentials.username,
              password_hash: hashedPassword,
              is_guest: false,
              created_at: serverTimestamp(),
              updated_at: serverTimestamp()
            };
            
            await setDoc(newUserRef, userData);

            // Auto-create character for new user
            try {
              const defaultBattleChat = `안녕하세요! 저는 ${credentials.username}입니다. 잘 부탁드립니다!`;
              await createCharacter(newUserRef.id, credentials.username, defaultBattleChat);
              console.log(`Character created for user ${newUserRef.id}`);
            } catch (charError) {
              console.error('Failed to create character:', charError);
              // Continue with user creation even if character creation fails
            }

            return {
              id: newUserRef.id,
              email: credentials.email,
              name: credentials.username,
              isGuest: false,
            };
          } catch (error) {
            console.error("Signup error:", error);
            throw new Error("회원가입에 실패했습니다. 다시 시도해주세요");
          }
        } else {
          // Sign in flow
          const usersRef = collection(db, "users");
          const loginQuery = query(usersRef, where("email", "==", credentials.email));
          const userSnapshot = await getDocs(loginQuery);

          if (userSnapshot.empty) {
            throw new Error("이메일 또는 비밀번호가 일치하지 않습니다");
          }

          const userDoc = userSnapshot.docs[0];
          const user = { id: userDoc.id, ...userDoc.data() };

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
        try {
          const guestUserRef = doc(collection(db, "users"));
          const guestData = {
            username: credentials.username,
            is_guest: true,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
          };
          
          await setDoc(guestUserRef, guestData);

          // Auto-create character for guest user
          try {
            const defaultBattleChat = `저는 ${credentials.username}입니다! 배틀 준비 완료!`;
            await createCharacter(guestUserRef.id, credentials.username, defaultBattleChat);
            console.log(`Character created for guest ${guestUserRef.id}`);
          } catch (charError) {
            console.error('Failed to create character for guest:', charError);
            // Continue with user creation even if character creation fails
          }

          return {
            id: guestUserRef.id,
            email: null,
            name: credentials.username,
            isGuest: true,
          };
        } catch (error) {
          console.error("Guest user creation error:", error);
          throw new Error("게스트 계정 생성에 실패했습니다");
        }
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
          const usersRef = collection(db, "users");
          const kakaoQuery = query(usersRef, where("kakao_id", "==", account.providerAccountId));
          const kakaoSnapshot = await getDocs(kakaoQuery);
          const existingUser = !kakaoSnapshot.empty ? 
            { id: kakaoSnapshot.docs[0].id, ...kakaoSnapshot.docs[0].data() } : null;

          if (existingUser) {
            token.id = existingUser.id;
            token.name = existingUser.username;
            token.isGuest = false;
          } else {
            // Create new user for Kakao login
            try {
              const newUserRef = doc(collection(db, "users"));
              const userData = {
                kakao_id: account.providerAccountId,
                username: user.name || `Player_${Date.now()}`,
                email: user.email,
                is_guest: false,
                created_at: serverTimestamp(),
                updated_at: serverTimestamp()
              };
              
              await setDoc(newUserRef, userData);
              
              // Auto-create character for Kakao user
              try {
                const defaultBattleChat = `${userData.username}입니다! 카카오로 참전!`;
                await createCharacter(newUserRef.id, userData.username, defaultBattleChat);
                console.log(`Character created for Kakao user ${newUserRef.id}`);
              } catch (charError) {
                console.error('Failed to create character for Kakao user:', charError);
                // Continue with user creation even if character creation fails
              }
              
              token.id = newUserRef.id;
              token.name = userData.username;
              token.isGuest = false;
            } catch (error) {
              console.error("Failed to create Kakao user:", error);
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