#!/usr/bin/env node

/**
 * This script helps identify and update API routes to use async PostgreSQL queries
 * It lists all the patterns that need to be changed from sync to async
 */

const fs = require('fs');
const path = require('path');

console.log('API Route Async Migration Guide\n');
console.log('=================================\n');

console.log('Key changes needed:\n');

console.log('1. Add "async" to all route handlers:');
console.log('   Before: export function POST(request: NextRequest) {');
console.log('   After:  export async function POST(request: NextRequest) {\n');

console.log('2. Add "await" to all database operations:');
console.log('   Before: const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);');
console.log('   After:  const user = await db.prepare("SELECT * FROM users WHERE id = ?").get(userId);\n');

console.log('3. Convert transactions:');
console.log('   Before:');
console.log('   const transaction = db.transaction(() => {');
console.log('     // operations');
console.log('   });');
console.log('   transaction();');
console.log('');
console.log('   After:');
console.log('   await db.transaction(async (sql) => {');
console.log('     // await operations');
console.log('   });\n');

console.log('4. Update CURRENT_TIMESTAMP to PostgreSQL syntax:');
console.log('   SQLite: CURRENT_TIMESTAMP');
console.log('   PostgreSQL: CURRENT_TIMESTAMP or NOW()\n');

console.log('5. Update placeholder syntax:');
console.log('   SQLite: VALUES (?, ?, ?)');
console.log('   PostgreSQL: VALUES ($1, $2, $3)\n');

console.log('6. Common patterns to update:');
console.log('   - db.prepare(...).get() → await db.prepare(...).get()');
console.log('   - db.prepare(...).all() → await db.prepare(...).all()');
console.log('   - db.prepare(...).run() → await db.prepare(...).run()');
console.log('   - db.exec(...) → await db.exec(...)\n');

console.log('Files that need updating:');

const apiDir = path.join(__dirname, '..', 'app', 'api');

function findApiFiles(dir) {
  const files = fs.readdirSync(dir);
  const apiFiles = [];
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      apiFiles.push(...findApiFiles(fullPath));
    } else if (file === 'route.ts' || file === 'route.js') {
      apiFiles.push(fullPath);
    }
  }
  
  return apiFiles;
}

const apiFiles = findApiFiles(apiDir);
apiFiles.forEach((file, index) => {
  console.log(`${index + 1}. ${file.replace(path.join(__dirname, '..'), '.')}`);
});

console.log('\nTotal files to update:', apiFiles.length);