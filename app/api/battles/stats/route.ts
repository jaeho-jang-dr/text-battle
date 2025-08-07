import { NextRequest, NextResponse } from "next/server";
import { getUserBattleStats } from "@/lib/battle";
import { cookies } from "next/headers";

// GET /api/battles/stats - Get user's battle statistics
export async function GET(request: NextRequest) {
  try {
    // Get the current user from session
    const cookieStore = cookies();
    const userId = cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Get battle stats
    const { data: stats, error } = await getUserBattleStats(userId);
    
    if (error || !stats) {
      return NextResponse.json(
        { error: error || "Failed to get battle stats" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error("Battle stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}