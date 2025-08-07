import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { adminOnly } from "@/lib/admin-auth";

export const GET = adminOnly(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");
    const characterId = url.searchParams.get("characterId");

    let query = supabase
      .from("battles")
      .select(`
        *,
        attacker:characters!attacker_id(name, elo_score),
        defender:characters!defender_id(name, elo_score),
        winner:characters!winner_id(name)
      `, { count: "exact" });

    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }

    if (dateTo) {
      query = query.lte("created_at", dateTo);
    }

    if (characterId) {
      query = query.or(`attacker_id.eq.${characterId},defender_id.eq.${characterId}`);
    }

    const { data: battles, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      battles,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Admin battles fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch battles" },
      { status: 500 }
    );
  }
});