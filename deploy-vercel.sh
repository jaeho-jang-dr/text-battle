#!/bin/bash

# Vercel Deployment Script for Kid Text Battle
# This script helps deploy the app to Vercel with proper configuration

echo "🚀 Kid Text Battle - Vercel Deployment Script"
echo "============================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
    echo "✅ Vercel CLI installed"
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ .env.production not found!"
    echo ""
    echo "Please create .env.production with your production settings:"
    echo "1. Copy .env.production.example to .env.production"
    echo "2. Update DATABASE_URL with your PostgreSQL connection string"
    echo "3. Add your OPENAI_API_KEY"
    echo "4. Set secure SYSTEM_API_TOKEN and ADMIN_DEFAULT_PASSWORD"
    echo ""
    echo "Run: cp .env.production.example .env.production"
    exit 1
fi

# Load production environment variables
set -a
source .env.production
set +a

# Verify required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set in .env.production"
    echo "Please set up a PostgreSQL database (e.g., on neon.tech)"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  Warning: OPENAI_API_KEY not set"
    echo "Battle judgments will not work without this!"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Environment variables loaded"
echo ""

# Option to initialize database
echo "Do you want to initialize the production database?"
echo "(Only needed for first deployment or after database reset)"
read -p "Initialize database? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔧 Initializing production database..."
    node scripts/init-production-db.js
    if [ $? -ne 0 ]; then
        echo "❌ Database initialization failed"
        exit 1
    fi
    echo "✅ Database initialized"
    echo ""
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo ""

# Check if this is first deployment
if [ ! -d ".vercel" ]; then
    echo "📝 First time deployment detected"
    echo "Follow the Vercel prompts to set up your project"
    echo ""
    vercel
    
    echo ""
    echo "Now setting up environment variables..."
    
    # Set environment variables
    echo "Setting DATABASE_URL..."
    echo "$DATABASE_URL" | vercel env add DATABASE_URL production
    
    if [ ! -z "$OPENAI_API_KEY" ]; then
        echo "Setting OPENAI_API_KEY..."
        echo "$OPENAI_API_KEY" | vercel env add OPENAI_API_KEY production
    fi
    
    echo "Setting SYSTEM_API_TOKEN..."
    echo "${SYSTEM_API_TOKEN:-$(openssl rand -hex 32)}" | vercel env add SYSTEM_API_TOKEN production
    
    echo "Setting ADMIN_DEFAULT_PASSWORD..."
    echo "${ADMIN_DEFAULT_PASSWORD:-admin1234}" | vercel env add ADMIN_DEFAULT_PASSWORD production
    
    echo ""
    echo "✅ Environment variables configured"
    echo ""
fi

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "Next steps:"
    echo "1. Visit your deployed app URL"
    echo "2. Test guest login and character creation"
    echo "3. Access admin panel with the unicorn (🦄) button"
    echo "   Username: admin"
    echo "   Password: ${ADMIN_DEFAULT_PASSWORD:-check your env vars}"
    echo ""
    echo "🎉 Happy battling!"
else
    echo ""
    echo "❌ Deployment failed"
    echo "Check the error messages above and try again"
fi