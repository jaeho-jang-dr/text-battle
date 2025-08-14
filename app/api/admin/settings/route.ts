import { NextRequest, NextResponse } from "next/server";
import { adminOnly } from "@/lib/admin-auth-nextauth";
import { memoryStore } from "@/lib/db/memory-store";

export const GET = adminOnly(async (request: NextRequest) => {
  try {
    // Get all system settings from memory store
    const settings: Record<string, any> = {};
    
    // Convert Map to object for easier frontend consumption
    Array.from(memoryStore.systemSettings.entries()).forEach(([key, setting]) => {
      settings[key] = setting.value;
    });

    // Add additional settings that might not be in systemSettings
    const defaultSettings = {
      daily_battle_limit: await memoryStore.getSystemSetting('daily_battle_limit') || 20,
      battle_cooldown_minutes: await memoryStore.getSystemSetting('battle_cooldown_minutes') || 5,
      maintenance_mode: await memoryStore.getSystemSetting('maintenance_mode') || false,
      new_user_bonus_rating: await memoryStore.getSystemSetting('new_user_bonus_rating') || 1000,
      defensive_battle_limit: 5,
      attack_battle_limit: 3,
      base_score: 100,
      elo_multiplier: 1.5
    };

    return NextResponse.json({ 
      settings: {
        id: "default",
        ...defaultSettings,
        ...settings
      }
    });
  } catch (error) {
    console.error("Admin settings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
});

export const PUT = adminOnly(async (request: NextRequest) => {
  try {
    const updates = await request.json();

    // Update each setting in memory store
    const updateEntries = Object.entries(updates);
    for (let i = 0; i < updateEntries.length; i++) {
      const [key, value] = updateEntries[i];
      await memoryStore.updateSystemSetting(key, value, "admin@example.com");
    }

    // Log admin action
    await memoryStore.createAdminLog({
      adminId: "admin@example.com",
      action: "settings_update",
      details: updates
    });

    // Return updated settings
    const settings: Record<string, any> = {};
    Array.from(memoryStore.systemSettings.entries()).forEach(([key, setting]) => {
      settings[key] = setting.value;
    });

    return NextResponse.json({ 
      settings: {
        id: "default",
        ...settings,
        updated_at: new Date()
      }
    });
  } catch (error) {
    console.error("Admin settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
});