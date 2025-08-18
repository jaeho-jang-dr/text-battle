#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🔥 Building for Firebase deployment (Windows)...\n');

// Set environment variable for Windows
process.env.FIREBASE_DEPLOY = 'true';

try {
  // Run the build command
  console.log('📦 Building Next.js application...');
  execSync('npm run build', { 
    stdio: 'inherit',
    env: { ...process.env, FIREBASE_DEPLOY: 'true' }
  });
  
  console.log('\n✅ Build completed successfully!');
  console.log('\n📁 Static files generated in:', path.join(process.cwd(), 'out'));
  console.log('\n🚀 Ready to deploy! Run: firebase deploy');
  
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}