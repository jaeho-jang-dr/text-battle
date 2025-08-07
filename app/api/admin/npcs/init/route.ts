import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { npcCharacters } from "@/lib/npc-data";

// POST /api/admin/npcs/init - Initialize NPC characters
export async function POST(req: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify admin status (you might want to add an isAdmin field to your user table)
    const { data: user } = await supabase
      .from("users")
      .select("username")
      .eq("id", session.user.id)
      .single();

    if (!user || user.username !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Check if NPCs already exist
    const { data: existingNPCs, error: checkError } = await supabase
      .from("characters")
      .select("name")
      .eq("is_npc", true);

    if (checkError) {
      return NextResponse.json(
        { error: "Failed to check existing NPCs" },
        { status: 500 }
      );
    }

    if (existingNPCs && existingNPCs.length > 0) {
      return NextResponse.json({
        message: `NPCs already initialized. Found ${existingNPCs.length} NPCs.`,
        count: existingNPCs.length
      });
    }

    // Create NPCs
    const npcsToInsert = npcCharacters.map(npc => ({
      name: npc.name,
      battle_chat: npc.battleChat,
      elo_score: npc.eloScore,
      wins: 0,
      losses: 0,
      is_npc: true,
      user_id: null
    }));

    const { data, error } = await supabase
      .from("characters")
      .insert(npcsToInsert)
      .select();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create NPCs" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "NPCs initialized successfully",
      count: data.length,
      npcs: data.map(npc => ({
        name: npc.name,
        eloScore: npc.elo_score
      }))
    });

  } catch (error) {
    console.error("Error initializing NPCs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}