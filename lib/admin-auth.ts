import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "admin-secret-key";

export async function verifyAdmin(request: NextRequest): Promise<boolean> {
  try {
    const token = cookies().get("admin-token")?.value;

    if (!token) {
      return false;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.isAdmin === true;
  } catch (error) {
    return false;
  }
}

export function adminOnly(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const isAdmin = await verifyAdmin(request);
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return handler(request, ...args);
  };
}