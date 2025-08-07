import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { adminOnly } from "@/lib/admin-auth";

export const GET = adminOnly(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let query = supabase
      .from("characters")
      .select("*, users(username, email)", { count: "exact" });

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data: characters, error, count } = await query
      .order("elo_score", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      characters,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Admin characters fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch characters" },
      { status: 500 }
    );
  }
});

export const PATCH = adminOnly(async (request: NextRequest) => {
  try {
    const { characterId, updates } = await request.json();

    const { data, error } = await supabase
      .from("characters")
      .update(updates)
      .eq("id", characterId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log admin action
    await supabase.from("admin_logs").insert({
      action: "character_update",
      target_id: characterId,
      details: updates,
      admin_id: "admin",
    });

    return NextResponse.json({ character: data });
  } catch (error) {
    console.error("Admin character update error:", error);
    return NextResponse.json(
      { error: "Failed to update character" },
      { status: 500 }
    );
  }
});

export const DELETE = adminOnly(async (request: NextRequest) => {
  try {
    const { characterId } = await request.json();

    const { error } = await supabase
      .from("characters")
      .delete()
      .eq("id", characterId);

    if (error) {
      throw error;
    }

    // Log admin action
    await supabase.from("admin_logs").insert({
      action: "character_delete",
      target_id: characterId,
      admin_id: "admin",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin character delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete character" },
      { status: 500 }
    );
  }
});