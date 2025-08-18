import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-simple";

export async function GET(request: NextRequest) {
  try {
    // Get the NextAuth session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if the user is admin (admin@example.com)
    if (session.user.email === 'admin@example.com') {
      return NextResponse.json({ 
        authenticated: true,
        user: session.user 
      });
    }

    return NextResponse.json(
      { error: "Not authorized as admin" },
      { status: 403 }
    );
  } catch (error) {
    console.error("Admin verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}