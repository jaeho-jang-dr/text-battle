import { memoryStore } from "@/lib/db/memory-store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }
    
    // Find user by email
    let user = await memoryStore.getUserByEmail(email);
    
    if (user) {
      // Update existing user's password
      await memoryStore.updateUser(user.id, { password });
      return NextResponse.json({
        success: true,
        message: "Password updated successfully",
        user: {
          id: user.id,
          email: user.email,
          username: user.username || user.name
        }
      });
    } else {
      // Create new user with the provided credentials
      const userId = `user_reset_${Date.now()}`;
      const newUser = {
        id: userId,
        email,
        name: email.split('@')[0],
        username: email.split('@')[0],
        password,
        provider: 'credentials',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await memoryStore.createUser(newUser);
      
      return NextResponse.json({
        success: true,
        message: "User created successfully",
        user: {
          id: userId,
          email,
          username: newUser.username
        }
      });
    }
  } catch (error: any) {
    console.error("Reset user error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}