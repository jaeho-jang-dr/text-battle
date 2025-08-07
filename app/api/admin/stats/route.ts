import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { adminOnly } from "@/lib/admin-auth";

export const GET = adminOnly(async (request: NextRequest) => {
  try {
    // Get total users count
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // Get guest users count
    const { count: guestUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("is_guest", true);

    // Get total characters count
    const { count: totalCharacters } = await supabase
      .from("characters")
      .select("*", { count: "exact", head: true });

    // Get NPC characters count
    const { count: npcCharacters } = await supabase
      .from("characters")
      .select("*", { count: "exact", head: true })
      .eq("is_npc", true);

    // Get total battles count
    const { count: totalBattles } = await supabase
      .from("battles")
      .select("*", { count: "exact", head: true });

    // Get battles today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: battlesToday } = await supabase
      .from("battles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    // Get active users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentBattles } = await supabase
      .from("battles")
      .select("attacker_id, defender_id")
      .gte("created_at", sevenDaysAgo.toISOString());

    const activeCharacterIds = new Set();
    recentBattles?.forEach(battle => {
      activeCharacterIds.add(battle.attacker_id);
      activeCharacterIds.add(battle.defender_id);
    });

    // Get unique user IDs from active characters
    const { data: activeCharacters } = await supabase
      .from("characters")
      .select("user_id")
      .in("id", Array.from(activeCharacterIds));

    const activeUserIds = new Set(activeCharacters?.map(c => c.user_id) || []);

    // Get top 10 characters by ELO
    const { data: topCharacters } = await supabase
      .from("characters")
      .select("id, name, elo_score, wins, losses")
      .order("elo_score", { ascending: false })
      .limit(10);

    // Get battle statistics by hour (last 24 hours)
    const { data: battlesByHour } = await supabase
      .rpc("get_battles_by_hour");

    return NextResponse.json({
      stats: {
        users: {
          total: totalUsers || 0,
          guests: guestUsers || 0,
          registered: (totalUsers || 0) - (guestUsers || 0),
          activeLastWeek: activeUserIds.size,
        },
        characters: {
          total: totalCharacters || 0,
          player: (totalCharacters || 0) - (npcCharacters || 0),
          npc: npcCharacters || 0,
        },
        battles: {
          total: totalBattles || 0,
          today: battlesToday || 0,
          averagePerDay: Math.round((totalBattles || 0) / 30), // Rough estimate
        },
        topCharacters,
        battlesByHour,
      },
    });
  } catch (error) {
    console.error("Admin stats fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
});