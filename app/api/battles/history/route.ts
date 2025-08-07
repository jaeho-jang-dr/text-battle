import { NextRequest, NextResponse } from "next/server";
import { getBattleHistory } from "@/lib/battle";

// GET /api/battles/history - Get battle history for a character
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const characterId = searchParams.get("characterId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    
    if (!characterId) {
      return NextResponse.json(
        { error: "Character ID is required" },
        { status: 400 }
      );
    }
    
    const { data, error } = await getBattleHistory(characterId, limit, offset);
    
    if (error) {
      return NextResponse.json(
        { error: error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Get battle history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}