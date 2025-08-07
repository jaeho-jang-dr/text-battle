"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithEmail = async (email: string, password: string, isSignup: boolean = false, username?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        isSignup: isSignup.toString(),
        username,
        redirect: false,
      });

      if (result?.error) {
        // Parse NextAuth error messages
        if (result.error === "CredentialsSignin") {
          setError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
        } else if (result.error.includes("이미 존재하는")) {
          setError(result.error);
        } else if (result.error.includes("회원가입")) {
          setError(result.error);
        } else {
          setError(result.error);
        }
        return false;
      }

      router.push("/create-character");
      return true;
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "예상치 못한 오류가 발생했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithKakao = async () => {
    setIsLoading(true);
    try {
      await signIn("kakao", { callbackUrl: "/create-character" });
    } catch (err) {
      setError("Failed to sign in with Kakao");
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsGuest = async (username: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("guest", {
        username,
        redirect: false,
      });

      if (result?.error) {
        setError("게스트 계정 생성에 실패했습니다. 다른 닉네임을 사용해주세요.");
        return false;
      }

      router.push("/create-character");
      return true;
    } catch (err: any) {
      console.error("Guest auth error:", err);
      setError(err.message || "게스트 계정 생성에 실패했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return {
    user: session?.user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading" || isLoading,
    error,
    signInWithEmail,
    signInWithKakao,
    signInAsGuest,
    logout,
  };
}