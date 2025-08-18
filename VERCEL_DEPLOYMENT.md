# Vercel Deployment Guide

## Quick Start

1. Fork or clone this repository
2. Connect to Vercel via GitHub/GitLab/Bitbucket
3. Add environment variables (see below)
4. Deploy!

## Environment Variables

Copy all variables from `.env.example.vercel` to your Vercel project settings:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable from `.env.example.vercel`
3. Make sure to set them for Production, Preview, and Development environments

### Required Variables:
- `NEXTAUTH_URL` - Set to `https://your-app.vercel.app`
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- All `NEXT_PUBLIC_FIREBASE_*` variables
- Firebase Admin SDK variables (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`)
- `ADMIN_USERNAME` and `ADMIN_PASSWORD`
- `CRON_SECRET` - For daily reset functionality

### Important Notes:
- For `FIREBASE_PRIVATE_KEY`, make sure to include the quotes and newlines exactly as shown
- The daily reset cron job runs at 00:00 UTC

## Build Settings

The following settings are automatically configured:
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

## Troubleshooting

If deployment fails:
1. Check build logs in Vercel dashboard
2. Ensure all required environment variables are set
3. Make sure Firebase project is properly configured
4. Verify that the Firebase service account has correct permissions