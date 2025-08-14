/**
 * Deploy Firestore indexes
 * Run with: node scripts/deploy-indexes.js
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Deploying Firestore indexes...\n');

const indexesPath = path.join(__dirname, '..', 'firestore.indexes.json');

// Deploy indexes using Firebase CLI
const command = `firebase deploy --only firestore:indexes`;

console.log(`Running: ${command}\n`);

exec(command, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error deploying indexes:', error.message);
    console.error(stderr);
    process.exit(1);
  }
  
  console.log('📋 Output:', stdout);
  
  if (stderr) {
    console.log('⚠️ Warnings:', stderr);
  }
  
  console.log('\n✅ Indexes deployed successfully!');
  console.log('\n📝 Note: It may take a few minutes for the indexes to be fully built in Firestore.');
});

// Alternative: Just show the indexes that need to be created
console.log('\n📌 If Firebase CLI is not available, create these indexes manually in Firebase Console:\n');

const indexes = require(indexesPath);
indexes.indexes.forEach((index, i) => {
  console.log(`${i + 1}. Collection: ${index.collectionGroup}`);
  console.log('   Fields:');
  index.fields.forEach(field => {
    console.log(`   - ${field.fieldPath} (${field.order})`);
  });
  console.log('');
});