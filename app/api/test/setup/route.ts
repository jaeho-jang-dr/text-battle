import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: false,
    error: 'Test setup disabled for build. Using SQLite instead.'
  }, { status: 503 });
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'SQLite database is ready'
  });
}