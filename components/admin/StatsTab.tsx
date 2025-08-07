"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  users: {
    total: number;
    guests: number;
    registered: number;
    activeLastWeek: number;
  };
  characters: {
    total: number;
    player: number;
    npc: number;
  };
  battles: {
    total: number;
    today: number;
    averagePerDay: number;
  };
  topCharacters: Array<{
    id: string;
    name: string;
    elo_score: number;
    wins: number;
    losses: number;
  }>;
}

export function StatsTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div className="text-center py-8">Loading statistics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Users:</span>
                <span className="font-bold">{stats.users.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Registered:</span>
                <span className="font-bold">{stats.users.registered}</span>
              </div>
              <div className="flex justify-between">
                <span>Guests:</span>
                <span className="font-bold">{stats.users.guests}</span>
              </div>
              <div className="flex justify-between">
                <span>Active (7 days):</span>
                <span className="font-bold">{stats.users.activeLastWeek}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Characters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Characters:</span>
                <span className="font-bold">{stats.characters.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Player Characters:</span>
                <span className="font-bold">{stats.characters.player}</span>
              </div>
              <div className="flex justify-between">
                <span>NPCs:</span>
                <span className="font-bold">{stats.characters.npc}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Battles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Battles:</span>
                <span className="font-bold">{stats.battles.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Today:</span>
                <span className="font-bold">{stats.battles.today}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg per Day:</span>
                <span className="font-bold">{stats.battles.averagePerDay}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Characters by ELO</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">#</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">ELO Score</th>
                  <th className="text-left p-2">Wins</th>
                  <th className="text-left p-2">Losses</th>
                  <th className="text-left p-2">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {stats.topCharacters.map((character, index) => {
                  const totalGames = character.wins + character.losses;
                  const winRate = totalGames > 0
                    ? ((character.wins / totalGames) * 100).toFixed(1)
                    : "0.0";
                  
                  return (
                    <tr key={character.id} className="border-b">
                      <td className="p-2">{index + 1}</td>
                      <td className="p-2">{character.name}</td>
                      <td className="p-2 font-bold">{character.elo_score}</td>
                      <td className="p-2">{character.wins}</td>
                      <td className="p-2">{character.losses}</td>
                      <td className="p-2">{winRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}