import { NextRequest, NextResponse } from "next/server";
import { createBattle, checkBattleRestrictions, updateBattleRestrictions } from "@/lib/battle-server";
import { getCharacterById } from "@/lib/character-server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-simple";

// POST /api/battles - Create a new battle
export async function POST(request: NextRequest) {
  try {
    const { attackerId, defenderId } = await request.json();
    
    if (!attackerId || !defenderId) {
      return NextResponse.json(
        { error: "Attacker and defender IDs are required" },
        { status: 400 }
      );
    }
    
    // Get the current user from session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Verify that the attacker belongs to the current user
    const { data: attacker, error: attackerError } = await getCharacterById(attackerId);
    
    if (attackerError || !attacker) {
      return NextResponse.json(
        { error: "Attacker character not found" },
        { status: 404 }
      );
    }
    
    if (attacker.userId !== userId && !attacker.isNPC) {
      return NextResponse.json(
        { error: "You can only battle with your own character" },
        { status: 403 }
      );
    }
    
    // Check battle restrictions
    const { canBattle, error: restrictionError } = await checkBattleRestrictions(
      userId,
      attackerId,
      defenderId,
      true // isAttacking
    );
    
    if (!canBattle) {
      return NextResponse.json(
        { error: restrictionError || "Battle not allowed" },
        { status: 403 }
      );
    }
    
    // Create the battle (this also updates restrictions internally)
    const { data: battle, error: battleError } = await createBattle(attackerId, defenderId);
    
    if (battleError || !battle) {
      return NextResponse.json(
        { error: battleError || "Failed to create battle" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data: battle });
  } catch (error) {
    console.error("Battle creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}