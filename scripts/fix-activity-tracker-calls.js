#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function fixFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;
    
    // Fix updateUserActivity calls
    if (content.includes('updateUserActivity(') && !content.includes('await updateUserActivity(')) {
      content = content.replace(
        /(?<!await\s+)updateUserActivity\(/g,
        'await updateUserActivity('
      );
      modified = true;
    }
    
    // Fix logUserAction calls
    if (content.includes('logUserAction(') && !content.includes('await logUserAction(')) {
      content = content.replace(
        /(?<!await\s+)logUserAction\(/g,
        'await logUserAction('
      );
      modified = true;
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

async function main() {
  console.log('🔧 Fixing activity tracker calls...\n');
  
  const files = [
    'app/api/auth/login/route.ts',
    'app/api/characters/[characterId]/battle-text/route.ts',
    'app/api/characters/route.ts',
    'app/api/battles/route.ts'
  ];
  
  let fixedCount = 0;
  for (const file of files) {
    const fullPath = path.join(process.cwd(), file);
    const fixed = await fixFile(fullPath);
    if (fixed) fixedCount++;
  }
  
  console.log(`\n✅ Fixed ${fixedCount} files.`);
}

main().catch(console.error);