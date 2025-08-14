import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-simple";
import { getUserBattleStats } from "@/lib/battle-server";

// GET /api/battles/stats - Get user's battle statistics
export async function GET(request: NextRequest) {
  try {
    // Get the current user from session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
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