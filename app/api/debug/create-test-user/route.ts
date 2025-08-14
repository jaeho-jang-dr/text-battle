import { memoryStore } from "@/lib/db/memory-store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json();
    
    // Check if user already exists
    const existingUser = await memoryStore.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: "User already exists",
        debug: {
          email,
          existingUserId: existingUser.id
        }
      });
    }
    
    // Create new user
    const userId = `user_test_${Date.now()}`;
    const user = {
      id: userId,
      email,
      name: username || email,
      username: username || email,
      password,
      provider: 'credentials',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await memoryStore.createUser(user);
    
    // Verify creation
    const verifyUser = await memoryStore.getUserByEmail(email);
    
    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        username: username || email
      },
      verified: !!verifyUser,
      debug: {
        totalUsers: memoryStore.users.size,
        allEmails: Array.from(memoryStore.users.values()).map(u => u.email)
      }
    });
  } catch (error: any) {
    console.error("Create test user error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}