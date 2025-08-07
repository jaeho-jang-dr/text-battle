'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import CharacterCard from '@/components/character/CharacterCard';
import CharacterForm from '@/components/character/CharacterForm';
import { Character } from '@/types';

export default function MyCharacterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/');
      return;
    }

    fetchCharacter();
  }, [session, status, router]);

  const fetchCharacter = async () => {
    try {
      const response = await fetch('/api/characters/my');
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          // No character found, redirect to create character
          router.push('/create-character');
          return;
        }
        throw new Error(data.error);
      }

      setCharacter(data.character);
    } catch (error) {
      console.error('Error fetching character:', error);
      setError('Failed to load character');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBattleChat = async (data: { name: string; battleChat: string }) => {
    if (!character) return;

    setUpdateLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/characters/${character.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ battleChat: data.battleChat }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to update character');
        return;
      }

      setCharacter(result.character);
      setIsEditing(false);
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!character) {
    return null;
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link 
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Home
          </Link>
          <Link 
            href="/play"
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-lg transition-colors"
          >
            Play Game →
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-8">My Character</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <CharacterCard character={character} />
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Edit Battle Chat
              </button>
            )}
          </div>

          <div>
            {isEditing ? (
              <div className="bg-slate-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Edit Battle Chat</h2>
                <CharacterForm
                  onSubmit={handleUpdateBattleChat}
                  isLoading={updateLoading}
                  error={error}
                  mode="edit"
                  initialBattleChat={character.battleChat}
                />
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setError('');
                  }}
                  className="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  disabled={updateLoading}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Battle Statistics</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Battles</span>
                    <span className="text-white font-semibold">
                      {character.wins + character.losses}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Current Rank</span>
                    <span className="text-white font-semibold">
                      {/* This would need to be fetched from leaderboard */}
                      -
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Member Since</span>
                    <span className="text-white font-semibold">
                      {new Date(character.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link
                      href="/leaderboard"
                      className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-center"
                    >
                      View Leaderboard
                    </Link>
                    <Link
                      href="/battle-history"
                      className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-center"
                    >
                      Battle History
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}