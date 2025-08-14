import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-simple";
import { getCharactersByUserId } from "@/lib/character-server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: characters, error } = await getCharactersByUserId(session.user.id);

    if (error) {
      return NextResponse.json(
        { error: error },
        { status: 500 }
      );
    }

    // Return array of characters
    return NextResponse.json({ characters: characters || [] });
  } catch (error) {
    console.error("Get my characters error:", error);
    return NextResponse.json(
      { error: "Failed to fetch characters" },
      { status: 500 }
    );
  }
}