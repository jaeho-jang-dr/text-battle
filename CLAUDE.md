# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kid Text Battle is a child-friendly online text battle game for elementary school children (ages 7-10) featuring animal characters. The project has recently migrated from Supabase to SQLite for easier setup and deployment.

## Core Commands

```bash
# Development
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run Next.js linter
npm run typecheck    # TypeScript type checking
npm run format       # Format code with Prettier
npm run format:check # Check code formatting

# Testing
node test-sqlite.js  # Run SQLite database tests
node check-db.js     # Check database contents
```

## Architecture Overview

### Database Layer (SQLite)
- **Location**: `kid-text-battle.db` (auto-created on first run)
- **Initialization**: `/lib/db.ts` automatically creates all tables, seeds data, and configures settings
- **Key Features**:
  - Auto-initialization on app start
  - WAL mode for performance
  - Sample data creation (5 characters, admin account)
  - No external database setup required

### API Structure
All APIs follow Next.js 13 App Router conventions in `/app/api/`:
- **Auth**: `/auth/login`, `/auth/verify` - Token-based authentication
- **Characters**: `/characters` - Character CRUD with content filtering
- **Battles**: `/battles`, `/battles/judge` - Battle system with AI judgment
- **Leaderboard**: `/leaderboard` - Top 25 rankings with statistics

### Content Safety System
Located in `/lib/filters/content-filter.ts`:
- Profanity filtering (Korean/English)
- Ten Commandments violation detection
- Automatic warning system (3 strikes = suspension)
- All violations logged silently without alerting children

### Key Design Decisions
1. **SQLite over PostgreSQL**: Simplified deployment and zero configuration
2. **Token Authentication**: 30-day tokens for both guest and email users
3. **Character Limits**: Max 3 characters per account enforced at database level
4. **Battle Text**: 100 character limit with comprehensive filtering
5. **Daily Battle Limits**: 10 active battles per character per day

## Child-Friendly Requirements

- **Language**: All user-facing text must be friendly and encouraging
- **Errors**: Never show scary error messages - use friendly alternatives
- **Competition**: Emphasize fun over winning
- **Animals Only**: No human characters allowed
- **Battle Results**: Positive messages for both winners and losers

## Database Schema

The database auto-initializes with these core tables:
- `users`: Account management with warning tracking
- `characters`: Player characters linked to animals
- `animals`: 16 pre-seeded animals (current/mythical/prehistoric)
- `battles`: Battle history with AI judgments
- `leaderboard`: View combining character stats and rankings
- `admin_settings`: System configuration (default password: 1234)

## Admin Access

Hidden unicorn icon (🦄) in bottom-right corner of homepage leads to admin panel.

## Important Notes

- The project originally used Supabase but has been migrated to SQLite for easier setup
- All database operations are synchronous (better-sqlite3)
- Content filtering is applied silently - violations are logged but not shown to users
- The battle judgment AI endpoint simulates scoring based on creativity, appropriateness, and relevance