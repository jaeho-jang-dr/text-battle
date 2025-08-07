"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GameSettings {
  daily_battle_limit: number;
  defensive_battle_limit: number;
  attack_battle_limit: number;
  base_score: number;
  elo_multiplier: number;
}

export function SettingsTab() {
  const [settings, setSettings] = useState<GameSettings>({
    daily_battle_limit: 10,
    defensive_battle_limit: 5,
    attack_battle_limit: 3,
    base_score: 100,
    elo_multiplier: 1.5,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Daily Battle Limit
            </label>
            <input
              type="number"
              value={settings.daily_battle_limit}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  daily_battle_limit: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Maximum battles per day per user
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Defensive Battle Limit
            </label>
            <input
              type="number"
              value={settings.defensive_battle_limit}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defensive_battle_limit: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Maximum defensive battles per character
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Attack Battle Limit
            </label>
            <input
              type="number"
              value={settings.attack_battle_limit}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  attack_battle_limit: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Maximum consecutive attacks on same opponent
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Base Score
            </label>
            <input
              type="number"
              value={settings.base_score}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  base_score: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Base score for battle calculations
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              ELO Multiplier
            </label>
            <input
              type="number"
              step="0.1"
              value={settings.elo_multiplier}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  elo_multiplier: parseFloat(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Multiplier for ELO score changes
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full md:w-auto"
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}