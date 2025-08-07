"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function AuthButton() {
  const { user, isAuthenticated, logout } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-white">
          Welcome, <span className="font-semibold">{user.name}</span>
          {user.isGuest && " (Guest)"}
        </span>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/auth/email"
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
      >
        Sign In
      </Link>
      <Link
        href="/guest"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        Play as Guest
      </Link>
    </div>
  );
}