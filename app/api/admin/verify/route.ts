import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "admin-secret-key";

export async function GET(request: NextRequest) {
  try {
    const token = cookies().get("admin-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      if (decoded.isAdmin) {
        return NextResponse.json({ authenticated: true });
      }
    } catch (error) {
      // Invalid token
    }

    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Admin verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}