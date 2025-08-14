import { memoryStore } from "@/lib/db/memory-store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get all users from memory store
    const users = Array.from(memoryStore.users.values()).map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      provider: user.provider,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0,
      createdAt: user.createdAt
    }));

    return NextResponse.json({
      success: true,
      users,
      count: users.length,
      message: "Debug endpoint - showing all users in memory store"
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}