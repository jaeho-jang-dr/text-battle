"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KakaoCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // NextAuth will handle the OAuth callback automatically
    // This page is just for showing a loading state
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center">
        <div className="mb-4">
          <svg
            className="animate-spin h-12 w-12 mx-auto text-yellow-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Signing in with Kakao...
        </h2>
        <p className="text-gray-600">
          Please wait while we complete your sign in.
        </p>
      </div>
    </div>
  );
}