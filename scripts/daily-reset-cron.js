#!/usr/bin/env node

/**
 * Daily Battle Reset Cron Job
 * 
 * This script should be scheduled to run at midnight (00:00) daily.
 * It calls the battle reset API endpoint to reset daily battle limits.
 * 
 * Usage:
 * - Set CRON_SECRET environment variable to match your API secret
 * - Set API_URL to your deployment URL
 * - Schedule this script with your preferred cron service:
 *   - Vercel Cron: Add to vercel.json
 *   - Railway: Use railway cron
 *   - Heroku Scheduler: Add as scheduled job
 *   - Traditional cron: 0 0 * * * /path/to/node /path/to/daily-reset-cron.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'default-secret-change-in-production';

async function resetDailyBattles() {
  try {
    console.log(`[${new Date().toISOString()}] Starting daily battle reset...`);
    
    const response = await fetch(`${API_URL}/api/battles/reset`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Reset failed: ${data.error || response.statusText}`);
    }
    
    console.log(`[${new Date().toISOString()}] Daily battle reset completed successfully`);
    console.log('Response:', data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Daily battle reset failed:`, error.message);
    process.exit(1);
  }
}

// Run the reset
resetDailyBattles();