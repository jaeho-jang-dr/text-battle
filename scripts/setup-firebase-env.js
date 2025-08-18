#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupFirebaseEnv() {
  console.log('🔥 Firebase Environment Setup Helper\n');
  
  const envPath = path.join(process.cwd(), '.env.production.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  // Check if .env.example exists
  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ .env.example file not found!');
    process.exit(1);
  }
  
  // Check if .env.production.local already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question('.env.production.local already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      process.exit(0);
    }
  }
  
  console.log('\nPlease provide the following information:\n');
  
  // Collect Firebase configuration
  const config = {};
  
  config.NEXTAUTH_URL = await question('Production URL (e.g., https://your-domain.com): ');
  
  // Generate a secure NEXTAUTH_SECRET
  const crypto = require('crypto');
  config.NEXTAUTH_SECRET = crypto.randomBytes(32).toString('base64');
  console.log(`✅ Generated NEXTAUTH_SECRET: ${config.NEXTAUTH_SECRET}`);
  
  console.log('\n📋 Firebase Configuration (from Firebase Console > Project Settings):');
  config.NEXT_PUBLIC_FIREBASE_API_KEY = await question('API Key: ');
  config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = await question('Auth Domain: ');
  config.NEXT_PUBLIC_FIREBASE_PROJECT_ID = await question('Project ID: ');
  config.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = await question('Storage Bucket: ');
  config.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = await question('Messaging Sender ID: ');
  config.NEXT_PUBLIC_FIREBASE_APP_ID = await question('App ID: ');
  
  console.log('\n🔐 Firebase Admin SDK (from Service Accounts tab):');
  config.FIREBASE_PROJECT_ID = config.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  config.FIREBASE_CLIENT_EMAIL = await question('Client Email: ');
  
  console.log('\nPaste your private key (press Enter twice when done):');
  let privateKey = '';
  let line;
  while ((line = await question('')) !== '') {
    privateKey += line + '\\n';
  }
  config.FIREBASE_PRIVATE_KEY = `"${privateKey.trim()}"`;
  
  console.log('\n👤 Admin Credentials:');
  config.ADMIN_USERNAME = await question('Admin Username: ');
  config.ADMIN_PASSWORD = await question('Admin Password: ');
  
  // Generate CRON_SECRET
  config.CRON_SECRET = crypto.randomBytes(32).toString('base64');
  console.log(`✅ Generated CRON_SECRET: ${config.CRON_SECRET}`);
  
  // Optional configurations
  console.log('\n📱 Optional: Kakao OAuth (press Enter to skip):');
  config.KAKAO_CLIENT_ID = await question('Kakao Client ID: ') || '';
  config.KAKAO_CLIENT_SECRET = await question('Kakao Client Secret: ') || '';
  
  console.log('\n🤖 Optional: OpenAI (press Enter to skip):');
  config.OPENAI_API_KEY = await question('OpenAI API Key: ') || '';
  
  // Generate .env.production.local file
  let envContent = `# NextAuth Configuration
NEXTAUTH_URL=${config.NEXTAUTH_URL}
NEXTAUTH_SECRET=${config.NEXTAUTH_SECRET}

# Firebase Configuration (Production)
NEXT_PUBLIC_FIREBASE_API_KEY=${config.NEXT_PUBLIC_FIREBASE_API_KEY}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${config.NEXT_PUBLIC_FIREBASE_PROJECT_ID}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${config.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${config.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}
NEXT_PUBLIC_FIREBASE_APP_ID=${config.NEXT_PUBLIC_FIREBASE_APP_ID}

# Firebase Admin SDK
FIREBASE_PROJECT_ID=${config.FIREBASE_PROJECT_ID}
FIREBASE_CLIENT_EMAIL=${config.FIREBASE_CLIENT_EMAIL}
FIREBASE_PRIVATE_KEY=${config.FIREBASE_PRIVATE_KEY}

# Admin Credentials
ADMIN_USERNAME=${config.ADMIN_USERNAME}
ADMIN_PASSWORD=${config.ADMIN_PASSWORD}

# Cron Job Secret
CRON_SECRET=${config.CRON_SECRET}
`;

  if (config.KAKAO_CLIENT_ID || config.KAKAO_CLIENT_SECRET) {
    envContent += `
# Kakao OAuth
KAKAO_CLIENT_ID=${config.KAKAO_CLIENT_ID}
KAKAO_CLIENT_SECRET=${config.KAKAO_CLIENT_SECRET}
`;
  }

  if (config.OPENAI_API_KEY) {
    envContent += `
# OpenAI Configuration
OPENAI_API_KEY=${config.OPENAI_API_KEY}
`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log(`\n✅ Created ${envPath}`);
  
  // Update .firebaserc
  const firebaseRcPath = path.join(process.cwd(), '.firebaserc');
  const firebaseRc = {
    projects: {
      default: config.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      production: config.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    }
  };
  
  fs.writeFileSync(firebaseRcPath, JSON.stringify(firebaseRc, null, 2));
  console.log(`✅ Updated .firebaserc with project ID: ${config.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
  
  console.log('\n🎉 Setup complete! Next steps:');
  console.log('1. Run "npm run build:firebase" to build the project');
  console.log('2. Run "npm run firebase:deploy" to deploy to Firebase');
  console.log('\n⚠️  Important: Keep your .env.production.local file secure and never commit it to git!');
  
  rl.close();
}

setupFirebaseEnv().catch(console.error);