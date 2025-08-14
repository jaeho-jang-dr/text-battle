"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Character } from "@/types";
import { motion } from "framer-motion";

export default function UserStatus() {
  const { user, isAuthenticated } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadCharacters();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Get active character from localStorage
    const updateActiveCharacter = () => {
      const activeCharId = localStorage.getItem('activeCharacterId');
      if (activeCharId && characters.length > 0) {
        const active = characters.find(char => char.id === activeCharId);
        setActiveCharacter(active || characters[0]);
      } else if (characters.length > 0) {
        setActiveCharacter(characters[0]);
      }
    };

    updateActiveCharacter();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'activeCharacterId') {
        updateActiveCharacter();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event for same-window updates
    const handleCustomEvent = () => updateActiveCharacter();
    window.addEventListener('activeCharacterChanged', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('activeCharacterChanged', handleCustomEvent);
    };
  }, [characters]);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/characters/my");
      if (response.ok) {
        const data = await response.json();
        setCharacters(data.characters || []);
      }
    } catch (error) {
      console.error("Failed to load characters:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 right-4 z-50"
      >
        <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-2 text-sm">
          <p className="text-gray-400">로그아웃 상태</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-3 text-sm space-y-1">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <p className="text-gray-300">
            {user.email || user.name || "게스트"}
          </p>
        </div>
        {loading ? (
          <p className="text-gray-500 text-xs">캐릭터 로딩중...</p>
        ) : activeCharacter ? (
          <p className="text-blue-400 font-semibold">
            {activeCharacter.name}
            {characters.length > 1 && (
              <span className="text-gray-500 text-xs ml-1">
                (+{characters.length - 1})
              </span>
            )}
          </p>
        ) : (
          <p className="text-gray-500 text-xs">캐릭터 없음</p>
        )}
      </div>
    </motion.div>
  );
}