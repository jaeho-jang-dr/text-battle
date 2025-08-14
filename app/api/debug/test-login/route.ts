import { memoryStore } from "@/lib/db/memory-store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Check if email is provided
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }
    
    // Look up user by email
    const user = await memoryStore.getUserByEmail(email);
    
    // Debug info
    console.log(`Test login - Email: ${email}`);
    console.log(`User found: ${user ? 'Yes' : 'No'}`);
    if (user) {
      console.log(`User ID: ${user.id}`);
      console.log(`User password exists: ${!!user.password}`);
      console.log(`Password match: ${user.password === password}`);
    }
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found",
        debug: {
          email,
          totalUsers: memoryStore.users.size,
          allEmails: Array.from(memoryStore.users.values()).map(u => u.email)
        }
      });
    }
    
    // Check password
    if (user.password !== password) {
      return NextResponse.json({
        success: false,
        error: "Invalid password",
        debug: {
          email,
          userExists: true,
          passwordProvided: !!password,
          passwordLength: password ? password.length : 0,
          storedPasswordLength: user.password ? user.password.length : 0,
          passwordPreview: user.password ? `${user.password.substring(0, 2)}...` : 'none'
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.username,
        username: user.username
      }
    });
  } catch (error: any) {
    console.error("Test login error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}