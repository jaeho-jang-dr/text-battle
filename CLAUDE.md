# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 자동 실행 에이전트

### Replit 배포 자동 감지
다음 키워드가 감지되면 자동으로 DevOps Replit Agent가 활성화됩니다:
- "replit 배포", "레플릿 배포", "replit에 배포"
- "deploy to replit", "replit deployment"
- "온라인 배포" + "무료", "웹 호스팅" + "간단한"

**자동 실행 시:**
1. 프로젝트 구조 분석
2. 필요한 Replit 설정 파일 생성 (.replit, replit.nix)
3. 데이터베이스 설정 가이드 제공
4. 배포 체크리스트 실행

**관련 파일:**
- `/agents/devops-replit-agent.md` - 메인 가이드
- `/agents/replit-quick-start.md` - 빠른 시작
- `/agents/replit-database-guide.md` - DB 설정
- `/agents/replit-deployment-templates.md` - 코드 템플릿

## Project Overview

Kid Text Battle is a child-friendly online text battle game for elementary school children (ages 7-10) featuring animal characters. The project uses SQLite for local development and includes bot opponents for unlimited practice battles.

## Core Commands

```bash
# Development (runs on port 3008)
npm run dev          # Start development server (http://localhost:3008)
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run Next.js linter
npm run typecheck    # TypeScript type checking
npm run format       # Format code with Prettier
npm run format:check # Check code formatting

# Database Testing & Verification
node check-db.js     # Check database contents and character stats
node test-sqlite.js  # Test SQLite database operations
node test-bot-battle.js  # Test bot battle functionality
node setup-admin.js  # Setup admin accounts
```

## Architecture Overview

### Database Layer (SQLite)
- **Location**: `kid-text-battle.db` (auto-created on first run via `/lib/db.ts`)
- **Key Tables**:
  - `users`: Accounts with token auth, warning tracking, suspension status
  - `characters`: Player characters with `is_bot` flag for AI opponents
  - `animals`: 16 pre-seeded animals (current/mythical/prehistoric)
  - `battles`: Battle history with AI judgments
  - `admin_users`: Admin accounts (default: admin/1234)
- **Bot System**: Characters with `is_bot=1` allow unlimited daily battles

### API Structure (Next.js 13 App Router)
All APIs in `/app/api/`:
- **Auth**: `/auth/login`, `/auth/verify` - 30-day token authentication
- **Characters**: `/characters` - CRUD with animal property formatting
- **Battles**: `/battles` - Battle creation with bot detection for unlimited battles
- **Admin**: `/admin/login` - Admin authentication endpoint
- **Leaderboard**: `/leaderboard` - Rankings with bot indicators

### Content Safety System (`/lib/filters/content-filter.ts`)
- Korean/English profanity filtering
- Ten Commandments violation detection
- 3-strike warning system (silent logging)
- Automatic user suspension on 3rd violation

### Frontend Architecture
- **Play Page**: Main game interface with BattleOpponents component
- **Admin Page**: Hidden panel accessed via unicorn (🦄) icon
- **Character Display**: Uses `character.animal.emoji` (not `animals`)
- **Bot Indicators**: Purple badges showing "🤖 대기 계정" and "무제한"

## MCP Server Integration

Two MCP servers are configured:
1. **Supabase MCP**: Database and auth operations (currently unused, SQLite preferred)
2. **Toss Payments MCP**: Payment integration (future feature)

Configuration in `mcp-config.json`, activation via `./activate-mcp-servers.sh`

## Child-Friendly Requirements

- **Error Messages**: Always friendly, never scary
- **Battle Results**: Positive messages for both winners and losers  
- **Content**: Animals only, no human characters
- **UI Language**: Korean-focused with encouraging tone

## Key Implementation Details

1. **Character Emoji Display**: Verify route returns `animal` (singular) not `animals`
2. **Bot Battle Logic**: Check `defender.is_bot` to skip daily limit
3. **Admin Access**: Bottom-right unicorn button with hover effects
4. **Daily Limits**: 10 battles/day per character (except vs bots)
5. **Character Limits**: Max 3 characters per account

## Common Development Tasks

```bash
# Add new bot characters
node add-bot-column.js

# Test specific features
node test-bot-battle-api.js  # Test bot battle API
node test-email-login.js     # Test email authentication
node test-emoji-display.js   # Verify character emojis

# Check battle errors
node check-battle-error.js
```

## Important Notes

- Database operations use synchronous better-sqlite3 (not async)
- All violations logged but not shown to children
- Server runs on port 3008 (not default 3000)
- Token auth stored in localStorage
- Window references must check `typeof window !== 'undefined'` for SSR