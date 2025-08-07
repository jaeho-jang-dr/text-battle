import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get battle limit from admin_settings
    const settingRow = db.prepare(
      'SELECT setting_value FROM admin_settings WHERE setting_key = ?'
    ).get('daily_active_battle_limit') as { setting_value: string } | undefined;

    const battleLimit = settingRow ? parseInt(settingRow.setting_value) : 10;

    return NextResponse.json({
      success: true,
      data: {
        dailyBattleLimit: battleLimit
      }
    });
  } catch (error) {
    console.error('Get battle limit error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '배틀 제한 정보를 가져오는데 실패했습니다'
      },
      { status: 500 }
    );
  }
}