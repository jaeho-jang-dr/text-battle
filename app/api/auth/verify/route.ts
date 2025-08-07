import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// GET /api/auth/verify - Verify user authentication
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ userId });
  } catch (error) {
    console.error("Auth verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}