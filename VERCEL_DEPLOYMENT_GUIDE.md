# Vercel Deployment Guide for Kid Text Battle

This guide will walk you through deploying the Kid Text Battle app to Vercel with PostgreSQL.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install with `npm i -g vercel`
3. **PostgreSQL Database**: We recommend [Neon.tech](https://neon.tech) (free tier available)
4. **OpenAI API Key**: For battle judgments (get from [platform.openai.com](https://platform.openai.com))

## Step 1: Set Up PostgreSQL Database

### Option A: Using Neon.tech (Recommended)

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project with these settings:
   - **Project name**: kid-text-battle
   - **Database name**: kid-text-battle
   - **Region**: Choose closest to your users (e.g., Seoul for Korea)
3. Copy the connection string from the dashboard
   - It looks like: `postgresql://username:password@host.neon.tech/database?sslmode=require`

### Option B: Using Vercel Postgres

1. In Vercel dashboard, go to Storage → Create Database → Postgres
2. Follow the setup wizard
3. Copy the `POSTGRES_URL` from the environment variables

## Step 2: Configure Environment Variables

1. Copy `.env.production.example` to `.env.production`:
   ```bash
   cp .env.production.example .env.production
   ```

2. Edit `.env.production` and update:
   ```env
   USE_SQLITE=false
   DATABASE_URL=your-postgresql-connection-string
   OPENAI_API_KEY=your-openai-api-key
   SYSTEM_API_TOKEN=generate-a-secure-token-here
   ADMIN_DEFAULT_PASSWORD=choose-a-secure-admin-password
   NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
   ```

3. Generate a secure token:
   ```bash
   openssl rand -hex 32
   ```

## Step 3: Initialize Production Database

Run the initialization script to set up tables and initial data:

```bash
node scripts/init-production-db.js
```

This will:
- Create all necessary tables
- Insert initial animal data
- Set up admin accounts
- Create indexes for performance

## Step 4: Deploy to Vercel

### First-time Deployment

1. Run the Vercel CLI:
   ```bash
   vercel
   ```

2. Follow the prompts:
   - Link to existing project? **No** (first time)
   - What's your project's name? **kid-text-battle** (or your choice)
   - In which directory is your code located? **./** (current directory)
   - Want to override the settings? **No**

3. Set environment variables in Vercel:
   ```bash
   # Set each variable
   vercel env add DATABASE_URL production
   vercel env add OPENAI_API_KEY production
   vercel env add SYSTEM_API_TOKEN production
   vercel env add ADMIN_DEFAULT_PASSWORD production
   ```

4. Deploy to production:
   ```bash
   vercel --prod
   ```

### Subsequent Deployments

Just run:
```bash
vercel --prod
```

## Step 5: Verify Deployment

1. **Check the deployment URL**: Vercel will provide a URL like `https://kid-text-battle.vercel.app`

2. **Test basic functionality**:
   - Visit the homepage
   - Try guest login
   - Create a character
   - Start a battle

3. **Access admin panel**:
   - Click the unicorn (🦄) icon at bottom-right
   - Login with username: `admin`, password: your `ADMIN_DEFAULT_PASSWORD`

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `USE_SQLITE` | Must be `false` for production | `false` |
| `OPENAI_API_KEY` | OpenAI API key for battle judgments | `sk-...` |
| `SYSTEM_API_TOKEN` | API authentication token | `your-secure-token` |
| `ADMIN_DEFAULT_PASSWORD` | Admin panel password | `secure-password` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_NAME` | App display name | `동물 친구들 배틀` |
| `NEXT_PUBLIC_APP_URL` | Production URL | Auto-detected |

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

1. **Check DATABASE_URL format**:
   ```
   postgresql://username:password@host:port/database?sslmode=require
   ```

2. **Verify SSL mode**: Neon.tech requires `?sslmode=require`

3. **Test connection locally**:
   ```bash
   node scripts/init-production-db.js
   ```

### Build Failures

1. **Check build logs**: `vercel logs`

2. **Common issues**:
   - Missing dependencies: Run `npm install`
   - TypeScript errors: Run `npm run typecheck`
   - Environment variables not set in Vercel

### Runtime Errors

1. **Check function logs**:
   ```bash
   vercel logs --prod
   ```

2. **Enable debug mode** (temporarily):
   - Add `DEBUG=true` environment variable
   - Check browser console for errors

## Maintenance

### Update Bot Characters

After deployment, you can add bot characters:

1. Access admin panel
2. Create bot accounts
3. Or run migration scripts

### Monitor Usage

1. **Vercel Dashboard**: Monitor bandwidth, function calls
2. **Database Dashboard**: Check query performance, storage
3. **OpenAI Usage**: Monitor API usage and costs

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong SYSTEM_API_TOKEN
- [ ] Enable Vercel authentication (optional)
- [ ] Set up rate limiting (optional)
- [ ] Review content filters

## Support

If you encounter issues:

1. Check the [project README](README.md)
2. Review [CLAUDE.md](CLAUDE.md) for architecture details
3. Check Vercel and database logs

---

**Important**: Remember to keep your production environment variables secure and never commit them to Git!