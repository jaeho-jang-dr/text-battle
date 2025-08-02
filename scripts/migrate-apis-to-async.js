#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function updateFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;
    
    // Check if already has async keyword in exports
    const hasAsyncExports = /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)/g.test(content);
    
    if (!hasAsyncExports) {
      // Add async to export functions
      content = content.replace(
        /export\s+function\s+(GET|POST|PUT|DELETE|PATCH)/g,
        'export async function $1'
      );
      modified = true;
    }
    
    // Add await to db operations
    const patterns = [
      {
        // db.prepare().get()
        from: /(?<!await\s+)db\.prepare\([^)]+\)\.get\(/g,
        to: 'await db.prepare($&'
      },
      {
        // db.prepare().all()
        from: /(?<!await\s+)db\.prepare\([^)]+\)\.all\(/g,
        to: 'await db.prepare($&'
      },
      {
        // db.prepare().run()
        from: /(?<!await\s+)db\.prepare\([^)]+\)\.run\(/g,
        to: 'await db.prepare($&'
      },
      {
        // stmt.run()
        from: /(?<!await\s+)stmt\.run\(/g,
        to: 'await stmt.run('
      },
      {
        // stmt.get()
        from: /(?<!await\s+)stmt\.get\(/g,
        to: 'await stmt.get('
      },
      {
        // stmt.all()
        from: /(?<!await\s+)stmt\.all\(/g,
        to: 'await stmt.all('
      },
      {
        // db.exec()
        from: /(?<!await\s+)db\.exec\(/g,
        to: 'await db.exec('
      }
    ];
    
    for (const pattern of patterns) {
      if (pattern.from.test(content)) {
        content = content.replace(pattern.from, match => {
          // Check if this is inside a transaction
          const beforeMatch = content.substring(0, content.indexOf(match));
          const lines = beforeMatch.split('\n');
          let insideTransaction = false;
          
          for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].includes('db.transaction')) {
              insideTransaction = true;
              break;
            }
            if (lines[i].includes('});') || lines[i].includes('} catch')) {
              break;
            }
          }
          
          return match.replace(pattern.from, pattern.to);
        });
        modified = true;
      }
    }
    
    // Fix transaction patterns
    if (content.includes('db.transaction(')) {
      // Convert sync transactions to async
      content = content.replace(
        /const\s+(\w+)\s*=\s*db\.transaction\s*\(\s*\(\s*\)\s*=>\s*\{/g,
        'await db.transaction(async (sql) => {'
      );
      
      // Remove transaction() calls
      content = content.replace(/^\s*\w+\(\);\s*$/gm, '');
      
      modified = true;
    }
    
    if (modified) {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  Skipped (already async): ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
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
  console.log('🔄 Starting API route migration to async...\n');
  
  const apiDir = path.join(__dirname, '..', 'app', 'api');
  const apiFiles = await findApiFiles(apiDir);
  
  console.log(`Found ${apiFiles.length} API route files\n`);
  
  let updatedCount = 0;
  for (const file of apiFiles) {
    const updated = await updateFile(file);
    if (updated) updatedCount++;
  }
  
  console.log(`\n✅ Migration complete! Updated ${updatedCount} files.`);
  
  if (updatedCount > 0) {
    console.log('\n⚠️  Important: Please review the changes and test thoroughly!');
    console.log('Some complex patterns may need manual adjustment.');
  }
}

main().catch(console.error);