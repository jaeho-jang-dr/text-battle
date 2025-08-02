# Vercel Deployment Checklist

## Pre-Deployment Setup

- [ ] **Create PostgreSQL Database**
  - Sign up at [neon.tech](https://neon.tech)
  - Create new database named `kid-text-battle`
  - Copy the connection string

- [ ] **Get OpenAI API Key**
  - Go to [platform.openai.com](https://platform.openai.com)
  - Create API key for battle judgments

- [ ] **Configure Environment**
  ```bash
  cp .env.production.example .env.production
  # Edit .env.production with your values
  ```

## Deployment Steps

1. [ ] **Initialize Database** (first time only)
   ```bash
   node scripts/init-production-db.js
   ```

2. [ ] **Run Deployment Script**
   ```bash
   ./deploy-vercel.sh
   ```
   
   Or manually:
   ```bash
   vercel --prod
   ```

3. [ ] **Set Environment Variables in Vercel**
   - DATABASE_URL
   - OPENAI_API_KEY  
   - SYSTEM_API_TOKEN
   - ADMIN_DEFAULT_PASSWORD

## Post-Deployment Verification

- [ ] **Test Basic Functions**
  - Homepage loads
  - Guest login works
  - Character creation works
  - Battle system works

- [ ] **Test Admin Panel**
  - Click unicorn (🦄) icon
  - Login with admin/[your-password]
  - Check admin functions

- [ ] **Monitor Performance**
  - Check Vercel dashboard
  - Monitor database queries
  - Review error logs

## Troubleshooting

If deployment fails:
1. Check `vercel logs`
2. Verify environment variables
3. Test database connection locally
4. Review build output

## Security Reminders

- [ ] Change default admin password
- [ ] Use strong API tokens
- [ ] Keep .env.production private
- [ ] Never commit secrets to Git