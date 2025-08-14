import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-simple";

export async function verifyAdmin(request: NextRequest): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return false;
    }
    
    // Check if user email is admin@example.com
    return session.user.email === "admin@example.com";
  } catch (error) {
    console.error("Admin verification error:", error);
    return false;
  }
}

export function adminOnly(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const isAdmin = await verifyAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access only" },
        { status: 401 }
      );
    }

    return handler(request, ...args);
  };
}