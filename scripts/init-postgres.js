#!/usr/bin/env node

/**
 * PostgreSQL Database Initialization Script
 * Run this script to initialize the PostgreSQL database with schema and initial data
 * 
 * Usage: DATABASE_URL=your_postgres_url node scripts/init-postgres.js
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function initDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('🔧 Connecting to PostgreSQL database...');
  const sql = neon(databaseUrl);

  try {
    // Check if tables exist
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      ) as exists
    `;

    if (tableCheck[0].exists) {
      console.log('⚠️  Database already initialized. Use migrate-to-postgres.sql for full reset.');
      return;
    }

    console.log('📦 Initializing database schema...');
    
    // Initialize the database using the migration script
    const fs = require('fs');
    const path = require('path');
    const migrationSql = fs.readFileSync(
      path.join(__dirname, 'migrate-to-postgres.sql'), 
      'utf8'
    );

    // Split and execute statements (Neon doesn't support multi-statement queries)
    const statements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await sql(statement);
      } catch (error) {
        console.error(`Error executing statement: ${statement.substring(0, 50)}...`);
        console.error(error.message);
      }
    }

    console.log('✅ Database initialized successfully!');
    console.log('\n📊 Database statistics:');
    
    const userCount = await sql`SELECT COUNT(*) FROM users`;
    const animalCount = await sql`SELECT COUNT(*) FROM animals`;
    const adminCount = await sql`SELECT COUNT(*) FROM admin_users`;
    
    console.log(`- Users: ${userCount[0].count}`);
    console.log(`- Animals: ${animalCount[0].count}`);
    console.log(`- Admin users: ${adminCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run the initialization
initDatabase().catch(console.error);