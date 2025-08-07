import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: false,
    error: 'Database setup disabled for build. Using SQLite instead.'
  }, { status: 503 });
}