"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Character {
  id: string;
  name: string;
  battle_chat: string;
  elo_score: number;
  wins: number;
  losses: number;
  is_npc: boolean;
  users: {
    username: string;
    email: string | null;
  } | null;
}

export function CharactersTab() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    elo_score: 0,
    wins: 0,
    losses: 0,
  });

  useEffect(() => {
    fetchCharacters();
  }, [page, search]);

  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/characters?${params}`);
      const data = await response.json();

      setCharacters(data.characters || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch characters:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (character: Character) => {
    setEditingId(character.id);
    setEditForm({
      elo_score: character.elo_score,
      wins: character.wins,
      losses: character.losses,
    });
  };

  const handleSave = async (characterId: string) => {
    try {
      const response = await fetch("/api/admin/characters", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId,
          updates: editForm,
        }),
      });

      if (response.ok) {
        setEditingId(null);
        fetchCharacters();
      }
    } catch (error) {
      console.error("Failed to update character:", error);
    }
  };

  const handleDelete = async (characterId: string) => {
    if (!confirm("Are you sure you want to delete this character?")) {
      return;
    }

    try {
      const response = await fetch("/api/admin/characters", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId }),
      });

      if (response.ok) {
        fetchCharacters();
      }
    } catch (error) {
      console.error("Failed to delete character:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Character Management</CardTitle>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search characters..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Owner</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">ELO</th>
                    <th className="text-left p-2">W/L</th>
                    <th className="text-left p-2">Battle Chat</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {characters.map((character) => (
                    <tr key={character.id} className="border-b">
                      <td className="p-2">{character.name}</td>
                      <td className="p-2">
                        {character.is_npc
                          ? "NPC"
                          : character.users?.username || "Unknown"}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            character.is_npc
                              ? "bg-purple-200 text-purple-700 dark:bg-purple-700 dark:text-purple-200"
                              : "bg-green-200 text-green-700 dark:bg-green-700 dark:text-green-200"
                          }`}
                        >
                          {character.is_npc ? "NPC" : "Player"}
                        </span>
                      </td>
                      <td className="p-2">
                        {editingId === character.id ? (
                          <input
                            type="number"
                            value={editForm.elo_score}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                elo_score: parseInt(e.target.value),
                              })
                            }
                            className="w-20 px-2 py-1 border rounded dark:bg-slate-800"
                          />
                        ) : (
                          character.elo_score
                        )}
                      </td>
                      <td className="p-2">
                        {editingId === character.id ? (
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={editForm.wins}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  wins: parseInt(e.target.value),
                                })
                              }
                              className="w-16 px-2 py-1 border rounded dark:bg-slate-800"
                            />
                            /
                            <input
                              type="number"
                              value={editForm.losses}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  losses: parseInt(e.target.value),
                                })
                              }
                              className="w-16 px-2 py-1 border rounded dark:bg-slate-800"
                            />
                          </div>
                        ) : (
                          `${character.wins}/${character.losses}`
                        )}
                      </td>
                      <td className="p-2 max-w-xs truncate">
                        {character.battle_chat}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          {editingId === character.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleSave(character.id)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingId(null)}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(character)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(character.id)}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}