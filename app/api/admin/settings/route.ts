import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { adminOnly } from "@/lib/admin-auth";

export const GET = adminOnly(async (request: NextRequest) => {
  try {
    const { data: settings, error } = await supabase
      .from("game_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error && error.code === "PGRST116") {
      // No settings found, create default
      const defaultSettings = {
        id: 1,
        daily_battle_limit: 10,
        defensive_battle_limit: 5,
        attack_battle_limit: 3,
        base_score: 100,
        elo_multiplier: 1.5,
      };

      const { data: newSettings, error: createError } = await supabase
        .from("game_settings")
        .insert(defaultSettings)
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return NextResponse.json({ settings: newSettings });
    }

    if (error) {
      throw error;
    }

    return NextResponse.json({ settings });
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

    const { data: settings, error } = await supabase
      .from("game_settings")
      .update(updates)
      .eq("id", 1)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log admin action
    await supabase.from("admin_logs").insert({
      action: "settings_update",
      details: updates,
      admin_id: "admin",
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Admin settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
});