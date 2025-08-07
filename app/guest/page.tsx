"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function GuestPage() {
  const [username, setUsername] = useState("");
  const { signInAsGuest, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }
    
    if (username.length > 10) {
      alert("Username must be 10 characters or less");
      return;
    }

    await signInAsGuest(username);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-4">
          Play as Guest
        </h1>
        <p className="text-white/80 text-center mb-8">
          Choose a username and start playing immediately!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
              Username (max 10 characters)
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
              maxLength={10}
              required
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-300 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? "Creating..." : "Start Playing"}
          </button>
        </form>

        <div className="mt-6 space-y-4">
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
            <p className="text-yellow-200 text-sm text-center">
              <span className="font-semibold">Note:</span> Guest accounts are temporary and will be deleted after 30 days of inactivity.
            </p>
          </div>

          <div className="text-center">
            <Link href="/" className="text-blue-300 hover:text-blue-200 text-sm">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}