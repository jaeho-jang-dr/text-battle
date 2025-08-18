// Application configuration with environment variable handling

export const config = {
  // Base URL for the application
  baseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3009',
  
  // API endpoints
  api: {
    baseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3009',
  },
  
  // Firebase configuration
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  
  // Feature flags
  features: {
    // Enable/disable features based on environment
    kakaoAuth: Boolean(process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET),
    openAI: Boolean(process.env.OPENAI_API_KEY),
  },
  
  // Security
  security: {
    cronSecret: process.env.CRON_SECRET,
  },
  
  // Development vs Production
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Helper function to get absolute URL
export function getAbsoluteUrl(path: string = ''): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In the browser, use relative URLs
  if (typeof window !== 'undefined') {
    return `/${cleanPath}`;
  }
  
  // On the server, use absolute URLs
  return `${config.baseUrl}/${cleanPath}`;
}