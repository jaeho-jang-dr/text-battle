import { NextRequest, NextResponse } from "next/server";
import { resetAllDailyBattleCounts } from "@/lib/battle";

// POST /api/battles/reset - Reset all daily battle counts
// This endpoint should be called by a cron job at midnight
export async function POST(request: NextRequest) {
  try {
    // Check for API secret to prevent unauthorized resets
    const authHeader = request.headers.get("authorization");
    const apiSecret = process.env.CRON_SECRET || "default-secret-change-in-production";
    
    if (authHeader !== `Bearer ${apiSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Reset all daily battle counts
    const { error } = await resetAllDailyBattleCounts();
    
    if (error) {
      return NextResponse.json(
        { error: error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Daily battle counts reset successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Daily reset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint for manual testing (development only)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }
  
  return NextResponse.json({
    message: "Daily reset endpoint",
    usage: "POST /api/battles/reset with Authorization header",
    note: "This should be called by a cron job at midnight"
  });
}