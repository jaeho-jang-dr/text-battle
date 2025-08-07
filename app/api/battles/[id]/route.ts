import { NextRequest, NextResponse } from "next/server";
import { getDetailedBattle } from "@/lib/battle";

// GET /api/battles/[id] - Get battle details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const battleId = params.id;
    
    if (!battleId) {
      return NextResponse.json(
        { error: "Battle ID is required" },
        { status: 400 }
      );
    }
    
    const { data, error } = await getDetailedBattle(battleId);
    
    if (error || !data) {
      return NextResponse.json(
        { error: error || "Battle not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Get battle error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}