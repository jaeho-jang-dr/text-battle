#!/usr/bin/env node

/**
 * Test Daily Reset Script
 * 
 * This script is for testing the daily reset functionality during development.
 * It allows you to manually trigger a daily reset without waiting for midnight.
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_URL = process.env.API_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'default-secret-change-in-production';

async function testReset() {
  console.log('Testing Daily Battle Reset...');
  console.log(`API URL: ${API_URL}`);
  console.log(`Using secret: ${CRON_SECRET.substring(0, 5)}...`);
  
  rl.question('\nAre you sure you want to reset all daily battle counts? (yes/no): ', async (answer) => {
    if (answer.toLowerCase() !== 'yes') {
      console.log('Reset cancelled.');
      rl.close();
      return;
    }
    
    try {
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
      
      console.log('\n✅ Daily battle reset completed successfully!');
      console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('\n❌ Reset failed:', error.message);
    } finally {
      rl.close();
    }
  });
}

// Check if running in development
if (process.env.NODE_ENV === 'production') {
  console.error('⚠️  Warning: This script should only be run in development!');
  console.error('Use the proper cron job in production.');
  process.exit(1);
}

testReset();