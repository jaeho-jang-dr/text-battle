import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// Debug endpoint to check database state
export async function GET(request: NextRequest) {
  try {
    // Get all data from mock database
    const collections = ["users", "characters", "battles"];
    const data: any = {};
    
    for (const collectionName of collections) {
      const snapshot = await adminDb.collection(collectionName).get();
      data[collectionName] = [];
      
      snapshot.docs.forEach((doc: any) => {
        data[collectionName].push({
          id: doc.id,
          ...doc.data()
        });
      });
    }
    
    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV || "development",
      hasFirebaseConfig: !!process.env.FIREBASE_PROJECT_ID,
      mockMode: !process.env.FIREBASE_PROJECT_ID,
      data,
      counts: {
        users: data.users.length,
        characters: data.characters.length,
        battles: data.battles.length
      }
    });
  } catch (error: any) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      { 
        error: "Debug endpoint error", 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}