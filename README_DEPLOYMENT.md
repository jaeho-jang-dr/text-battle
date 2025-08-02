# Kid Text Battle - Deployment Instructions

## Quick Start

**Ready to deploy?** Follow these 3 simple steps:

### 1. Set Up Database (5 minutes)
Sign up for free PostgreSQL at [neon.tech](https://neon.tech) and create a database.

### 2. Configure Environment (2 minutes)
```bash
cp .env.production.example .env.production
# Edit .env.production with your database URL and API keys
```

### 3. Deploy (5 minutes)
```bash
./deploy-vercel.sh
```

That's it! Your app will be live in ~5 minutes.

---

## Detailed Deployment Options

### Option A: Automated Deployment (Recommended)

Use our deployment script for the easiest experience:

```bash
# First time setup
cp .env.production.example .env.production
# Edit .env.production with your credentials

# Deploy
./deploy-vercel.sh
```

The script will:
- Check prerequisites
- Initialize your database
- Deploy to Vercel
- Set up environment variables

### Option B: Manual Deployment

1. **Database Setup**
   ```bash
   node scripts/init-production-db.js
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL production
   vercel env add OPENAI_API_KEY production
   vercel env add SYSTEM_API_TOKEN production
   vercel env add ADMIN_DEFAULT_PASSWORD production
   ```

## Required Services

### 1. PostgreSQL Database
- **Provider**: [Neon.tech](https://neon.tech) (free tier available)
- **Alternative**: Vercel Postgres
- **Connection Format**: `postgresql://user:pass@host/database?sslmode=require`

### 2. OpenAI API
- **Provider**: [OpenAI](https://platform.openai.com)
- **Purpose**: AI battle judgments
- **Cost**: ~$0.002 per battle

### 3. Vercel Hosting
- **Provider**: [Vercel](https://vercel.com)
- **Free Tier**: Sufficient for most use cases
- **Region**: Seoul (icn1) recommended for Korean users

## Environment Variables

Create `.env.production` with:

```env
# Database (PostgreSQL required for Vercel)
USE_SQLITE=false
DATABASE_URL=postgresql://...

# AI Battle Judgments
OPENAI_API_KEY=sk-...

# Security
SYSTEM_API_TOKEN=generate-secure-token
ADMIN_DEFAULT_PASSWORD=choose-secure-password

# App Config
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=동물 친구들 배틀
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Post-Deployment

### Access Admin Panel
1. Go to your deployed app
2. Click the unicorn (🦄) icon at bottom-right
3. Login: `admin` / `your-password`

### Monitor Your App
- **Vercel Dashboard**: Performance, logs, analytics
- **Neon Dashboard**: Database metrics
- **OpenAI Usage**: API consumption

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Check DATABASE_URL format
- Ensure `?sslmode=require` is included
- Verify database exists

**Build Failed**
- Run `npm run typecheck` locally
- Check `vercel logs`
- Ensure all dependencies installed

**Admin Login Not Working**
- Check ADMIN_DEFAULT_PASSWORD is set
- Try re-initializing database
- Check browser console for errors

### Getting Help

1. Check [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) for detailed instructions
2. Review [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) 
3. Check deployment logs: `vercel logs --prod`

## Cost Estimates

For 1000 daily active users:
- **Vercel**: Free tier sufficient
- **Neon PostgreSQL**: Free tier (3GB storage)
- **OpenAI**: ~$2-5/month (depends on battles)

Total: **~$5/month** or less

---

**Need help?** The deployment script handles most complexity. Just run `./deploy-vercel.sh` and follow the prompts!