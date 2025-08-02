#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function fixFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;
    
    // Fix double db.prepare calls
    const pattern = /await db\.prepare\(db\.prepare\(/g;
    if (pattern.test(content)) {
      content = content.replace(pattern, 'await db.prepare(');
      modified = true;
    }
    
    // Fix db.prepare without await in async contexts
    const patterns = [
      {
        from: /const\s+(\w+)\s*=\s*db\.prepare\(/g,
        to: 'const $1 = await db.prepare('
      }
    ];
    
    for (const pattern of patterns) {
      if (pattern.from.test(content)) {
        content = content.replace(pattern.from, pattern.to);
        modified = true;
      }
    }
    
    if (modified) {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

async function findApiFiles(dir) {
  const files = await fs.readdir(dir);
  const apiFiles = [];
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory()) {
      apiFiles.push(...await findApiFiles(fullPath));
    } else if (file === 'route.ts' || file === 'route.js') {
      apiFiles.push(fullPath);
    }
  }
  
  return apiFiles;
}

async function main() {
  console.log('🔧 Fixing double db.prepare calls...\n');
  
  const apiDir = path.join(__dirname, '..', 'app', 'api');
  const apiFiles = await findApiFiles(apiDir);
  
  let fixedCount = 0;
  for (const file of apiFiles) {
    const fixed = await fixFile(file);
    if (fixed) fixedCount++;
  }
  
  console.log(`\n✅ Fixed ${fixedCount} files.`);
}

main().catch(console.error);