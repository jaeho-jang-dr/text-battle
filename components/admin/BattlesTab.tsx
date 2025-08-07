"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Battle {
  id: string;
  attacker_id: string;
  defender_id: string;
  winner_id: string;
  attacker_score: number;
  defender_score: number;
  battle_log: string;
  created_at: string;
  attacker: {
    name: string;
    elo_score: number;
  };
  defender: {
    name: string;
    elo_score: number;
  };
  winner: {
    name: string;
  };
}

export function BattlesTab() {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    characterId: "",
  });
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);

  useEffect(() => {
    fetchBattles();
  }, [page, filters]);

  const fetchBattles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.characterId && { characterId: filters.characterId }),
      });

      const response = await fetch(`/api/admin/battles?${params}`);
      const data = await response.json();

      setBattles(data.battles || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch battles:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Battle Logs</CardTitle>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input
              type="datetime-local"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input
              type="datetime-local"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => {
                setFilters({ dateFrom: "", dateTo: "", characterId: "" });
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
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
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Attacker</th>
                    <th className="text-left p-2">Defender</th>
                    <th className="text-left p-2">Winner</th>
                    <th className="text-left p-2">Score</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {battles.map((battle) => (
                    <tr key={battle.id} className="border-b">
                      <td className="p-2">{formatDate(battle.created_at)}</td>
                      <td className="p-2">
                        {battle.attacker.name} ({battle.attacker.elo_score})
                      </td>
                      <td className="p-2">
                        {battle.defender.name} ({battle.defender.elo_score})
                      </td>
                      <td className="p-2">
                        <span
                          className={`font-bold ${
                            battle.winner_id === battle.attacker_id
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {battle.winner.name}
                        </span>
                      </td>
                      <td className="p-2">
                        {battle.attacker_score} - {battle.defender_score}
                      </td>
                      <td className="p-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedBattle(battle)}
                        >
                          View Log
                        </Button>
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

        {selectedBattle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Battle Log</h3>
              <div className="mb-4">
                <p>
                  <strong>Date:</strong> {formatDate(selectedBattle.created_at)}
                </p>
                <p>
                  <strong>Attacker:</strong> {selectedBattle.attacker.name} (
                  {selectedBattle.attacker.elo_score})
                </p>
                <p>
                  <strong>Defender:</strong> {selectedBattle.defender.name} (
                  {selectedBattle.defender.elo_score})
                </p>
                <p>
                  <strong>Winner:</strong> {selectedBattle.winner.name}
                </p>
                <p>
                  <strong>Final Score:</strong> {selectedBattle.attacker_score}{" "}
                  - {selectedBattle.defender_score}
                </p>
              </div>
              <div className="bg-gray-100 dark:bg-slate-900 p-4 rounded">
                <pre className="whitespace-pre-wrap text-sm">
                  {selectedBattle.battle_log}
                </pre>
              </div>
              <Button
                className="mt-4"
                onClick={() => setSelectedBattle(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}