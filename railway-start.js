#!/usr/bin/env node

console.log('🚂 Starting Kid Text Battle on Railway...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT || 3008);

// Database initialization
const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'kid-text-battle.db');
console.log('Database path:', dbPath);

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.log('Database not found, will be created automatically on first access');
} else {
  console.log('Database found, ready to serve');
}

// Start the Next.js server
const { spawn } = require('child_process');
const server = spawn('npm', ['start'], { 
  stdio: 'inherit',
  env: { ...process.env, PORT: process.env.PORT || 3008 }
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');  
  server.kill('SIGINT');
});