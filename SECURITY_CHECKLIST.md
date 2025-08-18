# Security Checklist for Firebase Deployment

## Pre-Deployment Security Checklist

### 🔐 Environment Variables
- [ ] Generate strong `NEXTAUTH_SECRET` (32+ characters)
  ```bash
  openssl rand -base64 32
  ```
- [ ] Generate strong `CRON_SECRET`
  ```bash
  openssl rand -base64 32
  ```
- [ ] Change default `ADMIN_USERNAME` and `ADMIN_PASSWORD`
- [ ] Verify all Firebase credentials are correct
- [ ] Ensure `.env.production.local` is in `.gitignore`

### 🛡️ Firebase Security Rules
- [ ] Review `firestore.rules` for proper access control
- [ ] Ensure rules prevent unauthorized data access
- [ ] Test rules using Firebase Emulator Suite
- [ ] Deploy rules before making the app public

### 🔒 Authentication Configuration
- [ ] Configure authorized domains in Firebase Console
- [ ] Set up proper OAuth redirect URIs
- [ ] Enable only necessary authentication providers
- [ ] Configure password policies if using email/password auth

### 🌐 CORS and Domain Configuration
- [ ] Add production domain to Firebase authorized domains
- [ ] Configure CORS headers if needed
- [ ] Set up proper CSP (Content Security Policy) headers

### 📊 Monitoring and Alerts
- [ ] Enable Firebase Performance Monitoring
- [ ] Set up Firebase Crashlytics
- [ ] Configure budget alerts in Google Cloud Console
- [ ] Enable audit logging for sensitive operations

## Post-Deployment Security Tasks

### 🔍 Security Scanning
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Scan for exposed secrets in codebase
- [ ] Check for hardcoded credentials
- [ ] Verify no sensitive data in client-side code

### 🚨 Incident Response
- [ ] Document incident response procedures
- [ ] Set up alerts for suspicious activities
- [ ] Configure automatic backups
- [ ] Test disaster recovery procedures

### 📝 Regular Maintenance
- [ ] Schedule regular security audits
- [ ] Keep dependencies updated
- [ ] Rotate secrets periodically
- [ ] Review access logs regularly

## Firebase-Specific Security

### Firestore Security
```javascript
// Example secure rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Characters belong to users
    match /characters/{characterId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Battle history is read-only for users
    match /battles/{battleId} {
      allow read: if request.auth != null;
      allow write: if false; // Only server can write
    }
  }
}
```

### API Security
- [ ] Implement rate limiting
- [ ] Validate all inputs
- [ ] Use parameterized queries
- [ ] Implement proper error handling without exposing internals

### Client-Side Security
- [ ] Never trust client-side validation alone
- [ ] Sanitize all user inputs
- [ ] Use HTTPS everywhere
- [ ] Implement proper session management

## Emergency Contacts

Document your emergency procedures:
- Security incident contact: _______________
- Firebase support ticket: https://firebase.google.com/support
- Google Cloud support: _______________

## Security Resources

- [Firebase Security Checklist](https://firebase.google.com/docs/rules/basics)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)