/**
 * Script to run the app on port 3009 and execute tests
 * Run with: node scripts/run-test-3009.js
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Text Battle Game on port 3009...\n');

// Set environment variables
const env = {
  ...process.env,
  PORT: '3009',
  NODE_ENV: 'development'
};

// Start the Next.js development server
const server = spawn('npm', ['run', 'dev'], {
  env,
  cwd: path.resolve(__dirname, '..'),
  shell: true,
  stdio: ['ignore', 'pipe', 'pipe']
});

let serverReady = false;

// Monitor server output
server.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(`[SERVER] ${output}`);
  
  // Check if server is ready
  if (output.includes('Ready') || output.includes('started server on') || output.includes('3009')) {
    serverReady = true;
    console.log('\n✅ Server is ready on port 3009!\n');
    
    // Wait a bit more for full initialization
    setTimeout(runTests, 3000);
  }
});

server.stderr.on('data', (data) => {
  process.stderr.write(`[SERVER ERROR] ${data}`);
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`\n[SERVER] Process exited with code ${code}`);
});

// Run tests function
function runTests() {
  console.log('\n🧪 Starting test suite...\n');
  
  const tests = spawn('npx', ['ts-node', 'scripts/test-full-app-3009.ts'], {
    cwd: path.resolve(__dirname, '..'),
    shell: true,
    stdio: 'inherit'
  });
  
  tests.on('close', (code) => {
    console.log(`\n🏁 Tests completed with code ${code}`);
    
    // Kill the server
    console.log('\n🛑 Stopping server...');
    server.kill('SIGTERM');
    
    setTimeout(() => {
      process.exit(code);
    }, 1000);
  });
  
  tests.on('error', (error) => {
    console.error('❌ Failed to run tests:', error);
    server.kill('SIGTERM');
    process.exit(1);
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping server...');
  server.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
  process.exit(0);
});

// Timeout if server doesn't start
setTimeout(() => {
  if (!serverReady) {
    console.error('\n❌ Server failed to start within 30 seconds');
    server.kill('SIGTERM');
    process.exit(1);
  }
}, 30000);