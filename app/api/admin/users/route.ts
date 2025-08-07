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
      .from("users")
      .select("*, characters(count)", { count: "exact" });

    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      users,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
});

export const PATCH = adminOnly(async (request: NextRequest) => {
  try {
    const { userId, updates } = await request.json();

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log admin action
    await supabase.from("admin_logs").insert({
      action: "user_update",
      target_id: userId,
      details: updates,
      admin_id: "admin",
    });

    return NextResponse.json({ user: data });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
});

export const DELETE = adminOnly(async (request: NextRequest) => {
  try {
    const { userId } = await request.json();

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (error) {
      throw error;
    }

    // Log admin action
    await supabase.from("admin_logs").insert({
      action: "user_delete",
      target_id: userId,
      admin_id: "admin",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
});