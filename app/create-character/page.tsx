"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CreateCharacterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [battleChat, setBattleChat] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Get current user ID
      const authResponse = await fetch("/api/auth/verify");
      if (!authResponse.ok) {
        router.push("/");
        return;
      }
      
      const { userId } = await authResponse.json();
      
      // Create character
      const response = await fetch("/api/characters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          name: name.trim(),
          battleChat: battleChat.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create character");
      }

      // Redirect to play page
      router.push("/play");
    } catch (err: any) {
      setError(err.message || "Failed to create character");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 border border-gray-700"
      >
        <h1 className="text-3xl font-bold text-white mb-6">Create Your Fighter</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Fighter Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={10}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter fighter name"
            />
            <p className="mt-1 text-xs text-gray-400">{name.length}/10 characters</p>
          </div>
          
          <div>
            <label htmlFor="battleChat" className="block text-sm font-medium text-gray-300 mb-2">
              Battle Chat
            </label>
            <textarea
              id="battleChat"
              value={battleChat}
              onChange={(e) => setBattleChat(e.target.value)}
              maxLength={100}
              required
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Enter your battle cry..."
            />
            <p className="mt-1 text-xs text-gray-400">{battleChat.length}/100 characters</p>
          </div>
          
          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Fighter"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}