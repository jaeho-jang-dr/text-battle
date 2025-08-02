#!/usr/bin/env node

// Production database initialization script
// Run this after setting up your PostgreSQL database on Neon.tech

const { config } = require('dotenv');
const path = require('path');

// Load production environment variables
config({ path: path.join(__dirname, '..', '.env.production') });

// Force PostgreSQL usage
process.env.USE_SQLITE = 'false';

async function initializeProductionDatabase() {
  console.log('🚀 Production Database Initialization');
  console.log('====================================');
  
  // Check required environment variables
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env.production');
    console.log('\nPlease set up a PostgreSQL database on Neon.tech and update .env.production');
    console.log('Example: DATABASE_URL=postgresql://username:password@host.neon.tech/database?sslmode=require');
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY is not set. Battle judgments will not work properly.');
  }

  console.log('📊 Database URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
  console.log('🌍 Environment: Production');
  console.log('🐘 Database Type: PostgreSQL\n');

  try {
    // Import the database initialization function
    const { initializeDatabase } = require('../lib/db');
    
    console.log('🔧 Starting database initialization...\n');
    
    // Run the initialization
    await initializeDatabase();
    
    console.log('\n✅ Production database initialized successfully!');
    console.log('\nNext steps:');
    console.log('1. Deploy to Vercel: vercel --prod');
    console.log('2. Set environment variables in Vercel dashboard');
    console.log('3. Test your deployed application');
    
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    console.error('\nCommon issues:');
    console.error('- Invalid DATABASE_URL format');
    console.error('- Database server not accessible');
    console.error('- Incorrect credentials');
    console.error('- Database does not exist');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeProductionDatabase();
}