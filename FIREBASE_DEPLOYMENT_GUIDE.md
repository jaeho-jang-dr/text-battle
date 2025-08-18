# Firebase Deployment Guide

This guide will help you deploy the Text Battle Game to Firebase Hosting.

## Prerequisites

1. **Firebase CLI**: Install Firebase CLI globally
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project**: Create a Firebase project at [Firebase Console](https://console.firebase.google.com)

3. **Enable Services**: In your Firebase project, enable:
   - Authentication (Email/Password and any OAuth providers you need)
   - Cloud Firestore
   - Hosting

## Initial Setup

### 1. Configure Firebase Project

1. Update `.firebaserc` with your Firebase project ID:
   ```json
   {
     "projects": {
       "default": "your-actual-project-id"
     }
   }
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

### 2. Set Up Environment Variables

1. Copy `.env.example` to `.env.production.local`:
   ```bash
   cp .env.example .env.production.local
   ```

2. Fill in all the required values in `.env.production.local`:
   - Get Firebase config from Firebase Console > Project Settings > General
   - Get Firebase Admin SDK from Firebase Console > Project Settings > Service Accounts
   - Generate secure secrets for `NEXTAUTH_SECRET` and `CRON_SECRET`

### 3. Initialize NPCs and Database

Before first deployment, initialize the NPCs:
```bash
npm run init-npcs
```

## Deployment Methods

### Method 1: Manual Deployment

1. Build the project:
   ```bash
   npm run build:firebase
   ```

2. Deploy everything:
   ```bash
   npm run firebase:deploy
   ```

   Or deploy specific parts:
   ```bash
   # Deploy only hosting
   npm run firebase:deploy:hosting

   # Deploy only Firestore rules and indexes
   npm run firebase:deploy:rules
   ```

### Method 2: GitHub Actions (Automated)

1. Set up GitHub Secrets in your repository settings:
   - `FIREBASE_SERVICE_ACCOUNT`: Service account JSON (get from Firebase Console)
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `FIREBASE_TOKEN`: Run `firebase login:ci` to get this token
   - All `NEXT_PUBLIC_FIREBASE_*` variables from your `.env.production.local`

2. Push to the `main` branch to trigger automatic deployment

## Important Configuration

### 1. Update Production URLs

Replace all instances of `localhost:3009` with your production domain:

1. Update `NEXTAUTH_URL` in production environment variables
2. Update any hardcoded URLs in the codebase

### 2. Configure Authentication

1. In Firebase Console > Authentication > Settings:
   - Add your domain to Authorized domains
   - Configure OAuth redirect URIs for providers

2. For Kakao OAuth (if using):
   - Add `https://your-domain.com/api/auth/callback/kakao` to Kakao app settings

### 3. Set Up Daily Reset Cron Job

Since Firebase Hosting doesn't support cron jobs, you have options:

1. **Use Google Cloud Scheduler** (Recommended):
   ```bash
   gcloud scheduler jobs create http daily-reset \
     --schedule="0 0 * * *" \
     --uri="https://your-domain.com/api/battles/reset" \
     --http-method=POST \
     --headers="x-cron-secret=your-cron-secret"
   ```

2. **Use external cron service** like cron-job.org or EasyCron

3. **Use Firebase Functions** (requires upgrading firebase.json and creating functions)

### 4. Security Checklist

- [ ] Change all default passwords in `.env.production.local`
- [ ] Generate strong secrets for `NEXTAUTH_SECRET` and `CRON_SECRET`
- [ ] Review and update Firestore security rules in `firestore.rules`
- [ ] Enable Firebase App Check for additional security
- [ ] Set up monitoring and alerts in Firebase Console

## Testing Production Build Locally

To test the production build locally:
```bash
npm run firebase:serve
```

This will serve the static export on `http://localhost:5000`

## Troubleshooting

### Build Errors

If you encounter build errors related to dynamic routes:
1. Ensure all dynamic routes have `generateStaticParams` implemented
2. Check that API routes are not being called during build time

### Authentication Issues

1. Verify `NEXTAUTH_URL` matches your production domain
2. Check that all OAuth redirect URIs are correctly configured
3. Ensure Firebase Authentication is properly initialized

### API Routes Not Working

Since we're using static export, API routes won't work with Firebase Hosting alone. Options:
1. Use Firebase Functions for API routes
2. Deploy to a platform that supports Next.js API routes (Vercel, etc.)
3. Implement client-side Firebase SDK calls instead of API routes

## Monitoring

1. **Firebase Console**: Monitor usage, errors, and performance
2. **Google Cloud Console**: View detailed logs and metrics
3. **Set up alerts** for:
   - High error rates
   - Unusual traffic patterns
   - Database usage limits

## Maintenance

1. Regularly update dependencies:
   ```bash
   npm update
   npm audit fix
   ```

2. Monitor Firebase usage and costs
3. Review and rotate secrets periodically
4. Keep Firestore indexes optimized

## Support

For issues specific to:
- Firebase: Check [Firebase Documentation](https://firebase.google.com/docs)
- Next.js: Check [Next.js Documentation](https://nextjs.org/docs)
- This project: Check the project README and documentation