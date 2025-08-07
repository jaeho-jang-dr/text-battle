import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCharacterByUserId } from "@/lib/character";

// GET /api/characters/my - Get current user's character
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const result = await getCharacterByUserId(session.user.id);
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ character: result.data });
  } catch (error) {
    console.error("Error fetching user character:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}