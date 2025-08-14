# Admin API Guide

## Overview

The text-battle project includes admin API endpoints for managing users, characters, battles, and system settings. All admin endpoints require authentication as the admin user.

## Admin Credentials

The default admin user is pre-created in the memory store:
- **Email**: admin@example.com
- **Password**: admin123!

## Authentication

Admin endpoints use NextAuth for authentication. The admin check verifies that `session.user.email === "admin@example.com"`.

To access admin endpoints:
1. Login via the regular auth flow with admin@example.com
2. The session will grant access to admin endpoints

## Admin API Endpoints

### 1. Users Management

**GET /api/admin/users**
- Fetch all users with pagination
- Query parameters:
  - `page` (default: 1)
  - `limit` (default: 20)
  - `search` - Search by username or email

**PATCH /api/admin/users**
- Update user information
- Body: `{ userId, updates }`

**DELETE /api/admin/users**
- Delete a user and their characters
- Body: `{ userId }`

### 2. Characters Management

**GET /api/admin/characters**
- Fetch all characters sorted by ELO score
- Query parameters:
  - `page` (default: 1)
  - `limit` (default: 20)
  - `search` - Search by character name

**PATCH /api/admin/characters**
- Update character information
- Body: `{ characterId, updates }`

**DELETE /api/admin/characters**
- Delete a character
- Body: `{ characterId }`

### 3. Battles Management

**GET /api/admin/battles**
- Fetch all battles with filters
- Query parameters:
  - `page` (default: 1)
  - `limit` (default: 50)
  - `dateFrom` - Filter battles from date
  - `dateTo` - Filter battles to date
  - `characterId` - Filter battles by character

### 4. System Settings

**GET /api/admin/settings**
- Fetch all system settings
- Returns settings like battle limits, cooldowns, etc.

**PUT /api/admin/settings**
- Update system settings
- Body: Object with setting keys and values

### 5. Statistics

**GET /api/admin/stats**
- Get system statistics
- Returns:
  - `totalUsers` - Total registered users
  - `totalCharacters` - Total characters
  - `totalBattles` - Total battles fought
  - `activePlayers` - Players active in last 24 hours

## Admin Logging

All admin actions are logged in the memory store with:
- Admin ID
- Action type
- Details of the change
- Timestamp

## Testing Admin APIs

Use the provided test script:
```bash
node scripts/test-admin-api.js
```

This will verify that all endpoints correctly require admin authentication.

## Implementation Details

- All endpoints use `memoryStore` from `/lib/db/memory-store`
- Authentication is handled by `adminOnly` middleware from `/lib/admin-auth-nextauth`
- The middleware checks for `session.user.email === "admin@example.com"`
- All data operations are performed on the in-memory store

## Security Considerations

- Admin password should be changed in production
- Consider implementing proper password hashing
- Add rate limiting for admin endpoints
- Implement audit logging for all admin actions
- Consider adding role-based permissions for different admin levels