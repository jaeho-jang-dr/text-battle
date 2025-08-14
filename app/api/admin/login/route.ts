import { NextRequest, NextResponse } from "next/server";
import { signIn } from "next-auth/react";
import { memoryStore } from "@/lib/db/memory-store";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Check admin credentials from memory store
    // Username must be 'admin' and password must match
    if (username !== 'admin') {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const adminUser = await memoryStore.getAdminByEmail('admin@example.com');
    
    if (!adminUser || password !== adminUser.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Log admin login
    await memoryStore.createAdminLog({
      adminId: adminUser.id,
      action: "admin_login",
      details: {
        loginTime: new Date(),
        userAgent: request.headers.get('user-agent')
      }
    });

    // Update last login time
    adminUser.lastLoginAt = new Date();
    memoryStore.adminUsers.set(adminUser.id, adminUser);

    // Note: The actual session should be handled by NextAuth
    // This endpoint is just for verification
    return NextResponse.json({ 
      success: true,
      message: "Please use NextAuth login with admin@example.com"
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}