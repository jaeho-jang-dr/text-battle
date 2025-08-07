# Admin Panel Guide

## Overview
The text-battle game now includes a comprehensive admin panel for managing users, characters, battles, and game settings.

## Accessing the Admin Panel
1. Navigate to the main game page
2. Look for the hidden unicorn emoji (🦄) in the bottom-right corner
3. Click on it to go to `/admin`
4. Login with the default credentials:
   - Username: `admin`
   - Password: `1234`

## Features

### 1. Users Management
- View all registered and guest users
- Search users by username or email
- Delete user accounts
- View user statistics (number of characters, registration date)

### 2. Characters Management
- View all player and NPC characters
- Edit character stats (ELO score, wins, losses)
- Delete characters
- Search characters by name
- Sort by ELO score

### 3. Battle Logs
- View all battle history
- Filter by date range
- View detailed battle logs
- See battle outcomes and scores

### 4. Game Settings
- Configure daily battle limits
- Set defensive battle limits
- Adjust attack battle limits
- Modify base score values
- Change ELO multiplier

### 5. Statistics Dashboard
- Total users (registered vs guests)
- Active users in the last 7 days
- Total characters (player vs NPC)
- Battle statistics (total, today, average per day)
- Top 10 characters by ELO score

## Security Features
- Admin-only authentication using JWT tokens
- Session validation on all admin routes
- Audit logging for all admin actions
- Secure cookie-based session management

## Database Setup
Make sure to run the admin schema SQL to create the necessary tables:

```sql
-- Run the admin-schema.sql file in your database
```

## Installation
1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```env
JWT_SECRET=your-secret-key-here
```

3. Run the application:
```bash
npm run dev
```

## API Endpoints

### Admin Authentication
- `POST /api/admin/login` - Admin login
- `GET /api/admin/verify` - Verify admin session
- `POST /api/admin/logout` - Admin logout

### Admin Operations
- `GET/PATCH/DELETE /api/admin/users` - User management
- `GET/PATCH/DELETE /api/admin/characters` - Character management
- `GET /api/admin/battles` - Battle logs
- `GET/PUT /api/admin/settings` - Game settings
- `GET /api/admin/stats` - Game statistics

## Best Practices
1. Change the default admin password immediately after setup
2. Regularly review audit logs
3. Back up your database before making bulk changes
4. Monitor active user statistics to understand game engagement